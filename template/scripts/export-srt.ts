// Subtitle files next to the video, from the same cues that are burned in.
import { mkdirSync, writeFileSync } from "node:fs";
import { cues, Cue } from "../src/engine/cues";
import { LANG, STORY } from "../src/engine/story";

const ts = (frame: number) => {
  const ms = Math.round((frame / 30) * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const who = (c: Cue, s: string) => (c.speaker ? `${c.speaker}: ${s}` : s);
const srt = (text: (c: Cue) => string) => cues.map((c, i) => `${i + 1}\n${ts(c.from)} --> ${ts(c.to)}\n${text(c)}\n`).join("\n");

const dir = new URL("../out/", import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(new URL(`video.${LANG}.srt`, dir), srt((c) => who(c, c.main)));
if (LANG === "zh" && STORY.subtitles === "zh+en") {
  writeFileSync(new URL("video.en.srt", dir), srt((c) => who(c, c.en)));
  writeFileSync(new URL("video.zh+en.srt", dir), srt((c) => `${who(c, c.main)}\n${who(c, c.en)}`));
}
console.log(`${cues.length} subtitle cues`);
