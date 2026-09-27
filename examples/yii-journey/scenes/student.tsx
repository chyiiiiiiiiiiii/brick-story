import { C, Laptop, brick, build, defineScene, plastic, popScale, stack, typing } from "../engine/kit";

const ICONS = [C.orange, "#4f5bd5", C.lime, C.red, C.yellow, C.teal];

// Two students at a desk, a giant phone whose app icons pop in... then fall off, grey: nobody used them.
export default defineScene({
  id: "student",
  plate: "#e4cd9e",
  builds: (t) => [
    build("desk", [...[[-4, -1], [1, -1], [-4, 1], [1, 1]].map(([x, z]) => brick(x, 1, z, 1, 1, 6, C.brown)), brick(-4, 7, -1, 6, 3, 1, C.tan)], t.at(20), 10),
    build("phone", stack(2, 1, -3, 4, 1, 21, C.black), t.at(28), 24),
  ],
  figures: (t) => {
    const fail = t.voice(0.55);
    return [
      { at: [-2.0, -1.9], outfit: { torso: C.red, legs: C.navy, print: "hoodie" }, drop: t.at(34), pose: (f) => ({ face: f > fail ? "tired" : "grin", armL: typing(f), armR: typing(f, 1) }) },
      { look: { torso: C.green, legs: C.dark, hair: C.brown, hairStyle: "spiky", print: "plain" }, at: [0.4, -1.9], drop: t.at(40), pose: (f) => ({ face: f > fail ? "tired" : "smile", armL: typing(f, 2), armR: typing(f, 3) }) },
    ];
  },
  sfx: (t) => [{ t: t.vStart, type: "typing", gain: 0.5 }],
  View: ({ f, t }) => {
    const fail = t.voice(0.55);
    const dim = f > fail;
    return (
      <>
        <Laptop position={[-2.0, 8 * 0.32, 0.3]} rotationY={Math.PI} glow={dim ? 0.25 : 0.8} />
        <Laptop position={[0.4, 8 * 0.32, 0.3]} rotationY={Math.PI} glow={dim ? 0.25 : 0.8} />
        {f > t.at(61) && (
          <mesh position={[3.2, 0.32 + 3.36, -1.595]}>
            <planeGeometry args={[2.8, 6.0]} />
            <meshStandardMaterial color="#bcdcff" emissive="#5aa9f0" emissiveIntensity={dim ? 0.04 : 0.22} />
          </mesh>
        )}
        {ICONS.map((col, i) => {
          const s = popScale(f, t.vStart + 4 + i * 8, 8);
          if (s <= 0) return null;
          const fy = 0.32 + 5.3 - Math.floor(i / 2) * 1.3;
          const ft = Math.min(1, Math.max(0, (f - fail - i * 5) / 30));
          const falling = f > fail + i * 5;
          return (
            <mesh key={i} position={[2.6 + (i % 2) * 1.2, falling ? Math.max(0.42, fy - 10.8 * ft * ft) : fy, -1.48 + ft * (1.2 + (i % 3) * 0.6)]}
              rotation={[(Math.PI / 2) * ft, 0, ft * (i % 2 ? 2.4 : -2.1)]} scale={s} material={plastic(falling ? C.gray : col)} castShadow>
              <boxGeometry args={[0.9, 0.9, 0.16]} />
            </mesh>
          );
        })}
      </>
    );
  },
});
