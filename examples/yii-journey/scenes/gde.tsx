import { C, Pop, Round, TextSign, box, build, defineScene, textWall } from "../engine/kit";

// Climax: a mountain builds, the hero stands on the summit, and "GDE" in brick letters lands right on the drop.
export default defineScene({
  id: "gde",
  plate: "#f4f4f4",
  confettiAt: [0, 13 * 0.32 + 3.4, -1.4],
  builds: (t) => [
    build("mountain", [...box(-5, 1, -4, 10, 8, 1, C.darkgray), ...box(-4, 4, -3, 8, 6, 1, C.gray), ...box(-3, 7, -2, 6, 4, 1, C.gray), ...box(-2, 10, -1, 4, 2, 1, C.white)], t.at(8), 30),
    build("letters", textWall("GDE", (_r, c) => [C.flutter, "#13B9FD", "#45D1FD"][c < 10 ? 0 : c < 21 ? 1 : 2]), (t.climax ?? t.vEnd) - 24, 24, { pos: [0, 4.6, -4.4], scale: 0.42 }),
  ],
  figures: (t) => {
    const burst = t.climax ?? t.vEnd;
    return [{ at: [-0.2, 0.2], y: 12 * 0.32, outfit: { torso: "#1e1e1e", print: "tee" }, drop: t.at(38),
      pose: (f) => f >= burst
        ? { face: "grin", hold: "trophy", armR: 2.9 + Math.sin(f * 0.3) * 0.15, armL: 2.4, bob: Math.abs(Math.sin(f * 0.3)) * 0.15 }
        : { face: "wow", armR: 0.2 } }];
  },
  View: ({ f, t }) => (
    <Pop f={f} t={t.at(24)} len={12} position={[1.2, 13 * 0.32, -0.4]}>
      <Round r={0.06} h={2.6} color={C.gray} />
      <TextSign text="GDE" w={1.4} h={0.9} bg={C.red} position={[0.72, 2.2, 0]} />
    </Pop>
  ),
});
