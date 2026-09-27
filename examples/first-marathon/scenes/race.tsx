import { C, Minifig, TextSign, box, brick, build, cheer, clamp01, defineScene, lerp, textWall } from "../engine/kit";
import type { FigureDef } from "../engine/kit";
import { STORY } from "../engine/story";

const ROAD = "#6c6e68";
const ARCH = "#0057a8";
const RUN_FROM = -4.4; // Alex starts behind the arch...
const RUN_TO = 0.6; // ...runs through it towards the camera, crossing the line near the end of the narration
const FANS: { at: [number, number]; rotY: number; torso: string; hair: string }[] = [
  { at: [-4.0, 1.6], rotY: 0.9, torso: C.teal, hair: C.brown },
  { at: [-4.2, 3.6], rotY: 1.1, torso: C.yellow, hair: C.black },
  { at: [4.0, 1.6], rotY: -0.9, torso: C.purple, hair: C.black },
  { at: [4.2, 3.6], rotY: -1.1, torso: C.lime, hair: "#e8b923" },
];

// Climax: a finish arch on a closed road with fences and fans; Alex runs through the arch,
// and "4:12" lands in brick letters above it on the music drop.
export default defineScene({
  id: "race",
  plate: "#a0a5a9",
  confettiAt: [0, 5.2, 1.0],
  builds: (t) => {
    const burst = t.climax ?? t.vEnd;
    return [
      build("road", [
        brick(-3, 1, -6, 6, 5, 1, ROAD),
        ...[-3, -2, -1, 0, 1, 2].map((gx) => brick(gx, 1, -1, 1, 1, 1, gx % 2 ? C.white : C.black)),
        brick(-3, 1, 0, 6, 6, 1, ROAD),
      ], t.at(6), 12),
      build("arch", [...box(-6, 1, -2, 2, 2, 5, ARCH), ...box(4, 1, -2, 2, 2, 5, ARCH), ...box(-6, 16, -2, 12, 2, 1, C.white)], t.at(12), 26),
      build("fences", [-4, 3].flatMap((gx) => [0, 1, 2, 3, 4, 5].map((gz) => brick(gx, 1, gz, 1, 1, 2, gz % 2 ? C.red : C.white))), t.at(20), 12),
      build("time", textWall("4:12", ARCH), burst - 24, 24, { pos: [0, 6.5, -4.4], scale: 0.28 }),
    ];
  },
  figures: (t) => {
    const burst = t.climax ?? t.vEnd;
    return FANS.map((m, i): FigureDef => ({
      look: { torso: m.torso, legs: C.dark, hair: m.hair, hairStyle: i % 2 ? "long" : "short", print: "plain" },
      at: m.at,
      rotY: m.rotY,
      drop: t.at(30) + i * 5,
      pose: (f) => (f > burst ? { face: "grin", armL: cheer(f, i), armR: cheer(f, i + 1) } : { face: "wow", armR: i % 2 ? 1.2 : 0.4, hold: i % 2 ? null : "flag" }),
    }));
  },
  signs: (t) => [{ text: "FINISH", at: [0, 5.28, 0.04], show: t.at(40), w: 4.6, h: 0.8, bg: C.red, fg: "#ffffff" }],
  sfx: (t) => [{ t: t.voice(0.45), type: "applause", gain: 0.5 }],
  View: ({ f, t }) => {
    const burst = t.climax ?? t.vEnd;
    const start = t.voice(0.05);
    const p = clamp01((f - start) / (burst - 4 - start));
    const z = lerp(RUN_FROM, RUN_TO, p);
    const done = f > burst - 4;
    const h = STORY.hero;
    if (f < t.at(36)) return null;
    return (
      <group position={[0, 0.64, z]}>
        <Minifig
          torso={h.top} legs={h.pants} hair={h.hair} hairStyle="short" print="tee"
          face={done ? "grin" : "focus"}
          walk={done ? null : f * 0.7}
          armL={done ? cheer(f) : 0} armR={done ? cheer(f, 1) : 0}
          bob={done ? Math.abs(Math.sin(f * 0.3)) * 0.15 : 0}
        />
        <TextSign text="1024" w={0.72} h={0.46} bg={C.white} fg={C.dark} position={[0, 2.08, 0.41]} emissive={0.15} />
      </group>
    );
  },
});
