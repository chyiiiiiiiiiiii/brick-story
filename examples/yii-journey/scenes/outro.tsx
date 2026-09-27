import { C, Pop, Round, TextSign, Tree, build, defineScene, tr } from "../engine/kit";

// Ending: the hero jogs toward steps that keep climbing off the island, into the sky.
export default defineScene({
  id: "outro",
  plate: "#58ab41",
  builds: (t) => [
    build("future", Array.from({ length: 6 }, (_, i) => ({ gx: -1 + i * 2, gy: 1 + i * 2, gz: -3, w: 2, d: 2, h: 3, color: [C.flutter, "#13B9FD", "#45D1FD", C.yellow, C.orange, C.red][i] })), t.at(22), 40, { order: "left", pos: [1.2, 0, 0] }),
  ],
  figures: (t) => [{ at: [-2.2, 1.4], rotY: Math.PI / 2 - 0.5, outfit: { torso: C.orange, print: "plain" }, drop: t.at(30), pose: (f) => ({ face: "grin", walk: f * 0.55 }) }],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(16)} position={[-4.6, 0.32, 3.6]}><Tree /></Pop>
      <Pop f={f} t={t.at(74)} len={12} position={[4.6, 0.32, 1.8]}>
        <Round r={0.07} h={2.2} color={C.gray} />
        <TextSign text={tr("下一步 →", "Next step →")} w={2.2} h={0.8} bg={C.flutter} position={[0, 2.4, 0]} />
      </Pop>
    </>
  ),
});
