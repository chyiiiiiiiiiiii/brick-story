import { ThreeCanvas } from "@remotion/three";
import { EffectComposer, TiltShift2, Vignette, SMAA, Bloom, N8AO, ToneMapping, HueSaturation } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { CameraRig, Env, Sun } from "./Stage";
import { Edges } from "./Edges";
import { IslandView, Stairs } from "./Island";
import { Confetti, Sky } from "./props";
import { resolved } from "./resolve";
import { MOMENTS, R, RISE, STEP_ANGLE, STORY, TRAVEL, V3, chapterAt, chapters, clamp01, easeInOut, islandParam, lerp, timing, toWorld } from "./story";
import { useT } from "./time";

const SKIES: [string, string][] = [
  ["#8ec9ee", "#e8f5fc"], ["#f6c7a8", "#fdf0e4"], ["#9fd9c1", "#eef9f3"], ["#cdb6f0", "#f5effd"], ["#8fcdf2", "#eaf6fd"],
  ["#9fd8e6", "#eefafc"], ["#f7d98a", "#fff8e6"], ["#f5b8cc", "#fdeef3"], ["#ffc46b", "#fff1d6"], ["#aebff5", "#eef1fe"],
];
const skyOf = (k: number): [string, string] =>
  chapters[k].sky ?? (k === chapters.length - 1 ? ["#ffb48a", "#bfe0f7"] : SKIES[k % SKIES.length]);
const mixHex = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

const N = chapters.length;
// Finale framing: aim at the centroid of all islands; fewer islands -> closer and higher.
const CENTER: V3 = (() => {
  const ps = chapters.map((_, i) => toWorld(i, [0, 2.4, 0]));
  return [0, 1, 2].map((j) => ps.reduce((a, p) => a + p[j], 0) / ps.length) as V3;
})();
const FINAL_D = N <= 6 ? 96 : 60 + N * 5.3;
const FINAL_EL = N <= 6 ? 0.55 : 0.2;
const climaxEnd = STORY.climax ? timing(STORY.climax).end : null;

// Un-smoothed camera. Every term is continuous in time; camAt() Gaussian-smooths away any kinks.
const rawCam = (frame: number) => {
  const s = islandParam(frame);
  const k = chapterAt(frame);
  const c = chapters[k];
  const local = frame - c.start;
  const travelT = k > 0 ? clamp01(local / TRAVEL) : 1;
  const arc = Math.sin(Math.PI * travelT);
  let dist = 40 + arc * 6;
  let el = 0.34 + arc * 0.06;
  let lift = 2.4;
  if (k === 0) {
    const q = easeInOut(clamp01((local - 20) / 200));
    dist = lerp(27, 40, q);
    el = lerp(0.22, 0.34, q);
    lift = lerp(3.2, 2.4, q);
  }
  let push = 0;
  if (MOMENTS.climax !== null && climaxEnd !== null)
    push = easeInOut(clamp01((frame - MOMENTS.climax + 30) / 50)) * (1 - easeInOut(clamp01((frame - climaxEnd + 10) / 50)));
  dist -= 11 * push;
  lift += 1.6 * push;
  const drift = 0.07 * Math.sin(frame / 110);
  const theta = s * STEP_ANGLE;
  const y = s * RISE;
  const ct = theta + drift - 0.04 + push * 0.12;
  const rr = R + dist * Math.cos(el);
  let pos: V3 = [Math.sin(ct) * rr, y + lift + dist * Math.sin(el), Math.cos(ct) * rr];
  let target: V3 = [Math.sin(theta) * R, y + lift, Math.cos(theta) * R];
  if (k === 0 && resolved[0].def.focus) {
    const [fx, fz] = resolved[0].def.focus;
    const q = easeInOut(clamp01((local - 60) / 160));
    const hz = toWorld(0, [lerp(fx, 0, q), 0, lerp(fz, 0, q)]);
    target = [hz[0], y + lift, hz[2]];
    pos = [pos[0] + (hz[0] - Math.sin(theta) * R), pos[1], pos[2] + (hz[2] - Math.cos(theta) * R)];
  }
  // finale: pull back until the whole spiral fits the frame
  const q = easeInOut(clamp01((frame - MOMENTS.pullBack) / 160));
  if (q > 0) {
    const a = theta + (frame - MOMENTS.pullBack) * 0.0032;
    const D = FINAL_D, e = FINAL_EL;
    const fp: V3 = [CENTER[0] + Math.sin(a) * D * Math.cos(e), CENTER[1] + D * Math.sin(e), CENTER[2] + Math.cos(a) * D * Math.cos(e)];
    pos = pos.map((v, i) => lerp(v, fp[i], q)) as V3;
    target = target.map((v, i) => lerp(v, CENTER[i], q)) as V3;
  }
  return { pos, target, pull: q, k, travelT };
};

export const camAt = (frame: number) => {
  const pos: V3 = [0, 0, 0];
  const target: V3 = [0, 0, 0];
  let wsum = 0;
  for (let i = -12; i <= 12; i++) {
    const w = Math.exp(-(i * i) / 50);
    const c = rawCam(frame + i * 2);
    for (let j = 0; j < 3; j++) {
      pos[j] += c.pos[j] * w;
      target[j] += c.target[j] * w;
    }
    wsum += w;
  }
  const here = rawCam(frame);
  return { ...here, pos: pos.map((v) => v / wsum) as V3, target: target.map((v) => v / wsum) as V3 };
};

export const World = () => {
  const f = useT();
  const { width, height } = useVideoConfig();
  const cam = camAt(f);
  const [pt, pb] = skyOf(Math.max(0, cam.k - 1));
  const [ct, cb] = skyOf(cam.k);
  const tt = easeInOut(cam.travelT);
  const bottom = mixHex(pb, cb, tt);
  const climaxIdx = STORY.climax ? chapters.findIndex((c) => c.id === STORY.climax) : -1;
  const confettiAt = climaxIdx >= 0 ? resolved[climaxIdx].def.confettiAt ?? [0, 7, -1.4] : null;
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}>
      <Env background={bottom} />
      <Sky top={mixHex(pt, ct, tt)} bottom={bottom} />
      <CameraRig pos={cam.pos} target={cam.target} fov={30} />
      <Sun target={cam.target} size={lerp(12, 34, cam.pull)} intensity={3.4} />
      {resolved.map((r, i) => (
        <IslandView key={r.t.id} r={r} i={i} f={f} />
      ))}
      <Stairs f={f} />
      {confettiAt && MOMENTS.climax !== null && <Confetti frame={f} t0={MOMENTS.climax} origin={toWorld(climaxIdx, confettiAt)} />}
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={1.4} distanceFalloff={0.8} intensity={2.6} quality="high" halfRes color="#1c2330" />
        <Edges strength={0.5} />
        <SMAA />
        <Bloom intensity={0.25} luminanceThreshold={0.9} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <HueSaturation saturation={0.1} />
        <TiltShift2 blur={lerp(0.1, 0.045, cam.pull)} taper={0.6} />
        <Vignette darkness={0.28} offset={0.34} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
