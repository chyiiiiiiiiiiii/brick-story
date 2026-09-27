import { C, Pop, Tree, build, defineScene, tr } from "../engine/kit";

// Steps rising along the back of the island: the distances so far, then "next" and one blank step for what comes after.
const STEPS = ["3K", "10K", "21K", "42K", tr("下一場", "NEXT"), ""];
const STEP_COLORS = [C.yellow, "#f7b733", C.orange, C.red, C.flutter, C.white];
const HERO: [number, number] = [3.4, 2.2];
const HERO_ROT = -0.5;

// Ending: a staircase of distances climbing to "next"; Alex, finisher medal on his chest, walks towards it and waves.
export default defineScene({
  id: "next",
  plate: "#58ab41",
  builds: (t) => [
    build("steps", STEPS.map((_, i) => ({ gx: -6 + i * 2, gy: 1 + i * 2, gz: -4, w: 2, d: 2, h: 3, color: STEP_COLORS[i] })), t.voice(0.02), 40, { order: "left" }),
  ],
  figures: (t) => [{ at: HERO, rotY: HERO_ROT, drop: t.at(34), pose: (f) => ({ face: "grin", walk: f < t.voice(0.72) ? f * 0.4 : null, armR: f > t.voice(0.72) ? 2.5 + Math.sin(f * 0.4) * 0.3 : 0 }) }],
  signs: (t) => STEPS.flatMap((label, i) =>
    label ? [{ text: label, at: [(-6 + i * 2 + 1) * 0.8, (i * 2 + 1.5) * 0.32, -1.58] as [number, number, number], show: t.voice(0.02) + 10 + i * 8, w: 1.5, h: 0.62, bg: C.white, fg: C.dark }] : []),
  View: ({ f, t }) => (
    <>
      <Pop f={f} t={t.at(10)} position={[-5.0, 0.32, 3.4]}><Tree /></Pop>
      <Pop f={f} t={t.at(16)} position={[-1.2, 0.32, 3.2]}><Tree s={0.8} color={C.lime} /></Pop>
      {/* finisher medal on Alex's chest, once he has landed */}
      <Pop f={f} t={t.at(50)} position={[HERO[0] + Math.sin(HERO_ROT) * 0.42, 0.32 + 2.0, HERO[1] + Math.cos(HERO_ROT) * 0.42]}>
        <group rotation={[0, HERO_ROT, 0]}>
          <mesh position={[-0.16, 0.4, 0]} rotation={[0, 0, 0.45]}>
            <boxGeometry args={[0.14, 0.62, 0.03]} />
            <meshStandardMaterial color={C.blue} />
          </mesh>
          <mesh position={[0.16, 0.4, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.14, 0.62, 0.03]} />
            <meshStandardMaterial color={C.red} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 24]} />
            <meshPhysicalMaterial color="#e8b923" emissive="#6b4b00" emissiveIntensity={0.4} roughness={0.25} clearcoat={0.6} />
          </mesh>
        </group>
      </Pop>
    </>
  ),
});
