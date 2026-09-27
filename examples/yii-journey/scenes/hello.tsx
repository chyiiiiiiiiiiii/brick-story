import { C, Pop, Tree, after, build, defineScene, heroBighead, wave } from "../engine/kit";

// The hero's big-head sculpture assembles itself; then the minifig hero drops in beside it and waves.
export default defineScene({
  id: "hello",
  plate: "#58ab41",
  focus: [-1.4, -1.2],
  builds: (t) => [build("bighead", heroBighead(), t.at(4), 78, { pos: [-1.6, 0.32, -1.4], scale: 0.52, rotY: 0.18 })],
  figures: (t) => [{ at: [2.9, 2.0], rotY: -0.3, drop: t.vStart + 30, pose: (f) => ({ face: "grin", armR: after(f, t.vStart + 44, wave(f)) }) }],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(6)} position={[-4.9, 0.32, 3.6]}><Tree /></Pop>
      <Pop f={f} t={t.at(10)} position={[5.0, 0.32, -3.6]}><Tree s={0.8} color={C.lime} /></Pop>
    </>
  ),
});
