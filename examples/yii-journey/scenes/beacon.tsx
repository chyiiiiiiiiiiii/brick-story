import { Brick, C, Pop, Rings, Round, TextSign, Tree, box, brick, build, defineScene, easeOut, lerp, plastic, stack, tr } from "../engine/kit";

// A Taichung bus pulls up to a stop whose Bluetooth bell rings out; then an SBIR plaque builds.
export default defineScene({
  id: "beacon",
  plate: "#a0a5a9",
  builds: (t) => [
    build("road", [...[0, 1, 2, 3].map((i) => brick(-7 + i * 4 - (i === 3 ? 1 : 0), 1, -3, i === 3 ? 3 : 4, 4, 1, C.darkgray, false)), ...[-6, -2, 2].map((x) => brick(x, 2, -2, 2, 1, 1, C.white, false))], t.at(16), 8, { order: "left" }),
    build("plaque", [...box(3, 1, -6, 4, 2, 2, C.white), ...stack(3, 7, -5, 4, 1, 9, (l) => (l % 3 === 2 ? C.yellow : C.navy))], t.voice(0.72) - 26, 24),
  ],
  figures: (t) => [{ at: [3.4, 2.8], outfit: { torso: "#3b6fb6", print: "shirt" }, drop: t.at(30),
    pose: (f) => ({ face: "smile", headYaw: f > t.voice(0.3) - 40 && f < t.voice(0.72) - 10 ? -0.6 : 0, armR: f > t.voice(0.72) + 6 ? 2.4 : 0.7 }) }],
  signs: (t) => [{ text: "SBIR", sub: tr("經濟部 · 2020", "MOEA · 2020"), at: [4.0, 3.38, -3.18], show: t.voice(0.72) + 7, w: 3.0, h: 2.4, bg: C.navy }],
  sfx: (t) => [
    { t: t.voice(0.3) - 50, type: "bus" },
    { t: t.voice(0.3) + 6, type: "ding" },
    ...[0, 1, 2, 3].map((k) => ({ t: t.voice(0.3) + 10 + k * 14, type: "ping" as const, gain: 0.5 })),
    { t: t.voice(0.72) + 2, type: "sparkle" },
  ],
  View: ({ f, t }) => {
    const arrive = t.voice(0.3);
    const busX = lerp(-12, -1.6, easeOut((f - (arrive - 50)) / 50));
    const bell = f > arrive + 6 && f < arrive + 70;
    return (
      <>
        <group position={[busX, 0.64, -0.8]} visible={f > arrive - 50}>
          <Brick w={9} d={3} h={3} color={C.blue} position={[0, 0.25, 0]} studs={false} />
          <Brick w={9} d={3} h={3} color="#bfe6fb" position={[0, 1.21, 0]} studs={false} />
          <Brick w={9} d={3} h={1} color={C.white} position={[0, 2.17, 0]} />
          {[-2.6, 2.6].map((x) => [-1.2, 1.2].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]} material={plastic(C.black)} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.3, 20]} />
            </mesh>
          )))}
          <TextSign text={tr("台中客運", "Taichung Bus")} w={3.2} h={0.62} bg={C.blue} position={[0, 0.72, 1.215]} emissive={0.1} />
        </group>
        <Round r={0.12} h={3.4} color={C.gray} position={[1.6, 0.32, 1.8]} />
        <TextSign text={tr("公車站", "Bus Stop")} w={1.5} h={0.7} bg="#1f6f3f" position={[1.6, 0.32 + 3.7, 1.8]} />
        <mesh position={[1.6, 0.32 + 2.5, 1.95]} material={plastic(C.red, { emissive: C.red, emissiveIntensity: bell ? 2.2 : 0 })} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.25]} />
        </mesh>
        <Rings frame={f} t0={arrive + 10} t1={arrive + 60} position={[1.6, 0.32 + 2.5, 1.95]} />
        <Pop f={f} t={t.at(12)} position={[-5.0, 0.32, 3.8]}><Tree s={0.8} /></Pop>
      </>
    );
  },
});
