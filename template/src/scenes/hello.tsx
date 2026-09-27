import { C, Pop, Tree, box, build, defineScene, heroBighead, wave, after } from "../engine/kit";

// Opening: the hero's big-head sculpture assembles itself, then the hero minifig drops in and waves.
export default defineScene({
  id: "hello",
  plate: "#58ab41",
  focus: [-1.4, -1.2],
  builds: (t) => [
    build("bighead", heroBighead(), t.at(4), 78, { pos: [-1.6, 0.32, -1.4], scale: 0.5, rotY: 0.18 }),
    build("beanbag", box(3, 1, -4, 3, 2, 3, (l) => (l === 2 ? C.brown : "#b08a5a")), t.voice(0.5), 12),
  ],
  figures: (t) => [{ at: [2.9, 2.2], rotY: -0.3, drop: t.vStart + 30, pose: (f) => ({ face: "grin", armR: after(f, t.vStart + 44, wave(f)) }) }],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(6)} position={[-4.9, 0.32, 3.6]}><Tree /></Pop>
      <Pop f={f} t={t.at(10)} position={[5.0, 0.32, -3.6]}><Tree s={0.8} color={C.lime} /></Pop>
    </>
  ),
});
