// Subtitle cues (30 fps frames), shared by the burned-in overlay and the SRT export.
import { STORY, chapters } from "./story";

export type Cue = { main: string; en: string; from: number; to: number; speaker?: string };

export const cues: Cue[] = (() => {
  const out: Cue[] = [];
  for (const c of chapters) {
    const main = c.voice.show.split("\n");
    const en = c.voice.show_en.split("\n");
    const total = main.reduce((a, l) => a + l.length, 0);
    let t = c.voice.start;
    main.forEach((l, i) => {
      const d = (c.voice.dur * l.length) / total;
      out.push({ main: l, en: en[i] ?? "", from: Math.round(t), to: Math.round(t + d) + (i === main.length - 1 ? 8 : 0) });
      t += d;
    });
    if (c.aside) out.push({ main: c.aside.show, en: c.aside.show_en, from: c.aside.start, to: c.aside.start + c.aside.dur + 8, speaker: STORY.sidekick?.name ?? "" });
  }
  return out.sort((a, b) => a.from - b.from);
})();
