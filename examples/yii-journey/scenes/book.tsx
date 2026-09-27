import { C, CanvasPanel, Pop, box, brick, build, cheer, defineScene, plastic, stack } from "../engine/kit";

// The real book cover, redrawn: white cover, navy title, Dash in glasses, the 2023 iThome badge.
const drawCover = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#fbfbfd"; g.fillRect(0, 0, 700, 1000);
  g.fillStyle = "#1f3a5f"; g.fillRect(40, 40, 330, 50);
  g.fillStyle = "#fff"; g.font = '700 30px "PingFang TC", sans-serif'; g.fillText("開始鍛鍊 Flutter 技能", 60, 76);
  g.fillStyle = "#1f3a5f"; g.textAlign = "right"; g.font = '900 112px "Futura", "PingFang TC", sans-serif'; g.fillText("Flutter", 400, 220);
  g.textAlign = "left"; g.font = '900 70px "PingFang TC", sans-serif'; g.fillText("勇者之書", 415, 214);
  g.textAlign = "center"; g.fillStyle = "#2b6cb0"; g.font = '700 38px "PingFang TC", sans-serif'; g.fillText("跨平台程式開發的新手入坑首選指南", 350, 285);
  g.fillStyle = "#333"; g.font = '500 28px "PingFang TC", sans-serif'; g.fillText("陳虔逸（Yii Chen）、謝忠穎（Dorara Hsieh）著", 350, 340);
  const cx = 350, cy = 560;
  g.fillStyle = "#3f8fe0";
  g.beginPath(); g.ellipse(cx, cy, 145, 135, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(cx - 150, cy - 20, 70, 32, -0.8, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(cx + 150, cy - 20, 70, 32, 0.8, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx - 40, cy - 125); g.quadraticCurveTo(cx, cy - 200, cx + 30, cy - 128); g.fill();
  g.fillStyle = "#dcecfb"; g.beginPath(); g.ellipse(cx, cy + 55, 88, 70, 0, 0, Math.PI * 2); g.fill();
  for (const dx of [-48, 48]) {
    g.fillStyle = "#fff"; g.beginPath(); g.arc(cx + dx, cy - 30, 32, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(cx + dx + 5, cy - 26, 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 9; g.beginPath(); g.roundRect(cx + dx - 42, cy - 70, 84, 76, 18); g.stroke();
  }
  g.fillStyle = "#f2a33a"; g.beginPath(); g.moveTo(cx - 20, cy + 10); g.lineTo(cx + 20, cy + 10); g.lineTo(cx, cy + 38); g.closePath(); g.fill();
  g.fillStyle = "#5b6b7c";
  for (const [x, y, w, h] of [[110, 470, 70, 110], [560, 420, 110, 70], [580, 640, 70, 110], [140, 690, 110, 70]]) { g.beginPath(); g.roundRect(x, y, w, h, 12); g.fill(); }
  g.fillStyle = "#1f3a5f"; g.fillRect(0, 780, 700, 220);
  g.fillStyle = "#fff"; g.font = '900 52px "PingFang TC", sans-serif'; g.fillText("從基礎語法到進階特性", 350, 860);
  g.fillStyle = "#f4c542"; g.beginPath(); g.arc(600, 760, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#1f3a5f"; g.font = '900 34px "PingFang TC", sans-serif'; g.fillText("2023", 600, 745); g.fillText("優選", 600, 790);
};

// A standing book (co-written with Dorara) and an award podium; both of them cheer when the trophy appears.
export default defineScene({
  id: "book",
  plate: "#e4cd9e",
  builds: (t) => [
    build("book", [...stack(-6, 1, -3, 5, 2, 18, C.white), ...stack(-6, 1, -1, 5, 1, 18, "#f7f3ea")], t.at(10), 20),
    build("podium", [...box(2, 1, -2, 2, 2, 2, C.white), brick(2, 7, -2, 2, 2, 1, C.yellow)], t.voice(0.62) - 16, 12),
  ],
  figures: (t) => {
    const win = t.voice(0.62) + 4;
    return [
      { at: [1.3, 2.0], drop: t.at(32), pose: (f) => ({ face: "grin", armR: f > win ? cheer(f) : 0.2 }) },
      { look: { torso: "#6f757c", legs: C.dark, hair: "#161616", print: "plain" }, at: [3.5, 2.0], drop: t.at(40), pose: (f) => ({ face: "grin", armL: f > win ? cheer(f, 1) : 0.2 }) },
    ];
  },
  signs: (t) => [{ text: "Global Gamers Challenge", sub: "Best Integration · 1st", at: [2.4, 4.58, -0.8], show: t.voice(0.62) + 10, w: 3.6, h: 1.0, bg: "#1f3a5f" }],
  sfx: (t) => [{ t: t.at(30), type: "thud" }, { t: t.voice(0.62) + 4, type: "sparkle" }, { t: t.voice(0.62) + 8, type: "applause", gain: 0.5 }],
  View: ({ f, t }) => {
    const gold = plastic("#e8b923", { emissive: "#7a5200", emissiveIntensity: 0.5 });
    return (
      <>
        {f > t.at(39) && <CanvasPanel id="flutter-brave-cover" w={3.8} h={5.4} draw={drawCover} position={[-2.8, 0.32 + 2.9, 0.012]} />}
        <Pop f={f} t={t.voice(0.62) + 2} len={12} position={[2.4, 8 * 0.32, -0.8]}>
          <mesh material={gold} position={[0, 0.15, 0]} castShadow><cylinderGeometry args={[0.35, 0.45, 0.3, 24]} /></mesh>
          <mesh material={gold} position={[0, 0.55, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.5, 12]} /></mesh>
          <mesh material={gold} position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.6, 0.18, 0.9, 28]} /></mesh>
        </Pop>
      </>
    );
  },
});
