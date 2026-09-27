import { C, Pop, Tree, brick, build, defineScene } from "../engine/kit";
import type { FigureDef } from "../engine/kit";

const PATH = "#c8b48a";
const MATES: { at: [number, number]; torso: string; hair: string; style: "short" | "spiky" | "long" | "cap" }[] = [
  { at: [-3.6, 0.2], torso: C.teal, hair: C.brown, style: "cap" },
  { at: [-1.2, -0.4], torso: C.blue, hair: C.black, style: "long" },
  { at: [1.2, -0.4], torso: C.lime, hair: "#e8b923", style: "spiky" },
  { at: [3.6, 0.2], torso: C.pink, hair: C.black, style: "long" },
  { at: [-2.5, 2.4], torso: C.purple, hair: C.darkgray, style: "short" },
  { at: [2.5, 2.4], torso: C.red, hair: C.brown, style: "short" },
];

// The run club: a banner on two poles; Alex arrives alone and flags, then the club drops in around him and everyone jogs together.
export default defineScene({
  id: "club",
  plate: "#58ab41",
  builds: (t) => [
    build("path", [-7, -3, 1, 5].map((gx) => brick(gx, 1, -2, gx === 5 ? 2 : 4, 8, 1, PATH)), t.at(8), 14, { order: "left" }),
    build("poles", [brick(-4, 1, -5, 1, 1, 18, C.darkgray), brick(3, 1, -5, 1, 1, 18, C.darkgray)], t.at(16), 14),
  ],
  figures: (t) => {
    const together = t.voice(0.68);
    const mates = MATES.map((m, i): FigureDef => {
      const drop = t.voice(0.6) + i * 5;
      return {
        look: { torso: m.torso, legs: i % 2 ? C.dark : C.navy, hair: m.hair, hairStyle: m.style, print: "tee" },
        at: m.at,
        y: 0.32,
        drop,
        pose: (f) => (f > drop + 14 ? { face: "grin", walk: f * 0.5 + i } : { face: "smile" }),
      };
    });
    return [
      ...mates,
      {
        at: [0, 2.9], y: 0.32, drop: t.voice(0.05),
        pose: (f) => f > together
          ? { face: "grin", walk: f * 0.5 }
          : f > t.voice(0.4) ? { face: "tired", headPitch: 0.3, armL: 0.2, armR: 0.2 } : { face: "smile", armR: 0.4 },
      },
    ];
  },
  signs: (t) => [{ text: "RUN CLUB", at: [0, 4.6, -3.18], show: t.at(34), w: 5.0, h: 1.2, bg: C.orange, fg: "#ffffff" }],
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(12)} position={[-5.1, 0.32, -4.0]}><Tree s={0.9} /></Pop>
      <Pop f={f} t={t.at(18)} position={[5.2, 0.32, -4.1]}><Tree s={0.75} color={C.lime} /></Pop>
    </>
  ),
});
