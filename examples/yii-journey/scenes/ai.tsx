import { Brick, C, Minifig, box, build, defineScene, popScale, textWall, textWidth } from "../engine/kit";

// AI-native: the hero and James (robot) watch two agent robots ferry bricks while a tower builds itself; a tiny yiibu sign.
export default defineScene({
  id: "ai",
  plate: "#c3c9ef",
  builds: (t) => {
    const w = textWidth("yiibu", { rows: 14, font: "helvetica" });
    const underline = Array.from({ length: Math.ceil((w - 6) / 4) }, (_, i) => ({ gx: -Math.floor(w / 2) + 3 + i * 4, gy: 0, gz: 0, w: 4, d: 1, h: 3, color: C.yellow }));
    return [
      build("tower", box(-1, 1, -5, 4, 4, 6, (l) => [C.flutterLight, C.white, C.orange, C.white, C.flutter, C.yellow][l]), t.voice(0.3), 110),
      build("stand", box(4, 1, 2, 2, 2, 1, C.white), t.voice(0.78) - 10, 6),
      build("yiibu", [...textWall("yiibu", C.black, { rows: 14, font: "helvetica", gy: 3 }), ...underline], t.voice(0.78), 20, { order: "left", pos: [3.9, 0.32 + 0.96, 2.6], scale: 0.1, rotY: -0.35 }),
    ];
  },
  figures: (t) => [
    { at: [-4.0, 1.4], rotY: 0.5, outfit: { torso: "#1e1e1e", print: "tee" }, drop: t.at(30),
      pose: (f) => ({ face: "grin", armR: f > t.voice(0.3) ? 1.2 + Math.sin(f * 0.3) * 0.2 : 0.3, headYaw: f > t.voice(0.3) ? 0.4 : 0 }) },
    { look: { torso: C.white, legs: C.gray, print: "robot", hair: null, antenna: true, skin: "#c4c9ce" }, at: [-1.8, 2.2], rotY: -0.2, drop: t.at(38),
      pose: (f) => ({ face: "smile", armL: 1.2 + Math.cos(f * 0.5) * 0.3, headYaw: t.aside && f > t.aside.start - 10 ? -0.5 : 0.2,
        headPitch: t.aside && f > t.aside.start && f < t.aside.start + 60 ? Math.sin(f * 0.8) * 0.08 : 0 }) },
  ],
  View: ({ f, t }) => {
    const on = t.voice(0.3) - 20;
    if (f < on) return null;
    return (
      <>
        {[0, 1].map((k) => {
          const ph = f * 0.05 + k * Math.PI;
          const x = 3.0 + Math.sin(ph) * 1.6, z = -0.2 + k * 1.1;
          const dir = Math.cos(ph) > 0 ? Math.PI / 2 : -Math.PI / 2;
          const s = popScale(f, on + k * 6, 10) * 0.7;
          return (
            <group key={k} scale={s}>
              <Minifig position={[x / 0.7, 0.32 / 0.7, z / 0.7]} rotationY={dir} torso={C.white} legs={C.gray} print="robot" hair={null} antenna skin="#c4c9ce" walk={f * 0.5 + k} armL={0.9} armR={0.9} />
              <group position={[x, 0.32 + 1.2, z]} rotation={[0, dir, 0]}>
                <Brick w={2} d={1} h={3} color={[C.orange, C.flutterLight][k]} position={[0, 0, 0.5]} scale={0.7} />
              </group>
            </group>
          );
        })}
      </>
    );
  },
});
