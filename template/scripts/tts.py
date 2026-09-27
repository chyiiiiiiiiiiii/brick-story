"""Narration: story.json -> audio/voice/<scene>.wav (+ <scene>_aside.wav). Cached: unchanged lines are skipped.

Main voice: edge-tts (story.voice.name / rate; a scene can override "rate").
Sidekick voice: story.sidekick.voice = "say:<macOS voice>" or an edge-tts voice; always given a small-robot timbre.
A WAV in audio/voice/ without a matching .key file is treated as the user's own recording and kept.
Args: optional scene ids to force-regenerate.
"""
import json, pathlib, subprocess, sys
import numpy as np
from scipy.io import wavfile

root = pathlib.Path(__file__).resolve().parent.parent
story = json.loads((root / "story.json").read_text())
out = root / "audio/voice"
out.mkdir(parents=True, exist_ok=True)
force = set(sys.argv[1:])
EDGE = str(root / ".venv/bin/edge-tts")


def speak_edge(text, voice, rate, wav):
    mp3 = wav.with_suffix(".mp3")
    subprocess.run([EDGE, "--voice", voice, f"--rate={rate}", "--text", text, "--write-media", str(mp3)], check=True, capture_output=True)
    # trim trailing silence so the scene timing matches the last spoken sound
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-af",
                    "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.05",
                    "-ar", "48000", "-ac", "1", str(wav)], check=True)
    mp3.unlink()


def speak_say(text, voice, wav):
    aiff = wav.with_suffix(".aiff")
    subprocess.run(["say", "-v", voice, "-o", str(aiff), text], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(aiff), "-ar", "48000", "-ac", "1", str(wav)], check=True)
    aiff.unlink()


def robotize(wav):
    sr, x = wavfile.read(wav)
    x = x.astype(np.float32) / 32768
    t = np.arange(len(x)) / sr
    y = x * (0.55 + 0.45 * np.sin(2 * np.pi * 52 * t))  # ring modulation
    d = int(sr * 0.006)
    y2 = y.copy()
    y2[d:] += 0.5 * y[:-d]  # metallic comb
    y2 = np.tanh(y2 * 1.6) * 0.8
    wavfile.write(wav, sr, (np.concatenate([y2, np.zeros(int(sr * 0.25), np.float32)]) * 32767).astype(np.int16))


def cached(wav, key, sid):
    stamp = wav.with_suffix(".key")
    if wav.exists() and not stamp.exists() and sid not in force:
        return True  # a recording the user dropped in: never overwrite it
    return sid not in force and wav.exists() and stamp.exists() and stamp.read_text() == key


def stamp(wav, key):
    wav.with_suffix(".key").write_text(key)


v = story["voice"]
for s in story["scenes"]:
    text = s.get("say") or s["show"].replace("\n", " ")
    rate = s.get("rate", v.get("rate", "+0%"))
    wav = out / f"{s['id']}.wav"
    key = f"{v['name']}|{rate}|{text}"
    if not cached(wav, key, s["id"]):
        speak_edge(text, v["name"], rate, wav)
        stamp(wav, key)
        print("voice", s["id"])
    if s.get("aside"):
        a = s["aside"]
        sv = (story.get("sidekick") or {}).get("voice", "say:Rocko")
        atext = a.get("say") or a["show"]
        awav = out / f"{s['id']}_aside.wav"
        akey = f"{sv}|{atext}"
        if not cached(awav, akey, s["id"]):
            speak_say(atext, sv[4:], awav) if sv.startswith("say:") else speak_edge(atext, sv, "+0%", awav)
            robotize(awav)
            stamp(awav, akey)
            print("aside", s["id"])
print("narration ready")
