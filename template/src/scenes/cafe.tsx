import { C, box, build, cheer, defineScene, stack, tr, typing } from "../engine/kit";

// Climax: a café counter and menu board; the hero hands over the first ordered cup and the confetti bursts.
export default defineScene({
  id: "cafe",
  plate: "#f2f3f2",
  confettiAt: [-1.2, 7, -2],
  builds: (t) => [
    build("counter", [...box(-6, 1, -2, 12, 2, 2, "#6b4a3a"), ...stack(-6, 7, -2, 12, 2, 1, "#e9dcc2")], t.at(10), 22),
    build("board", stack(-5, 1, -6, 6, 1, 16, "#2b2f36"), t.at(16), 18),
    build("machine", box(2, 8, -2, 3, 2, 2, (l) => (l ? "#c8ccd2" : C.red)), t.at(24), 10),
  ],
  figures: (t) => [
    { at: [-1.2, -3.6], drop: t.at(34), pose: (f) => ({ face: f > (t.climax ?? Infinity) ? "grin" : "focus", hold: "cup", armR: f > (t.climax ?? Infinity) ? cheer(f) : typing(f) }) },
    { look: { torso: C.teal, legs: C.navy, hair: C.brown, hairStyle: "cap", print: "plain" }, at: [1.6, 3.0], rotY: Math.PI, drop: t.voice(0.4), pose: (f) => ({ armL: f > (t.climax ?? Infinity) ? cheer(f, 1) : 0 }) },
  ],
  signs: (t) => [{ text: tr("手沖咖啡", "Pour-over"), sub: tr("本日推薦", "Today's pick"), at: [-2.8, 4.0, -3.98], show: t.at(46), w: 4.2, h: 2.2, bg: "#2b2f36", fg: "#f7f3ea" }],
});
