import { C, box, build, cheer, defineScene, stack } from "../engine/kit";
import type { FigureDef } from "../engine/kit";

const SHIRTS = [C.red, C.blue, C.green, C.orange, C.purple, C.white, C.teal, C.yellow, C.navy, C.pink];
const HAIR = [C.black, C.brown, "#e8b923", C.black, C.darkgray];
const STYLE = ["short", "spiky", "long", "cap", "short"] as const;

// A stage with a Flutter Taipei screen; the audience fills in seat by seat as the community grows.
export default defineScene({
  id: "meetup",
  plate: "#4b9f4a",
  builds: (t) => [build("stage", [...box(-6, 1, -6, 12, 4, 2, C.dark), ...stack(-1, 7, -6, 7, 1, 15, C.flutter)], t.at(12), 30)],
  figures: (t) => [
    { at: [-3.2, -2.6], y: 1.92, rotY: 0.35, outfit: { torso: "#1b1b1b", legs: C.dark, print: "open" }, drop: t.at(34),
      pose: (f) => ({ face: "grin", hold: "mic", armL: 0.4 + Math.max(0, Math.sin(f * 0.15)) * 0.9, armR: 1.2, headYaw: Math.sin(f * 0.05) * 0.3 }) },
    ...Array.from({ length: 15 }, (_, i): FigureDef => ({
      look: { torso: SHIRTS[i % 10], hair: HAIR[i % 5], hairStyle: STYLE[i % 5], print: "plain", legs: i % 2 ? C.dark : C.navy },
      at: [-4.0 + (i % 5) * 2.0 + (Math.floor(i / 5) % 2) * 0.5, 1.2 + Math.floor(i / 5) * 1.55],
      rotY: Math.PI,
      drop: t.vStart - 4 + i * 12,
      pose: (f) => ({ armL: f > t.vEnd - 20 ? cheer(f, i) : 0 }),
    })),
  ],
  signs: (t) => [{ text: "Flutter Taipei", sub: "Meetup", at: [2.0, 4.28, -3.98], show: t.at(54), w: 5.2, h: 3.4, bg: C.flutter }],
  sfx: (t) => [{ t: t.vEnd - 22, type: "applause", gain: 0.7 }],
});
