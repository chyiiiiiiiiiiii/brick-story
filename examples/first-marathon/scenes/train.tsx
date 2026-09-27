import { C, Pop, Tree, box, brick, build, defineScene } from "../engine/kit";

const TRACK = "#b5523b";
const RUNS: [number, number][] = [[-7, 4], [-3, 4], [1, 4], [5, 2]];
// Weekly distance as a bar chart of brick towers: each one lands as the narration names it.
const BARS = [
  { gx: -6, layers: 1, color: C.yellow, label: "5K", at: 0.15 },
  { gx: -3, layers: 2, color: C.orange, label: "10K", at: 0.28 },
  { gx: 0, layers: 4, color: C.red, label: "20K", at: 0.4 },
];

// Every week: three distance towers rise behind the track (5K, 10K, 20K) while Alex runs laps in front.
export default defineScene({
  id: "train",
  plate: "#4b9f4a",
  builds: (t) => [
    build("track", [
      ...RUNS.map(([gx, w]) => brick(gx, 1, 1, w, 3, 1, TRACK)),
      ...RUNS.map(([gx, w]) => brick(gx, 1, 4, w, 1, 1, C.white)),
    ], t.at(8), 16, { order: "left" }),
    ...BARS.map((b, i) => build(`bar${i}`, box(b.gx, 1, -5, 3, 3, b.layers, b.color), t.voice(b.at), 8 + b.layers * 4)),
  ],
  figures: (t) => [{ at: [3.4, 2.2], y: 0.32, rotY: -0.5, drop: t.at(34), pose: (f) => ({ face: f > t.voice(0.75) ? "grin" : "focus", walk: f * 0.6 }) }],
  signs: (t) => BARS.map((b) => ({
    text: b.label,
    at: [(b.gx + 1.5) * 0.8, b.layers * 0.96 - 0.45, -1.58] as [number, number, number],
    show: t.voice(b.at) + 10 + b.layers * 4,
    w: 1.8, h: 0.7, bg: C.white, fg: C.dark,
  })),
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(12)} position={[4.4, 0.32, -3.6]}><Tree s={0.85} /></Pop>
      <Pop f={f} t={t.at(16)} position={[-5.2, 0.32, 0.2]}><Tree s={0.7} color={C.lime} /></Pop>
    </>
  ),
});
