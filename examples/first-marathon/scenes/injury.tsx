import { C, Minifig, Pop, box, brick, build, clamp01, defineScene, easeOut, stack } from "../engine/kit";
import { STORY, chapters } from "../engine/story";

const WOOD = "#8b6a4a";
const SHOE = C.orange;
const FEET_X = -0.5; // lying figure: feet at this x, head towards the pillow on the left
const BODY_Y = 1.6 + 0.9; // mattress top + half the figure's width
const BODY_Z = -0.8;

// A month off: Alex lies in bed with an ice pack, the running shoes wait on the floor,
// and a 30-day calendar on the wall fills in red in step with the "DAYS OFF" counter.
export default defineScene({
  id: "injury",
  plate: "#c89f6a",
  builds: (t) => [
    build("bed", [
      ...box(-6, 1, -3, 7, 4, 1, WOOD),
      ...stack(-6, 4, -3, 7, 4, 1, C.white),
      ...box(-7, 1, -3, 1, 4, 2, WOOD),
      brick(-6, 5, -2, 2, 2, 2, "#9fc3e9"),
    ], t.at(8), 20),
    build("wall", box(0, 1, -6, 7, 1, 4, "#dfe3e8"), t.at(12), 18),
    // a pair of running shoes in profile: white sole, orange upper, raised heel collar, white tongue
    build("shoes", [[1, 2], [2, 3]].flatMap(([gx, gz]) => [brick(gx, 1, gz, 4, 1, 1, C.white), brick(gx, 2, gz, 4, 1, 1, SHOE), brick(gx, 3, gz, 2, 1, 2, SHOE), brick(gx + 2, 3, gz, 1, 1, 1, C.white)]), t.voice(0.62), 10),
  ],
  sfx: (t) => [{ t: t.at(38), type: "pop" }, { t: t.voice(0.2) + 6, type: "thud", gain: 0.5 }],
  View: ({ f, t }) => {
    const c = chapters[t.index];
    const days = Math.round(easeOut(clamp01((f - c.voice.start - 20) / (c.voice.dur - 30))) * 30);
    const h = STORY.hero;
    return (
      <>
        <Pop f={f} t={t.at(30)} len={14} position={[FEET_X, BODY_Y, BODY_Z]}>
          <group rotation={[0, 0, Math.PI / 2]}>
            <Minifig torso={h.top} legs={h.pants} hair={h.hair} hairStyle="short" print="tee" face="tired" />
          </group>
        </Pop>
        <Pop f={f} t={t.voice(0.2)} position={[FEET_X - 0.75, BODY_Y + 0.9, BODY_Z]}>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.24, 0.7]} />
            <meshPhysicalMaterial color="#bfe6fb" roughness={0.3} clearcoat={0.6} />
          </mesh>
        </Pop>
        {/* the calendar: header band + 6 x 5 day tiles */}
        {f > t.at(34) && (
          <group position={[2.8, 0.32, -3.95]}>
            <mesh position={[0, 3.35, 0]}>
              <boxGeometry args={[3.5, 0.42, 0.05]} />
              <meshStandardMaterial color={C.red} />
            </mesh>
            {Array.from({ length: 30 }, (_, i) => (
              <group key={i} position={[-1.45 + (i % 6) * 0.58, 2.8 - Math.floor(i / 6) * 0.56, 0]}>
                <mesh>
                  <boxGeometry args={[0.48, 0.46, 0.05]} />
                  <meshStandardMaterial color={C.white} />
                </mesh>
                {i < days && [0.8, -0.8].map((r) => (
                  <mesh key={r} position={[0, 0, 0.04]} rotation={[0, 0, r]}>
                    <boxGeometry args={[0.5, 0.08, 0.02]} />
                    <meshStandardMaterial color="#d8322a" emissive="#d8322a" emissiveIntensity={0.3} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
      </>
    );
  },
});
