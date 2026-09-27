# story.json

Everything about the story lives in this one file; the scene files only describe islands. `scripts/timeline.py` validates it and turns narration lengths into frame timings.

```jsonc
{
  "title": "我學手沖咖啡的一年",            // project label only
  "lang": "zh",                          // narration language: "zh" | "en"
  "subtitles": "zh+en",                  // burned-in: "zh" | "en" | "zh+en" | "none"
  "voice": { "name": "zh-TW-HsiaoChenNeural", "rate": "+2%" },
  "hero": {
    "name": "Mia",
    "hair": "#3b2a20", "skin": "#f1c9a0",  // skin is for the big-head sculpture; minifigs keep classic yellow
    "top": "#b8573a", "pants": "#2f3b4c",
    "glasses": false,
    "print": "sweater",                  // minifig torso print: sweater | tee | hoodie | open | shirt | plain
    "hairStyle": "short"                 // minifig hair: short | spiky | long | cap
  },
  "sidekick": { "name": "James", "voice": "say:Rocko" },   // optional; see "aside" below
  "climax": "cafe",                      // scene id that gets confetti, the music drop and the badge
  "ending": { "name": "Mia", "handle": "@mia.brews", "photo": "photo.jpg" },  // photo optional
  "scenes": [ /* 5-12 scenes, in story order */ ]
}
```

## Voices

`voice.name` is an edge-tts voice (`.venv/bin/edge-tts --list-voices`). Voices that sounded natural in tests:

| Language | Voice | Character |
|---|---|---|
| zh-TW | `zh-TW-YunJheNeural` | male, friendly |
| zh-TW | `zh-TW-HsiaoChenNeural` | female, friendly |
| en-US | `en-US-AndrewMultilingualNeural` | male, warm, conversational |
| en-US | `en-US-AvaMultilingualNeural` | female, warm |

`rate` is a percentage string (`"+3%"`). A scene can override it.

The **sidekick** voice is `say:<macOS voice>` (robotic by design: `say:Rocko` for Chinese, `say:Zarvox` for English) or any edge-tts voice. Either way it gets a small-robot ring-mod timbre.

## A scene

```jsonc
{
  "id": "beans",                          // matches src/scenes/beans.tsx
  "tag": "MONTH 1 – 3",                   // small pill above the title (Latin caps read best)
  "title": "認識咖啡豆",
  "title_en": "Know Your Beans",          // shown under the title when subtitles are zh+en
  "show": "我從認識豆子開始：\n產地、處理法、烘焙度，\n一袋一袋試。",
  "show_en": "I started with the beans:\norigin, process, roast,\none bag at a time.",
  "say": "…",                             // optional: what the voice reads, when it differs from show
  "counter": [{ "to": 24, "fmt": "{n} BAGS TRIED" }],   // optional: replaces the tag, counts 0 -> to
  "badge": { "title": "FIRST ORDER", "sub": "Barista for a day" },  // climax scene only
  "aside": { "say": "下一步，要做什麼？", "show": "下一步，要做什麼？", "show_en": "What's the next step?" },
  "sky": ["#8ec9ee", "#e8f5fc"],          // optional gradient top/bottom; otherwise a pastel per scene
  "lead": 0.9, "tail": 0.7, "rate": "+0%" // optional timing/voice overrides (seconds)
}
```

- **`show`** is the subtitle and, unless `say` is given, what the voice reads. Each `\n` starts a new subtitle cue, and cue times follow character counts.
- **`show_en`** needs exactly as many `\n` as `show` when subtitles are `zh+en`; `timeline.py` refuses otherwise.
- **`say`** fixes pronunciation without touching the subtitle: numbers read as words, names spelled phonetically, English words set off with commas. Examples are in `troubleshooting.md`.
- **`counter`** takes several entries, joined with ` · ` (`"{n} MEMBERS"`, `"{n}+ MEETUPS"`).
- **`aside`** is the sidekick's line, spoken right after the narration and shown in a speech bubble.
- **Default timing**: the first scene has a 2.6 s `lead` so the big-head sculpture can assemble before the voice starts, and the climax scene has a 2.8 s `tail` for the celebration. The last scene is stretched to fit the end card, which lands on the first musical downbeat after the final word.

## Ending

With `ending.photo` the last seconds show a brick-stud mosaic of the photo (14 → 24 → 40 → 64 studs) that resolves into the photo itself on the final chord, with name and handle beneath. Use a square-ish photo with a plain background, face centred; `scripts/mosaic.py` crops the centre square. Without a photo, the ending is a name card.
