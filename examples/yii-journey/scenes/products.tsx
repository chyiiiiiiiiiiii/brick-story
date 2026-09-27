import { C, box, build, defineScene, tr } from "../engine/kit";
import type { FigureDef } from "../engine/kit";

const tower = (gx: number, layers: number, a: string, b: string) => box(gx, 1, -5, 3, 3, layers, (l) => (l % 2 ? a : b));

// Three product towers rise in turn: HerFIT, an AI companion app, and Moniit (built with a team, who drop in).
export default defineScene({
  id: "products",
  plate: "#a5ca18",
  builds: (t) => [
    build("herfit", tower(-6, 6, C.white, C.pink), t.voice(0.02), 44),
    build("companion", tower(-1, 5, "#c9b6ef", C.purple), t.voice(0.36), 36),
    build("moniit", tower(4, 7, C.navy, C.teal), t.voice(0.66), 44),
  ],
  figures: (t) => [
    { at: [-1.8, 2.2], drop: t.at(30), pose: (f) => ({ face: f > t.voice(0.66) ? "grin" : "focus", hold: "laptop", armL: 0.95, armR: 0.95, headYaw: f < t.voice(0.36) ? -0.4 : f < t.voice(0.66) ? 0 : 0.4 }) },
    ...([[2.9, 1.3, C.green, C.brown, "long"], [5.0, 1.9, C.white, C.black, "spiky"], [3.9, 3.3, C.yellow, "#e8b923", "short"]] as const).map(([x, z, torso, hair, hairStyle], i): FigureDef => ({
      look: { torso, hair, hairStyle, print: "plain" }, at: [x, z], rotY: -0.2, drop: t.voice(0.66) - 6 + i * 5,
      pose: (f) => ({ face: "grin", armR: f > t.voice(0.66) + 50 ? 2.4 + Math.sin(f * 0.4 + i) * 0.3 : 0.3 }),
    })),
  ],
  signs: (t) => [
    { text: "HerFIT", sub: tr("10K+ 訂閱", "10K+ subs"), at: [-3.6, 3.88, -1.59], show: t.voice(0.02) + 53, w: 2.3, h: 1.3, bg: "#e7609a" },
    { text: tr("AI 陪伴 App", "AI Companion"), sub: tr("2 個月上線", "Live in 2 months"), at: [0.4, 2.98, -1.59], show: t.voice(0.36) + 45, w: 2.3, h: 1.3, bg: C.purple },
    { text: "Moniit", sub: tr("首月獲利", "Profitable month 1"), at: [4.4, 4.78, -1.59], show: t.voice(0.66) + 53, w: 2.3, h: 1.3, bg: C.teal },
  ],
});
