import { C, Laptop, Round, TextSign, brick, build, defineScene, easeOut, stack, tr, typing } from "../engine/kit";

const IG = ["#feda75", "#fa7e1e", "#d62976", "#962fbf", "#4f5bd5", "#fa7e1e", "#d62976", "#962fbf", "#feda75"];

// Posting on Instagram (a 3x3 grid of posts fills in), articles pile up, and a GOAL flag rises: become a GDE.
export default defineScene({
  id: "share",
  plate: "#f2f3f2",
  builds: (t) => [
    build("desk", [...[[-6, -1], [-2, -1], [-6, 1], [-2, 1]].map(([x, z]) => brick(x, 1, z, 1, 1, 6, C.brown)), brick(-6, 7, -1, 5, 3, 1, C.white)], t.at(14), 10),
    build("posts", IG.map((color, i) => brick(-2 + (i % 3) * 2, 1 + Math.floor(i / 3) * 5, -5, 2, 1, 5, color, false)), t.vStart + 2, 64),
    build("papers", stack(4, 1, 0, 2, 3, 14, (l) => (l % 2 ? "#f4f4f4" : "#e6ecf3")), t.voice(0.3), 34),
  ],
  figures: (t) => [{ at: [-2.8, -1.9], outfit: { torso: C.navy, print: "hoodie" }, drop: t.at(28),
    pose: (f) => ({ face: f > t.voice(0.66) ? "grin" : "focus", armL: typing(f), armR: typing(f, 1) }) }],
  signs: (t) => [{ text: tr("180+ 篇", "180+ posts"), at: [4.0, 1.13, 2.42], show: t.voice(0.3) + 43, w: 1.8, h: 0.7, bg: C.white, fg: C.dark }],
  sfx: (t) => [{ t: t.vStart, type: "typing", gain: 0.5 }, { t: t.voice(0.66), type: "flag" }],
  View: ({ f, t }) => {
    const goal = t.voice(0.66);
    return (
      <>
        <Laptop position={[-2.8, 8 * 0.32, 0.3]} rotationY={Math.PI} />
        {f > goal - 4 && (
          <group position={[1.4, 0.32, 3.4]}>
            <Round r={0.08} h={4.8} color={C.gray} />
            <group position={[-1.12, 1.2 + easeOut((f - goal) / 18) * 2.8, 0]} rotation={[0, 0, Math.sin(f * 0.2) * 0.03]}>
              <TextSign text="GOAL" sub="Google Developer Expert" w={2.2} h={1.4} bg={C.red} position={[0, 0, 0]} emissive={0.2} />
            </group>
          </group>
        )}
      </>
    );
  },
});
