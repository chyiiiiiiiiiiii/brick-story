// Story + timeline loader, scene timing helpers and the scene contract. Pure data: node scripts import this too.
import story from "../../story.json";
import timeline from "../data/timeline.json";
import type { BrickSpec } from "./bricks";
import type { HeroLook } from "./bighead";
import type { Face, MinifigProps } from "./Minifig";

export type V3 = [number, number, number];

export const STORY = story as unknown as {
  title: string;
  lang: "zh" | "en";
  subtitles: "zh" | "en" | "zh+en" | "none";
  hero: HeroLook & { name?: string };
  ending?: { name?: string; handle?: string; photo?: string };
  sidekick?: { name: string };
  climax?: string;
};

type Chapter = {
  id: string;
  tag: string;
  title: string;
  title_en: string;
  counter?: { to: number; fmt: string }[] | null;
  sky?: [string, string] | null;
  badge?: { title: string; sub?: string } | null;
  start: number;
  dur: number;
  voice: { start: number; dur: number; show: string; show_en: string };
  aside?: { start: number; dur: number; show: string; show_en: string } | null;
};

export const TL = timeline as unknown as {
  fps: number;
  total: number;
  moments: { climax: number | null; endCard: number; pullBack: number };
  chapters: Chapter[];
};

export const FPS = 30; // every frame number in scenes is in 30 fps units
export const TOTAL = TL.total;
export const chapters = TL.chapters;
export const MOMENTS = TL.moments;
export const LANG = STORY.lang;
export const tr = (zh: string, en: string) => (LANG === "en" ? en : zh);

// ---------- spiral layout: one floating island per scene ----------
export const R = 14;
export const STEP_ANGLE = (66 * Math.PI) / 180;
export const RISE = 3.2;
export const TRAVEL = 54; // frames of camera travel at the top of each scene
export const TOP = 0.32; // island top surface (baseplate height)

export const islandPos = (i: number): V3 => {
  const a = i * STEP_ANGLE;
  return [R * Math.sin(a), i * RISE, R * Math.cos(a)];
};
export const islandRot = (i: number) => i * STEP_ANGLE;
export const toWorld = (i: number, [x, y, z]: V3): V3 => {
  const a = islandRot(i);
  const [px, py, pz] = islandPos(i);
  return [px + x * Math.cos(a) + z * Math.sin(a), py + y, pz - x * Math.sin(a) + z * Math.cos(a)];
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const chapterAt = (frame: number) => {
  let k = 0;
  chapters.forEach((c, i) => {
    if (frame >= c.start) k = i;
  });
  return k;
};
export const islandParam = (frame: number) => {
  const k = chapterAt(frame);
  if (k === 0) return 0;
  return k - 1 + easeInOut(clamp01((frame - chapters[k].start) / TRAVEL));
};

// ---------- scene timing helper ----------
export type Timing = {
  id: string;
  index: number;
  start: number;
  end: number;
  dur: number;
  vStart: number; // narration start
  vEnd: number; // narration end
  at: (n: number) => number; // n frames after the scene starts
  voice: (frac: number) => number; // a point inside the narration, 0..1
  aside: { start: number; dur: number } | null; // sidekick line, if any
  climax: number | null; // the climax frame if this is the climax scene
  pullBack: number; // when the final camera pull-back starts (global)
};

export const timing = (id: string): Timing => {
  const index = chapters.findIndex((c) => c.id === id);
  if (index < 0) throw new Error(`Scene "${id}" is registered in src/scenes/index.ts but missing from story.json`);
  const c = chapters[index];
  const vEnd = c.voice.start + c.voice.dur;
  return {
    id,
    index,
    start: c.start,
    end: c.start + c.dur,
    dur: c.dur,
    vStart: c.voice.start,
    vEnd,
    at: (n) => c.start + n,
    voice: (frac) => Math.round(c.voice.start + c.voice.dur * frac),
    aside: c.aside ? { start: c.aside.start, dur: c.aside.dur } : null,
    climax: STORY.climax === id ? MOMENTS.climax : null,
    pullBack: MOMENTS.pullBack,
  };
};

// ---------- the scene contract ----------
export type BuildDef = { id: string; bricks: BrickSpec[]; pos?: V3; rotY?: number; scale?: number };

export type SfxType =
  | "click" | "step" | "pop" | "whoosh" | "ding" | "ping" | "bus" | "elevator" | "flag" | "thud"
  | "sparkle" | "plane" | "confetti" | "cheer" | "applause" | "typing" | "bleep";
export type SfxDef = { t: number; type: SfxType; gain?: number };

export type Pose = Pick<MinifigProps, "face" | "armL" | "armR" | "armSpreadL" | "armSpreadR" | "walk" | "headYaw" | "headPitch" | "bob" | "hold">;
export type Look = Omit<MinifigProps, keyof Pose | "position" | "rotationY" | "scale">;
export type FigureDef = {
  look?: "hero" | Look; // "hero" = the story's hero minifig
  outfit?: Partial<Look>; // tweak the hero look for this era (e.g. a different top)
  at: [number, number]; // island-local x, z
  move?: (f: number) => [number, number]; // optional path: overrides `at` frame by frame (combine with pose walk)
  y?: number; // height above the island top (stages, mountains)
  rotY?: number;
  turn?: (f: number) => number; // optional: overrides rotY frame by frame
  drop: number; // frame the figure drops in with a bounce
  scale?: number;
  pose?: (f: number) => Pose & { face?: Face };
};

export type SignDef = {
  text: string;
  sub?: string;
  at: V3; // island-local; y measured from the island top
  show: number; // frame it pops in
  w?: number;
  h?: number;
  bg?: string;
  fg?: string;
  rot?: V3;
};

export type SceneDef = {
  id: string;
  plate?: string; // island baseplate colour
  focus?: [number, number]; // first scene only: where the opening close-up looks (island-local x, z)
  confettiAt?: V3; // climax scene only: where the confetti bursts from (island-local)
  builds?: (t: Timing) => BuildDef[];
  figures?: (t: Timing) => FigureDef[];
  signs?: (t: Timing) => SignDef[];
  sfx?: (t: Timing) => SfxDef[];
  View?: (p: { f: number; t: Timing }) => JSX.Element | null;
};

export const defineScene = (d: SceneDef) => d;
