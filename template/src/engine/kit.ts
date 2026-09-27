// Everything a scene file needs, in one import: `import { ... } from "../engine/kit";`
import glyphs from "../data/glyphs.json";
import { BrickSpec, boxOf, hash, schedule, wallFromBitmap } from "./bricks";
import { bigheadBricks } from "./bighead";
import { STORY, easeOut } from "./story";

export { C } from "./colors";
export { hash, schedule } from "./bricks";
export { defineScene, tr, TOP, easeOut, easeInOut, clamp01, lerp } from "./story";
export type { BuildDef, FigureDef, SignDef, SfxDef, Timing } from "./story";

type Raw = Omit<BrickSpec, "t">;

// One brick. gx/gz = stud cell of its min corner, gy = plate level of its bottom (the island top is gy 1), h in plates (3 = brick).
export const brick = (gx: number, gy: number, gz: number, w: number, d: number, h: number, color: string, studs = true): Raw => ({ gx, gy, gz, w, d, h, color, studs });

// A solid block `layers` bricks tall with a real alternating bond. color may vary per layer.
export const box = (gx: number, gy: number, gz: number, w: number, d: number, layers: number, color: string | ((layer: number) => string), h = 3): Raw[] =>
  boxOf(gx, gy, gz, w, d, layers, color, h);

// A pile of `count` identical plates (phones, books, screens, paper stacks). Studs only on the top one.
export const stack = (gx: number, gy: number, gz: number, w: number, d: number, count: number, color: string | ((i: number) => string)): Raw[] =>
  Array.from({ length: count }, (_, i) => ({ gx, gy: gy + i, gz, w, d, h: 1, color: typeof color === "string" ? color : color(i), studs: i === count - 1 }));

// Upright brick lettering, one stud deep, centred on x = 0. Glyphs come from scripts/glyphs.py, which scans scene files for textWall("...").
export const textWall = (text: string, color: string | ((row: number, col: number) => string), opts: { rows?: number; font?: string; gy?: number; gz?: number } = {}): Raw[] => {
  const key = `${text}|${opts.rows ?? 9}|${opts.font ?? "futura"}`;
  const rows = (glyphs as Record<string, string[]>)[key];
  if (!rows) throw new Error(`No glyph bitmap for ${key}. Run: .venv/bin/python scripts/glyphs.py`);
  return wallFromBitmap(rows, color, -Math.floor(rows[0].length / 2), opts.gy ?? 0, opts.gz ?? 0);
};
// Upright wall from your own pixel art (rows top->bottom, "#" = brick), centred on x = 0. Good for icons: hearts, stars, arrows.
export const bitmap = (rows: string[], color: string | ((row: number, col: number) => string), opts: { gy?: number; gz?: number } = {}): Raw[] =>
  wallFromBitmap(rows, color, -Math.floor(rows[0].length / 2), opts.gy ?? 0, opts.gz ?? 0);

// Width in studs of a textWall, to pick a scale that fits the island (about 14 studs wide).
export const textWidth = (text: string, opts: { rows?: number; font?: string } = {}) =>
  ((glyphs as Record<string, string[]>)[`${text}|${opts.rows ?? 9}|${opts.font ?? "futura"}`] ?? [""])[0].length;

// The hero as a big-head brick sculpture (~460 plates). Centre it with pos, shrink it with scale ≈ 0.5.
export const heroBighead = (): Raw[] => bigheadBricks(STORY.hero).map((b) => ({ ...b, gx: b.gx - 3, gz: b.gz - 2 }));

// Assign bricks their start frames and wrap them as a build.
export const build = (id: string, bricks: Raw[], start: number, span: number, opts: { order?: "up" | "left" | "random"; pos?: [number, number, number]; rotY?: number; scale?: number } = {}) => ({
  id,
  bricks: schedule(bricks, start, span, opts.order ?? "up"),
  pos: opts.pos,
  rotY: opts.rotY,
  scale: opts.scale,
});

// ---------- pose helpers (return arm angles in radians; 0 = down, ~1 = forward, ~2.6 = raised) ----------
export const wave = (f: number, phase = 0) => 2.6 + Math.sin(f * 0.45 + phase) * 0.4;
export const typing = (f: number, phase = 0) => 1.0 + Math.sin(f * 0.9 + phase) * 0.08;
export const cheer = (f: number, phase = 0) => 2.7 + Math.sin(f * 0.4 + phase) * 0.2;
export const after = (f: number, t: number, then: number, before = 0) => (f > t ? then : before);
export const noise = hash;
// 0 -> 1 across a scene's narration with the same easing as the tag counter (calendars, progress bars).
export const progress = (f: number, t: { vStart: number; vEnd: number }) => easeOut((f - t.vStart - 20) / (t.vEnd - t.vStart - 30));

// ---------- 3D components for a scene's custom View ----------
export { Pop, popScale, TextSign, Laptop, Plane, Rings, Confetti, CanvasPanel, useCanvasTex } from "./props";
export { Tree, Round, Cone, Brick, plastic } from "./parts";
export { Minifig } from "./Minifig";
export { heroLook } from "./Figure";
