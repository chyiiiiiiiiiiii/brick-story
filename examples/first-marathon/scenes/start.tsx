import { C, Pop, Round, Tree, box, brick, build, defineScene } from "../engine/kit";

const TRACK = "#b5523b";
const RUNS: [number, number][] = [[-7, 4], [-3, 4], [1, 4], [5, 2]];

// Week 1: a red running track with 1K / 2K posts and a "3 KM" arch far to the right; Alex stops short, bent over and panting.
export default defineScene({
  id: "start",
  plate: "#4b9f4a",
  builds: (t) => [
    build("track", [
      ...RUNS.map(([gx, w]) => brick(gx, 1, 1, w, 3, 1, TRACK)),
      ...RUNS.map(([gx, w]) => brick(gx, 1, 0, w, 1, 1, C.white)),
      ...RUNS.map(([gx, w]) => brick(gx, 1, 4, w, 1, 1, C.white)),
    ], t.at(8), 18, { order: "left" }),
    build("bench", [brick(-6, 1, -4, 1, 1, 3, C.darkgray), brick(-2, 1, -4, 1, 1, 3, C.darkgray), brick(-6, 4, -5, 5, 2, 1, "#8b6a4a"), brick(-6, 5, -5, 5, 1, 4, "#8b6a4a")], t.at(20), 10),
    build("bottle", [brick(-4, 5, -4, 1, 1, 3, "#54c5f8"), brick(-4, 8, -4, 1, 1, 1, C.white)], t.at(34), 4),
    build("hedge", box(1, 1, -6, 6, 2, 1, C.green), t.at(14), 10),
  ],
  figures: (t) => {
    const stop = t.voice(0.58);
    return [{
      at: [-1.4, 2.0], y: 0.32, rotY: 0.55, drop: t.at(36),
      pose: (f) => f < stop
        ? { face: "focus", walk: f * 0.55 }
        : { face: "tired", headPitch: 0.35, armL: 0.35, armR: 0.35, bob: Math.sin(f * 0.3) * 0.05 },
    }];
  },
  signs: (t) => [
    { text: "1K", at: [-4.0, 1.9, 0.35], show: t.at(30), w: 0.9, h: 0.6, bg: C.white, fg: C.dark },
    { text: "2K", at: [0.4, 1.9, 0.35], show: t.at(34), w: 0.9, h: 0.6, bg: C.white, fg: C.dark },
    { text: "3 KM", at: [3.9, 3.1, 2.0], show: t.voice(0.18), w: 2.4, h: 0.8, bg: C.red, fg: "#ffffff" },
  ],
  View: ({ f, t }) => {
    const stop = t.voice(0.58);
    return (
      <>
        <Pop f={f} t={t.at(28)} position={[-4.0, 0.32, 0.3]}><Round r={0.06} h={1.3} color={C.gray} /></Pop>
        <Pop f={f} t={t.at(32)} position={[0.4, 0.32, 0.3]}><Round r={0.06} h={1.3} color={C.gray} /></Pop>
        <Pop f={f} t={t.voice(0.14)} position={[2.7, 0.64, 2.0]}><Round r={0.09} h={3.1} color={C.white} /></Pop>
        <Pop f={f} t={t.voice(0.16)} position={[5.1, 0.64, 2.0]}><Round r={0.09} h={3.1} color={C.white} /></Pop>
        <Pop f={f} t={t.at(10)} position={[-5.0, 0.32, -3.9]}><Tree s={0.9} /></Pop>
        {/* sweat drops once Alex stops */}
        {f > stop && [0, 1, 2].map((i) => {
          const p = ((f - stop + i * 9) % 27) / 27;
          return (
            <mesh key={i} position={[-1.4 + (i - 1) * 0.35, 0.64 + 3.9 - p * 1.6, 2.35]} scale={1 - p * 0.6}>
              <sphereGeometry args={[0.1, 12, 10]} />
              <meshStandardMaterial color="#8fd3ff" emissive="#54c5f8" emissiveIntensity={0.4} />
            </mesh>
          );
        })}
      </>
    );
  },
});
