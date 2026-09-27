# Example: 一步一步 (Yii's journey)

The video that started brick-story: Yii Chen's road from freelancing student to Google Developer Expert, in 11 islands (≈ 100 s).


Things to borrow from it:

- **Opening**: a big-head brick sculpture of the hero assembles itself (`hello.tsx`).
- **Failure beat**: app icons pop onto a giant phone, then fall off and turn grey (`student.tsx`).
- **Vehicle**: a bus drives in, a Bluetooth bell rings and signal rings expand (`beacon.tsx`).
- **Growing crowd**: the audience fills seat by seat while a counter runs (`meetup.tsx`).
- **Trip map**: a plane hops pin to pin between cities (`stage.tsx`).
- **Drawn cover**: a real book cover redrawn on a canvas panel (`book.tsx`).
- **Climax**: brick letters timed to land on the music drop, with confetti (`gde.tsx`).
- **Self-building tower**: agent robots ferry bricks while it goes up (`ai.tsx`).

## Run it

```bash
cp -R ../../template ~/Movies/yii-journey && cd ~/Movies/yii-journey
zsh scripts/setup.sh
rm src/scenes/*.tsx && cp ~/.claude/skills/brick-story/examples/yii-journey/scenes/* src/scenes/
cp ~/.claude/skills/brick-story/examples/yii-journey/story.json .
# the original ends on a photo mosaic: add "photo": "photo.jpg" to story.json's "ending" with your own square-ish photo
zsh scripts/make.sh
```

The sidekick voice is `say:Rocko (中文（台灣）)`, a macOS voice; on other systems, set `sidekick.voice` to an edge-tts voice.
