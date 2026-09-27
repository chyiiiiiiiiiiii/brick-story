import { C, Pop, Round, Tree, brick, build, defineScene, heroBighead, wave, after } from "../engine/kit";

const ROAD = "#6c6e68";

// Opening: Alex's big-head sculpture assembles, a road strip runs across the front, and a signpost points from "3 KM" to "42.195 KM".
export default defineScene({
  id: "hello",
  plate: "#58ab41",
  focus: [-1.4, -1.2],
  builds: (t) => [
    build("bighead", heroBighead(), t.at(4), 78, { pos: [-1.8, 0.32, -1.6], scale: 0.5, rotY: 0.18 }),
    build("road", [
      ...[-7, -3, 1, 5].map((gx) => brick(gx, 1, 2, gx === 5 ? 2 : 4, 3, 1, ROAD)),
      ...[-6, -2, 2].map((gx) => brick(gx, 2, 3, 2, 1, 1, C.white, false)),
    ], t.at(12), 16, { order: "left" }),
  ],
  figures: (t) => [{ at: [0.5, 2.8], rotY: -0.2, y: 0.32, drop: t.vStart + 6, pose: (f) => ({ face: "grin", armR: after(f, t.vStart + 20, wave(f)) }) }],
  signs: (t) => [
    { text: "3 KM", at: [3.7, 3.0, -2.2], show: t.voice(0.35), w: 1.9, h: 0.7, bg: C.gray, fg: "#ffffff" },
    { text: "42.195 KM", at: [3.7, 2.1, -2.2], show: t.voice(0.7), w: 2.5, h: 0.75, bg: C.orange, fg: "#ffffff" },
  ],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(6)} position={[-4.9, 0.32, 0.6]}><Tree /></Pop>
      <Pop f={f} t={t.at(10)} position={[5.0, 0.32, 0.4]}><Tree s={0.8} color={C.lime} /></Pop>
      <Pop f={f} t={t.voice(0.3)} position={[3.7, 0.32, -2.4]}><Round r={0.08} h={3.5} color={C.gray} /></Pop>
    </>
  ),
});
