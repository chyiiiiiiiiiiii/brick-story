// Expands every registered scene against the timeline, and derives the whole SFX track from it.
import scenes from "../scenes";
import { DROP } from "./bricks";
import { BuildDef, FigureDef, MOMENTS, SceneDef, SfxDef, SignDef, STORY, Timing, chapters, timing } from "./story";

export const STAIR_STEPS = 6;
export const stairTimes = (k: number) => Array.from({ length: STAIR_STEPS }, (_, s) => chapters[k].start + 4 + s * 6);

export type Resolved = { def: SceneDef; t: Timing; builds: BuildDef[]; figures: FigureDef[]; signs: SignDef[] };

export const resolved: Resolved[] = chapters.map((c) => {
  const def = scenes.find((s) => s.id === c.id);
  if (!def) throw new Error(`story.json scene "${c.id}" has no scene file registered in src/scenes/index.ts`);
  const t = timing(c.id);
  return { def, t, builds: def.builds?.(t) ?? [], figures: def.figures?.(t) ?? [], signs: def.signs?.(t) ?? [] };
});

export const allSfx = (): SfxDef[] => {
  const out: SfxDef[] = [{ t: 0, type: "whoosh", gain: 0.6 }];
  resolved.forEach((r, k) => {
    for (const b of r.builds) {
      const small = (b.scale ?? 1) < 0.6;
      for (const br of b.bricks) out.push({ t: br.t + DROP, type: "click", gain: small ? 0.75 : 1 });
    }
    for (const fig of r.figures) out.push({ t: fig.drop + 8, type: "pop", gain: fig.look && fig.look !== "hero" ? 0.45 : 1 });
    for (const s of r.signs) out.push({ t: s.show, type: "pop", gain: 0.3 });
    out.push(...(r.def.sfx?.(r.t) ?? []));
    if (r.t.aside) out.push({ t: r.t.aside.start - 12, type: "bleep" });
    if (k > 0) {
      out.push({ t: chapters[k].start, type: "whoosh" });
      for (const t of stairTimes(k)) out.push({ t: t + DROP, type: "step" });
    }
  });
  if (MOMENTS.climax !== null) {
    out.push({ t: MOMENTS.climax, type: "confetti" });
    out.push({ t: MOMENTS.climax + 2, type: "cheer" });
  }
  if (STORY.ending?.photo) {
    for (let i = 0; i < 28; i++) out.push({ t: MOMENTS.endCard - 40 + i * 0.5, type: "click", gain: 0.55 });
    out.push({ t: MOMENTS.endCard - 4, type: "sparkle" });
  }
  return out.sort((a, b) => a.t - b.t);
};
