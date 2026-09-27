import { C, Rings, box, brick, build, defineScene, stack } from "../engine/kit";

// On a table (top at gy 7): a glass server, a dripper of ever-wider plates on top of it, and a kettle.
const SERVER_TOP = 7 + 4;
const dripper = [2, 3, 4, 5, 6].map((w, i) => brick(-Math.ceil(w / 2), SERVER_TOP + i, -2 - Math.ceil(w / 2), w, w, 1, C.white, i === 4));

export default defineScene({
  id: "pour",
  plate: "#9fc3e9",
  builds: (t) => [
    build("table", box(-5, 1, -5, 10, 5, 2, "#c89f6a"), t.at(12), 18),
    build("server", stack(-2, 7, -4, 3, 3, 4, "#bfe6fb"), t.at(30), 8),
    build("dripper", dripper, t.voice(0.05), 16),
    build("kettle", [...box(2, 7, -3, 2, 2, 2, "#c8ccd2"), brick(4, 11, -3, 2, 1, 1, "#c8ccd2", false), brick(2, 13, -3, 1, 1, 1, C.black)], t.voice(0.3), 12),
  ],
  figures: (t) => [{ at: [4.2, 2.2], rotY: -0.6, drop: t.at(30), pose: (f) => ({ face: "focus", armR: 1.2 + Math.sin(f * 0.3) * 0.15, armL: 0.9 }) }],
  View: ({ f, t }) => <Rings frame={f} t0={t.voice(0.35)} t1={t.voice(0.95)} position={[-0.4, 0.32 + (SERVER_TOP + 5) * 0.32, -2.0]} color="#ffffff" />,
});
