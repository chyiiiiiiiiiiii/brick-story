import { Baseplate, Brick, C } from "./parts";
import { BuildModel } from "./build";
import { easeOut, islandPos, islandRot, R, RISE, STEP_ANGLE, TOP, chapters } from "./story";
import { Resolved, stairTimes, STAIR_STEPS } from "./resolve";
import { FigureView } from "./Figure";
import { Pop, TextSign } from "./props";

const PLATES = ["#58ab41", "#e4cd9e", "#a0a5a9", "#f2f3f2", "#4b9f4a", "#9fc3e9", "#e4cd9e", "#a5ca18", "#f4f4f4", "#c3c9ef"];

// Floating island: studded baseplate on a stepped rock, then the scene's builds, figures, signs and custom View.
export const IslandView = ({ r, i, f }: { r: Resolved; i: number; f: number }) => {
  const { View } = r.def;
  return (
    <group position={islandPos(i)} rotation={[0, islandRot(i), 0]}>
      <Baseplate w={14} d={12} color={r.def.plate ?? PLATES[i % PLATES.length]} />
      <Brick w={14} d={12} h={3} color="#8b6a4a" position={[0, -0.96, 0]} studs={false} />
      <Brick w={10} d={9} h={3} color={C.darkgray} position={[0, -1.92, 0]} studs={false} />
      <Brick w={6} d={5} h={3} color={C.gray} position={[0.4, -2.88, 0]} studs={false} />
      <Brick w={2} d={2} h={3} color={C.darkgray} position={[-0.4, -3.84, 0.4]} studs={false} />
      {r.builds.map((b) => (
        <group key={b.id} position={b.pos ?? [0, 0, 0]} rotation={[0, b.rotY ?? 0, 0]} scale={b.scale ?? 1}>
          <BuildModel bricks={b.bricks} frame={f} />
        </group>
      ))}
      {r.figures.map((d, k) => (
        <FigureView key={k} d={d} f={f} />
      ))}
      {r.signs.map((s, k) => (
        <Pop key={k} f={f} t={s.show}>
          <TextSign text={s.text} sub={s.sub} w={s.w ?? 2.4} h={s.h ?? 1.2} bg={s.bg ?? C.flutter} fg={s.fg} position={[s.at[0], TOP + s.at[1], s.at[2]]} rotation={s.rot} emissive={0.25} />
        </Pop>
      ))}
      {View && <View f={f} t={r.t} />}
    </group>
  );
};

// Steps between neighbouring islands, dropped in one by one while the camera travels.
export const Stairs = ({ f }: { f: number }) => {
  const out = [];
  for (let k = 1; k < chapters.length; k++) {
    const times = stairTimes(k);
    for (let s = 0; s < STAIR_STEPS; s++) {
      const p = (f - times[s]) / 9;
      if (p < 0) continue;
      const a = (k - 1) * STEP_ANGLE + 0.44 + (s * (STEP_ANGLE - 0.88)) / (STAIR_STEPS - 1);
      const y = (k - 1) * RISE + ((s + 1) * RISE) / (STAIR_STEPS + 1) - 0.64 + (1 - easeOut(p)) * 3;
      out.push(
        <group key={`${k}-${s}`} position={[R * Math.sin(a), y, R * Math.cos(a)]} rotation={[0, a, 0]}>
          <Brick w={3} d={2} h={3} color={s % 2 ? C.white : C.tan} />
        </group>,
      );
    }
  }
  return <>{out}</>;
};
