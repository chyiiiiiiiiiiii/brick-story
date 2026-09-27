import { C, Plane, Pop, Round, TextSign, brick, build, clamp01, defineScene, lerp, plastic, tr } from "../engine/kit";

const PINS: [number, number][] = [[-4.4, 1.6], [-2.2, 3.0], [0.2, 1.8], [2.4, 3.2], [4.6, 1.8]];
const arch = (gx: number, color: string, accent: string) => [
  ...Array.from({ length: 12 }, (_, l) => brick(gx, 1 + l, -5, 1, 2, 1, l % 4 === 3 ? accent : color, false)),
  ...Array.from({ length: 12 }, (_, l) => brick(gx + 5, 1 + l, -5, 1, 2, 1, l % 4 === 3 ? accent : color, false)),
  ...[0, 1, 2].map((l) => brick(gx, 13 + l, -5, 6, 2, 1, l === 1 ? accent : color, l === 2)),
];

// Two conference arches (organised in Taipei, co-organised in Seoul) and a talk map a plane hops across.
export default defineScene({
  id: "stage",
  plate: "#9fc3e9",
  builds: (t) => [
    build("formosa", arch(-6, C.flutter, "#45D1FD"), t.voice(0.05) - 10, 26),
    build("alliance", arch(1, C.red, C.white), t.voice(0.3) - 10, 26),
  ],
  figures: (t) => [{ at: [0.2, -1.0], outfit: { torso: "#1e1e1e", print: "tee" }, drop: t.at(30),
    pose: (f) => ({ face: "grin", hold: "mic", armL: 0.5 + Math.max(0, Math.sin(f * 0.14)) * 1.1, armR: 1.3, headYaw: f > t.voice(0.55) ? Math.sin(f * 0.06) * 0.5 : 0 }) }],
  signs: (t) => [
    { text: "Flutter Formosa", sub: "2024 · Taipei", at: [-2.4, 4.58, -2.38], show: t.voice(0.05) + 26, w: 4.4, h: 1.3, bg: C.flutter },
    { text: "Flutter Alliance", sub: "2025 · Seoul", at: [3.2, 4.58, -2.38], show: t.voice(0.3) + 26, w: 4.4, h: 1.3, bg: C.red },
  ],
  sfx: (t) => [{ t: t.voice(0.55), type: "plane" }],
  View: ({ f, t }) => {
    const cities = tr("台北|台中|上海|可倫坡|首爾", "Taipei|Taichung|Shanghai|Colombo|Seoul").split("|");
    const start = t.voice(0.55);
    const at = (u: number): [number, number, number] => {
      const k = Math.min(3.999, Math.max(0, u * 4)), i = Math.floor(k), s = k - i;
      return [lerp(PINS[i][0], PINS[i + 1][0], s), 2.6 + Math.sin(s * Math.PI) * 0.9, lerp(PINS[i][1], PINS[i + 1][1], s)];
    };
    const u = (f - start) / 90;
    const p = at(clamp01(u)), n = at(clamp01(u + 0.01));
    return (
      <>
        {PINS.map(([x, z], i) => (
          <Pop key={i} f={f} t={start - 30 + i * 7} position={[x, 0.32, z]}>
            <Round r={0.06} h={1.1} color={C.gray} />
            <mesh position={[0, 1.2, 0]} material={plastic(C.red)} castShadow><sphereGeometry args={[0.22, 16, 12]} /></mesh>
            <TextSign text={cities[i]} w={1.5} h={0.62} bg="#ffffff" fg={C.dark} position={[0, 1.85, 0]} emissive={0.2} />
          </Pop>
        ))}
        {f > start && u < 1.15 && <Plane position={p} heading={Math.atan2(n[0] - p[0], n[2] - p[2])} />}
      </>
    );
  },
});
