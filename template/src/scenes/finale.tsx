import { C, Pop, Round, Tree, TextSign, bitmap, box, build, defineScene, stack, tr } from "../engine/kit";

const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];

// Ending: a latte cup with a brick heart rising out of it, and steps climbing off into the sky.
export default defineScene({
  id: "finale",
  plate: "#58ab41",
  builds: (t) => [
    build("cup", [...box(-5, 1, -4, 4, 4, 2, C.white), ...stack(-5, 7, -4, 4, 4, 1, "#c89f6a")], t.at(18), 16),
    build("heart", bitmap(HEART, C.red, { gy: 0 }), t.voice(0.4), 16, { pos: [-2.4, 0.32 + 2.3, -1.6], scale: 0.55 }),
    build("steps", Array.from({ length: 6 }, (_, i) => ({ gx: 0 + i * 2, gy: 1 + i * 2, gz: -3, w: 2, d: 2, h: 3, color: ["#b08a5a", "#c89f6a", "#e9dcc2", C.yellow, C.orange, C.red][i] })), t.at(24), 40, { order: "left" }),
  ],
  figures: (t) => [{ at: [-2.2, 2.0], rotY: Math.PI / 2 - 0.5, drop: t.at(30), pose: (f) => ({ face: "grin", hold: "cup", walk: f * 0.4, armR: 1.1 }) }],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(16)} position={[-4.6, 0.32, 3.6]}><Tree /></Pop>
      <Pop f={f} t={t.at(70)} position={[4.6, 0.32, 1.8]}>
        <Round r={0.07} h={2.2} color={C.gray} />
        <TextSign text={tr("下一步：拉花 →", "Next: latte art →")} w={2.6} h={0.8} bg={C.flutter} position={[0, 2.4, 0]} />
      </Pop>
    </>
  ),
});
