"""Listen back to every narration line with Whisper and flag lines that do not match the script.

Needs faster-whisper (scripts/setup.sh --whisper). Prints expected vs heard with a similarity score;
anything under 0.75 deserves a listen and usually a respelling in the scene's "say" field.
"""
import difflib, json, pathlib, re, sys

try:
    from faster_whisper import WhisperModel
except ImportError:
    sys.exit("faster-whisper is not installed: run scripts/setup.sh --whisper (or listen to audio/voice/*.wav yourself)")

root = pathlib.Path(__file__).resolve().parent.parent
story = json.loads((root / "story.json").read_text())
lang = story.get("lang", "zh")
model = WhisperModel(sys.argv[1] if len(sys.argv) > 1 else "large-v3", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[\s\W_]+", "", s.lower())
for s in story["scenes"]:
    items = [(s["id"], s["show"].replace("\n", ""))]
    if s.get("aside"):
        items.append((s["id"] + "_aside", s["aside"].get("show", "")))
    for fid, expected in items:
        segs, _ = model.transcribe(str(root / f"audio/voice/{fid}.wav"), language=lang, initial_prompt="以下是繁體中文。" if lang == "zh" else None)
        heard = "".join(x.text for x in segs).strip()
        score = difflib.SequenceMatcher(None, norm(expected), norm(heard)).ratio()
        flag = "  <-- check" if score < 0.75 else ""
        print(f"[{fid}] {score:.2f}{flag}\n  script: {expected}\n  heard:  {heard}")
