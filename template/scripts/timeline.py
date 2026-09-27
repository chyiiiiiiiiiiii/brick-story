"""story.json + narration durations -> src/data/timeline.json (30 fps frames). Fails loudly on story mistakes."""
import json, math, pathlib, subprocess, sys

FPS = 30
BAR = 72  # frames per bar at 100 BPM; the music's downbeats land on the climax and the end card
root = pathlib.Path(__file__).resolve().parent.parent
story = json.loads((root / "story.json").read_text())
voice = root / "audio/voice"


def dur(p):
    if not p.exists():
        sys.exit(f"missing {p.relative_to(root)} - run: .venv/bin/python scripts/tts.py")
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)


lang, mode = story.get("lang", "zh"), story.get("subtitles", "zh")
scenes = story["scenes"]
ids = [s["id"] for s in scenes]
if len(set(ids)) != len(ids):
    sys.exit("scene ids must be unique")
if story.get("climax") and story["climax"] not in ids:
    sys.exit(f'climax "{story["climax"]}" is not a scene id')
for s in scenes:
    if lang == "zh" and mode == "zh+en":
        if "show_en" not in s:
            sys.exit(f'scene "{s["id"]}": subtitles are zh+en, so show_en is required')
        if s["show"].count("\n") != s["show_en"].count("\n"):
            sys.exit(f'scene "{s["id"]}": show and show_en need the same number of \\n line breaks (one subtitle cue per line)')

t = 0.0
chapters = []
last = len(scenes) - 1
for i, s in enumerate(scenes):
    vd = dur(voice / f"{s['id']}.wav")
    lead = s.get("lead", 2.6 if i == 0 else 0.9)
    tail = s.get("tail", 2.8 if s["id"] == story.get("climax") else 0.7)
    total = lead + vd + tail
    aside = None
    if s.get("aside"):
        ad = dur(voice / f"{s['id']}_aside.wav")
        a = s["aside"]
        aside = {"start": round((t + lead + vd + 0.35) * FPS), "dur": round(ad * FPS),
                 "show": a.get("show", a.get("say", "")), "show_en": a.get("show_en", "")}
        total += 0.35 + ad
    show = s["show"]
    chapters.append({
        "id": s["id"], "tag": s.get("tag", ""), "title": s.get("title", ""), "title_en": s.get("title_en", ""),
        "counter": s.get("counter"), "sky": s.get("sky"), "badge": s.get("badge"),
        "start": round(t * FPS), "dur": round(total * FPS),
        "voice": {"start": round((t + lead) * FPS), "dur": round(vd * FPS), "show": show, "show_en": s.get("show_en", show)},
        "aside": aside,
    })
    t += total

# key moments
last_vend = chapters[-1]["voice"]["start"] + chapters[-1]["voice"]["dur"]
climax = None
if story.get("climax"):
    c = next(c for c in chapters if c["id"] == story["climax"])
    climax = c["voice"]["start"] + c["voice"]["dur"] + 2
grid0 = climax if climax is not None else 0
end_card = grid0 + BAR * math.ceil((last_vend + 6 - grid0) / BAR)
pull_back = round(chapters[-1]["voice"]["start"] + chapters[-1]["voice"]["dur"] * 0.35)
total = max(round(t * FPS), end_card + 130)
chapters[-1]["dur"] = total - chapters[-1]["start"]

out = {"fps": FPS, "total": total, "moments": {"climax": climax, "endCard": end_card, "pullBack": pull_back}, "chapters": chapters}
(root / "src/data/timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(f"{len(chapters)} scenes, {total / FPS:.1f} s")
