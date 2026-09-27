"""Synthesize the whole soundtrack: original music, brick SFX, narration bus -> audio/mix.wav.

Everything is generated from code (numpy); no samples, no licensing. Timings come from
src/data/timeline.json and audio/sfx_events.json (exported from the scenes by scripts/export-sfx.ts).
"""
import json
import pathlib

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
TL = json.loads((ROOT / "src/data/timeline.json").read_text())
FPS = TL["fps"]
VOICE_DIR = "audio/voice"
DUR = TL["total"] / FPS + 1.5
N = int(DUR * SR)
rng = np.random.default_rng(7)

BPM = 100
BEAT = 60 / BPM
BAR = BEAT * 4
MOMENTS = TL["moments"]
# Shift the bar grid so a downbeat lands exactly on the climax (if the story has one).
if MOMENTS["climax"] is not None:
    _c = MOMENTS["climax"] / FPS
    DROP_BAR = int(_c // BAR)
    OFFSET = _c - DROP_BAR * BAR
else:
    DROP_BAR, OFFSET = None, 0.0
END_BAR = int(round((MOMENTS["endCard"] / FPS - OFFSET) / BAR))  # final chord on the end card


CH = TL["chapters"]


def sec(frame):
    return frame / FPS


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_exp(n, decay, attack=0.002):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def add(buf, x, t, gain=1.0, pan=0.0):
    """Mix mono x into stereo buf at time t (s) with constant-power pan."""
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(x), 0] += x * gain * l
    buf[i : i + len(x), 1] += x * gain * r


def reverb(buf, seconds=1.8, wet=0.18, seed=3):
    n = int(seconds * SR)
    r = np.random.default_rng(seed)
    out = buf.copy()
    for c in range(2):
        ir = r.standard_normal(n) * np.exp(-np.arange(n) / (SR * seconds / 6.5))
        ir = lp(ir, 6000)
        ir /= np.sqrt(np.sum(ir**2))
        out[:, c] = buf[:, c] + wet * fftconvolve(buf[:, c], ir)[: len(buf)]
    return out


# ------------------------------------------------------------------ instruments
def marimba(m, dur=0.5, vel=1.0):
    n = int(max(dur, 0.6) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * env_exp(n, 0.32) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * env_exp(n, 0.05)
    x += 0.06 * np.sin(2 * np.pi * f * 9.9 * t) * env_exp(n, 0.015)
    return x * vel


def glock(m, vel=1.0):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * env_exp(n, d) for k, a, d in [(1, 1, 0.9), (2.76, 0.35, 0.3), (5.4, 0.15, 0.12)])
    return x * vel * 0.6


def pluck(m, dur, vel=1.0):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    saw = 2 * ((f * t) % 1) - 1
    x = lp(saw, 2200) * env_exp(n, 0.22)
    return x * vel * 0.5


def pad(notes, dur, vel=1.0):
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.08):
            f = mtof(m + det)
            x += 2 * ((f * t + rng.random()) % 1) - 1
    x = lp(x / (len(notes) * 3), 1400)
    a = np.clip(t / 0.35, 0, 1) * np.clip((dur + 0.8 - t) / 0.8, 0, 1)
    return x * a * vel


def bass(m, dur, vel=1.0):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = np.tanh(1.8 * np.sin(2 * np.pi * f * t)) * env_exp(n, dur * 0.9, 0.004)
    return lp(x, 900) * vel


def kick(vel=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(n, 0.16) * vel


def snare(vel=1.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 1200, 7000) * env_exp(n, 0.07)
    tone = np.sin(2 * np.pi * 190 * t) * env_exp(n, 0.04)
    return (nz * 0.8 + tone * 0.5) * vel


def clap(vel=1.0):
    n = int(0.3 * SR)
    x = np.zeros(n)
    for k, d in enumerate((0, 0.011, 0.022)):
        i = int(d * SR)
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 900, 5000) * env_exp(m, 0.02 if k < 2 else 0.09)
    return x * vel * 0.7


def hat(vel=1.0, open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp(rng.standard_normal(n), 7000) * env_exp(n, 0.09 if open_ else 0.018) * vel * 0.35


def crash(vel=1.0):
    n = int(2.2 * SR)
    return hp(rng.standard_normal(n), 4500) * env_exp(n, 0.7, 0.001) * vel * 0.45


def riser(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    seg = SR // 20
    for i in range(0, n, seg):
        c = 400 + 7000 * (i / n) ** 2
        out[i : i + seg] = bp(nz[i : i + seg], c * 0.7, min(c * 1.4, 20000))
    f = 200 + 600 * (t / length) ** 2
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return (out * 0.5 + lp(saw, 3000) * 0.25) * (t / length) ** 2


# ------------------------------------------------------------------ music
CHORDS = {  # root midi, chord tones
    "C": (48, [60, 64, 67]),
    "G": (43, [59, 62, 67]),
    "Am": (45, [60, 64, 69]),
    "F": (41, [60, 65, 69]),
}
LOOP = ["C", "G", "Am", "F"]
LEAD = {
    "C": [(0, 79, 2), (2, 76, 2), (4, 79, 1), (5, 81, 1), (6, 79, 2)],
    "G": [(0, 79, 2), (2, 74, 2), (4, 79, 1), (5, 81, 1), (6, 83, 2)],
    "Am": [(0, 84, 3), (3, 83, 1), (4, 81, 2), (6, 76, 2)],
    "F": [(0, 77, 2), (2, 76, 2), (4, 74, 2), (6, 72, 2)],
}
ARP = [0, 1, 2, 1, 2, 1, 0, 1]


def level_at(t):
    """Arrangement intensity: sparse intro, groove, fuller middle, a break into the climax, big finish."""
    n = len(CH)
    marks = [(0.0, 0.0)]
    if n > 1:
        marks.append((sec(CH[1]["start"]), 1.0))
    if n > 3:
        marks.append((sec(CH[round(n * 0.45)]["start"]), 2.0))
    if DROP_BAR is not None:
        drop = OFFSET + DROP_BAR * BAR
        climax_end = next(sec(c["start"] + c["dur"]) for c in CH if c["start"] <= MOMENTS["climax"] < c["start"] + c["dur"])
        marks += [(drop - 3.6, 0.5), (drop, 3.0), (climax_end, 2.0)]
    marks.append((sec(CH[-1]["start"]), 1.5))
    marks.append((OFFSET + END_BAR * BAR, -1.0))
    lv = 0
    for m, v in sorted(marks):
        if t >= m - 1e-6:
            lv = v
    return lv


def build_music():
    buf = np.zeros((N, 2))
    eighth = BEAT / 2
    for bar in range(0, END_BAR + 1):
        t0 = OFFSET + bar * BAR
        lv = level_at(t0 + 0.01)
        name = LOOP[(bar + 2) % 4]
        root, tones = CHORDS[name]
        if bar == END_BAR:  # final chord rings out
            add(buf, pad([48, 60, 64, 67, 72], 3.5, 0.55), t0, 1.0)
            for k, m in enumerate([72, 76, 79, 84]):
                add(buf, glock(m, 0.7), t0 + k * 0.09, 0.8, pan=-0.3 + k * 0.2)
            add(buf, bass(36, 3.0, 0.8), t0, 0.9)
            add(buf, crash(0.5), t0, 0.7)
            continue
        # pad always (soft), louder in chorus
        add(buf, pad(tones, BAR, 0.28 if lv < 3 else 0.42), t0, 1.0)
        if bar == 0:
            for k, m in enumerate([72, 76, 79, 84, 88]):
                add(buf, glock(m, 0.5), t0 + 0.35 + k * 0.22, 0.7, pan=0.4 - k * 0.2)
        if lv >= 1 or (lv == 0 and bar >= 1):
            for i in range(8):
                m = tones[ARP[i]] + (12 if lv >= 2 else 0)
                vel = 0.55 if i % 2 == 0 else 0.38
                add(buf, marimba(m, 0.4, vel), t0 + i * eighth, 0.55, pan=-0.35 if i % 2 else 0.35)
        if lv >= 1:
            add(buf, bass(root, BEAT * 1.8), t0, 0.5)
            add(buf, bass(root, BEAT * 1.8), t0 + 2 * BEAT, 0.45)
            add(buf, kick(), t0, 0.55)
            add(buf, kick(0.8), t0 + 2 * BEAT, 0.5)
            for i in range(8):
                add(buf, hat(0.9 if i % 2 else 0.5), t0 + i * eighth, 0.6, pan=0.25)
        if lv >= 2:
            add(buf, clap(), t0 + BEAT, 0.45)
            add(buf, clap(), t0 + 3 * BEAT, 0.45)
            add(buf, bass(root, BEAT * 0.4), t0 + 3.5 * BEAT, 0.35)
        if lv >= 3:
            add(buf, kick(), t0 + 1.5 * BEAT, 0.35)
            add(buf, kick(), t0 + 3 * BEAT, 0.4)
            for (o8, m, l8) in LEAD[name]:
                add(buf, pluck(m, l8 * eighth, 0.9), t0 + o8 * eighth, 0.5, pan=0.05)
                add(buf, glock(m + 12, 0.35), t0 + o8 * eighth, 0.35, pan=-0.2)
            add(buf, hat(1.0, open_=True), t0 + 3.5 * BEAT, 0.5, pan=-0.2)
    if DROP_BAR is None:
        return reverb(buf, 1.6, 0.16) * 0.4
    # riser + snare roll into the climax
    t_drop = OFFSET + DROP_BAR * BAR
    add(buf, riser(3.4), t_drop - 3.4, 0.55)
    k = 0
    t = t_drop - 2 * BAR / 2
    while t < t_drop - 0.02:
        step = BEAT / (2 if t < t_drop - BEAT * 2 else 4)
        add(buf, snare(0.3 + 0.7 * (1 - (t_drop - t) / BAR)), t, 0.35, pan=0.1 * (-1) ** k)
        t += step
        k += 1
    add(buf, crash(1.0), t_drop, 0.8)
    add(buf, kick(1.2), t_drop, 0.8)
    buf = reverb(buf, 1.6, 0.16)
    return buf * 0.4


# ------------------------------------------------------------------ sfx
def brick_click(pitch=1.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    tr = bp(rng.standard_normal(n), 2500 * pitch, min(9000 * pitch, 20000)) * env_exp(n, 0.004, 0.0003)
    body = np.sin(2 * np.pi * 1450 * pitch * t) * env_exp(n, 0.018, 0.0005) * 0.5
    thump = np.sin(2 * np.pi * 180 * pitch * t) * env_exp(n, 0.03) * 0.35
    # the "snap": a second tiny transient 6ms later
    snap = np.zeros(n)
    i = int(0.006 * SR)
    snap[i:] = bp(rng.standard_normal(n - i), 3000, 12000) * env_exp(n - i, 0.003) * 0.6
    return tr + body + thump + snap


def whoosh(length=0.9):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    seg = SR // 40
    for i in range(0, n, seg):
        p = i / n
        c = 300 + 2600 * np.sin(np.pi * p)
        out[i : i + seg] = bp(nz[i : i + seg], c * 0.6, c * 1.5)
    return out * np.sin(np.pi * t / length) ** 2 * 0.9


def bell_dingdong():
    x = np.zeros(int(1.6 * SR))
    for k, m in enumerate([76, 72]):
        g = glock(m, 1.0)
        i = int(k * 0.35 * SR)
        x[i : i + len(g)] += g[: len(x) - i]
    return x


def ping():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 2100 * t) * env_exp(n, 0.03)
    x[int(0.12 * SR) :] += 0.4 * x[: n - int(0.12 * SR)]
    return x * 0.4


def bus_rumble(length=1.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 48 + 10 * np.sin(2 * np.pi * 0.6 * t)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    x = lp(saw, 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t))
    e = np.clip(t / 0.4, 0, 1) * np.clip((length - t) / 0.5, 0, 1)
    air = bp(rng.standard_normal(int(0.35 * SR)), 2000, 8000) * env_exp(int(0.35 * SR), 0.12) * 0.5
    out = x * e * 0.8
    i = n - len(air)
    out[i:] += air
    return out


def elevator():
    x = glock(88, 0.9)
    n = int(0.9 * SR)
    slide = lp(rng.standard_normal(n), 900) * np.sin(np.pi * np.arange(n) / n) * 0.35
    out = np.zeros(max(len(x), n + int(0.25 * SR)))
    out[: len(x)] += x
    out[int(0.25 * SR) : int(0.25 * SR) + n] += slide
    return out


def flutter_flag():
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 400, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * t / 0.8) * 0.5


def thud():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 55 + 60 * np.exp(-t / 0.05)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.18) + lp(rng.standard_normal(n), 500) * env_exp(n, 0.05) * 0.5) * 0.9


def sparkle():
    x = np.zeros(int(2.0 * SR))
    for k, m in enumerate([84, 88, 91, 96]):
        g = glock(m, 0.8)
        i = int(k * 0.07 * SR)
        x[i : i + len(g)] += g[: len(x) - i]
    return x


def plane(length=2.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 190 + 25 * np.cos(np.pi * t / length)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    x = lp(saw, 700) * 0.4 + bp(rng.standard_normal(n), 300, 1500) * 0.3
    return x * np.sin(np.pi * t / length) ** 1.5 * 0.7


def applause(length=2.6, density=260):
    n = int(length * SR)
    x = np.zeros(n)
    c = brick_click(0.55)[: int(0.02 * SR)]
    for _ in range(int(density * length)):
        i = rng.integers(0, n - len(c))
        x[i : i + len(c)] += c * rng.uniform(0.2, 1.0)
    t = np.arange(n) / SR
    e = np.clip(t / 0.25, 0, 1) * np.clip((length - t) / 1.2, 0, 1)
    return bp(x, 700, 6000) * e * 0.45


def cheer(length=2.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(10):  # crowd "whoa": noisy vowel formants
        f0 = rng.uniform(170, 330)
        vib = 1 + 0.02 * np.sin(2 * np.pi * rng.uniform(4, 7) * t)
        saw = 2 * ((np.cumsum(f0 * vib) / SR) % 1) - 1
        v = bp(saw, 500, 1200) + 0.6 * bp(saw, 1800, 2600)
        x += v * rng.uniform(0.5, 1.0)
    x = x / 10 + bp(rng.standard_normal(n), 400, 3000) * 0.25
    e = np.clip(t / 0.3, 0, 1) * np.clip((length - t) / 1.4, 0, 1)
    return (x * e * 0.55) + applause(length, 320)


def confetti_pop():
    n = int(0.25 * SR)
    x = bp(rng.standard_normal(n), 300, 6000) * env_exp(n, 0.03) * 1.2
    tail = np.zeros(int(1.4 * SR))
    c = brick_click(1.8)[: int(0.015 * SR)]
    for _ in range(90):
        i = rng.integers(int(0.1 * SR), len(tail) - len(c))
        tail[i : i + len(c)] += c * rng.uniform(0.05, 0.3)
    out = np.zeros(len(tail))
    out[:n] += x
    return out + tail


def typing(length=2.6):
    n = int(length * SR)
    x = np.zeros(n)
    t = 0.0
    while t < length - 0.1:
        c = brick_click(rng.uniform(1.6, 2.2))[: int(0.03 * SR)] * rng.uniform(0.3, 0.7)
        i = int(t * SR)
        x[i : i + len(c)] += c
        t += rng.uniform(0.06, 0.16)
    return hp(x, 1500) * 0.5


def bleep():
    x = np.zeros(int(0.5 * SR))
    for k, f in enumerate([880, 1320, 990]):
        n = int(0.09 * SR)
        t = np.arange(n) / SR
        sq = np.sign(np.sin(2 * np.pi * f * t)) * env_exp(n, 0.05)
        i = int(k * 0.11 * SR)
        x[i : i + n] += lp(sq, 4000) * 0.25
    return x


def build_sfx():
    ev = json.loads((ROOT / "audio/sfx_events.json").read_text())["events"]
    buf = np.zeros((N, 2))
    clicks_per_frame = {}
    for e in ev:
        if e["type"] == "click":
            clicks_per_frame[e["t"]] = clicks_per_frame.get(e["t"], 0) + 1
    for e in ev:
        t = sec(e["t"])
        g = e.get("gain", 1.0)
        kind = e["type"]
        pan = float(rng.uniform(-0.4, 0.4))
        if kind == "click":
            dense = clicks_per_frame[e["t"]]
            add(buf, brick_click(rng.uniform(0.85, 1.25)), t + rng.uniform(0, 0.02), 0.32 * g / np.sqrt(dense), pan)
        elif kind == "step":
            add(buf, brick_click(0.7), t, 0.45, pan * 0.5)
        elif kind == "pop":
            n = int(0.16 * SR)
            tt = np.arange(n) / SR
            f = 380 + 700 * (1 - np.exp(-tt / 0.03))
            x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.05) * 0.5
            add(buf, x, t, 0.5 * g, pan)
            add(buf, brick_click(0.75), t + 0.01, 0.35 * g, pan)
        elif kind == "whoosh":
            add(buf, whoosh(1.0), t - 0.15, 0.32 * g, 0.0)
        elif kind == "bus":
            add(buf, bus_rumble(1.9), t, 0.55, -0.3)
        elif kind == "ding":
            add(buf, bell_dingdong(), t, 0.5, 0.15)
        elif kind == "ping":
            add(buf, ping(), t, 0.5 * g, 0.2)
        elif kind == "elevator":
            add(buf, elevator(), t, 0.45, 0.3)
        elif kind == "flag":
            add(buf, flutter_flag(), t, 0.5, 0.3)
        elif kind == "thud":
            add(buf, thud(), t, 0.7, -0.2)
        elif kind == "sparkle":
            add(buf, sparkle(), t, 0.4, 0.25)
        elif kind == "plane":
            add(buf, plane(), t, 0.45, 0.0)
        elif kind == "confetti":
            add(buf, confetti_pop(), t, 0.7, 0.0)
        elif kind == "cheer":
            add(buf, cheer(), t, 0.55, 0.0)
        elif kind == "applause":
            add(buf, applause(2.4), t, 0.6 * g, 0.0)
        elif kind == "typing":
            add(buf, typing(2.4), t, 0.35 * g, -0.2)
        elif kind == "bleep":
            add(buf, bleep(), t, 0.5, 0.3)
    return reverb(buf, 0.8, 0.08, seed=5)


# ------------------------------------------------------------------ voice
def load_mono(p):
    sr, x = wavfile.read(p)
    x = x.astype(np.float32) / (32768 if x.dtype == np.int16 else 1)
    if x.ndim > 1:
        x = x.mean(axis=1)
    assert sr == SR, (p, sr)
    return x


def compress(x, thresh=0.25, ratio=3.0):
    env = np.sqrt(np.maximum(lp(x**2, 20), 0) + 1e-9)
    gain = np.where(env > thresh, (thresh + (env - thresh) / ratio) / env, 1.0)
    return x * gain


def build_voice():
    buf = np.zeros((N, 2))
    for c in TL["chapters"]:
        v = c["voice"]
        x = hp(load_mono(ROOT / VOICE_DIR / f"{c['id']}.wav"), 90)
        x = compress(x / (np.max(np.abs(x)) + 1e-9) * 0.7)
        add(buf, x, sec(v["start"]), 1.0)
        if c.get("aside"):
            y = load_mono(ROOT / VOICE_DIR / f"{c['id']}_aside.wav")
            y = compress(y / (np.max(np.abs(y)) + 1e-9) * 0.65)
            add(buf, y, sec(c["aside"]["start"]), 0.95, 0.15)
    return reverb(buf, 0.5, 0.05, seed=9)


def main():
    music = build_music()
    sfx = build_sfx()
    voice = build_voice()
    # duck music under narration
    venv = np.sqrt(np.maximum(lp(np.mean(voice**2, axis=1), 12), 0) + 1e-9)
    la = int(0.15 * SR)  # look-ahead: start ducking before the first syllable
    venv = np.concatenate([venv[la:], np.zeros(la)])
    venv = maximum_filter1d(venv, size=int(0.3 * SR))
    duck = 1.0 - 0.78 * np.clip(venv / 0.05, 0, 1)
    duck = lp(duck, 8)
    music *= duck[:, None]
    # brick clicks also step back while someone is talking
    sfx *= (1.0 - 0.5 * lp(np.clip(venv / 0.05, 0, 1), 8))[:, None]
    mix = music * 1.0 + sfx * 1.1 + voice * 1.0
    fade = int(1.2 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mix /= max(1e-9, np.max(np.abs(mix))) / 0.9
    out = ROOT / "audio"
    for name, b in [("music", music), ("sfx", sfx), ("voice_bus", voice), ("mix", mix)]:
        b = b / max(1e-9, np.max(np.abs(b))) * 0.9 if name != "mix" else b
        wavfile.write(out / f"{name}.wav", SR, (np.clip(b, -1, 1) * 32767).astype(np.int16))
    print("wrote", DUR, "s")


if __name__ == "__main__":
    main()
