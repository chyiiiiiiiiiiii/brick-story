import { C, box, brick, build, defineScene, noise, tr } from "../engine/kit";

const BAGS = [
  { gx: -6, color: "#b08a5a", name: tr("衣索比亞", "Ethiopia") },
  { gx: -2, color: "#7a8f4a", name: tr("肯亞", "Kenya") },
  { gx: 2, color: "#a0553a", name: tr("哥倫比亞", "Colombia") },
];

// Three origin bags build one by one; roasted beans scatter across the front of the island.
export default defineScene({
  id: "beans",
  plate: "#e4cd9e",
  builds: (t) => [
    ...BAGS.map((b, i) => build(`bag${i}`, box(b.gx, 1, -4, 3, 2, 3, (l) => (l === 2 ? C.brown : b.color)), t.voice(0.05 + i * 0.22), 14)),
    build("beans", Array.from({ length: 22 }, (_, i) => brick(Math.floor(noise(i) * 12) - 6, 1, Math.floor(noise(i + 40) * 5) + 0, 1, 1, 1, i % 3 ? "#5a3a22" : "#3f2716", false)), t.voice(0.3), 60, { order: "random" }),
  ],
  figures: (t) => [{ at: [3.6, 3.0], rotY: -0.5, drop: t.at(30), pose: (f) => ({ face: "focus", headYaw: Math.sin(f * 0.05) * 0.5, armR: 1.0 }) }],
  signs: (t) => BAGS.map((b, i) => ({ text: b.name, at: [(b.gx + 1.5) * 0.8, 1.5, -1.58] as [number, number, number], show: t.voice(0.05 + i * 0.22) + 24, w: 2.2, h: 0.8, bg: "#f7f3ea", fg: C.dark })),
});
