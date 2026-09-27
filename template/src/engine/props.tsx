import { ReactNode, useMemo } from "react";
import * as THREE from "three";
import { hash } from "./bricks";
import { C, plastic } from "./parts";

const texCache = new Map<string, THREE.CanvasTexture>();

// Canvas-drawn sign texture. `draw` paints onto a W x H canvas.
export const useCanvasTex = (key: string, W: number, H: number, draw: (g: CanvasRenderingContext2D) => void) =>
  useMemo(() => {
    if (texCache.has(key)) return texCache.get(key)!;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    draw(cv.getContext("2d")!);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(key, t);
    return t;
  }, [key]);

export const CJK = '"PingFang TC", "Noto Sans TC", "Heiti TC", sans-serif';

export const TextSign = ({
  text, sub, w, h, bg, fg = "#ffffff", position, rotation = [0, 0, 0], scale = 1, font = CJK, emissive = 0.25,
}: {
  text: string; sub?: string; w: number; h: number; bg: string; fg?: string;
  position: [number, number, number]; rotation?: [number, number, number]; scale?: number; font?: string; emissive?: number;
}) => {
  const W = 1024;
  const H = Math.round((1024 * h) / w);
  const tex = useCanvasTex(`sign-${text}-${sub}-${bg}-${fg}-${w}x${h}`, W, H, (g) => {
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, W, H, Math.min(W, H) * 0.12);
    g.fill();
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const size = sub ? H * 0.42 : H * 0.56;
    g.font = `900 ${size}px ${font}`;
    let fs = size;
    while (g.measureText(text).width > W * 0.88 && fs > 10) {
      fs *= 0.92;
      g.font = `900 ${fs}px ${font}`;
    }
    g.fillText(text, W / 2, sub ? H * 0.4 : H * 0.53);
    if (sub) {
      g.globalAlpha = 0.85;
      let ss = H * 0.2;
      g.font = `600 ${ss}px ${font}`;
      while (g.measureText(sub).width > W * 0.9 && ss > 8) {
        ss *= 0.92;
        g.font = `600 ${ss}px ${font}`;
      }
      g.fillText(sub, W / 2, H * 0.76);
    }
  });
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: emissive, roughness: 0.5, transparent: true }), [tex, emissive]);
  return (
    <mesh position={position} rotation={rotation} scale={scale} material={mat}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
};

// Vertical gradient sky dome.
export const Sky = ({ top, bottom }: { top: string; bottom: string }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
          void main(){ float h = smoothstep(-0.45, 0.65, vP.y); gl_FragColor = vec4(mix(bottom, top, h), 1.0);
          #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  mat.uniforms.top.value.set(top);
  mat.uniforms.bottom.value.set(bottom);
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
};

// Burst of 1x1 plates that fly up and tumble down.
export const Confetti = ({ frame, t0, origin, count = 140 }: { frame: number; t0: number; origin: [number, number, number]; count?: number }) => {
  const f = frame - t0;
  const colors = [C.red, C.yellow, C.flutterLight, C.lime, C.orange, C.pink, C.white, C.flutter];
  const geo = useMemo(() => new THREE.BoxGeometry(0.34, 0.12, 0.34), []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, plastic("#ffffff"), count);
    for (let i = 0; i < count; i++) m.setColorAt(i, new THREE.Color(colors[i % colors.length]));
    m.frustumCulled = false;
    m.castShadow = true;
    return m;
  }, [geo, count]);
  const o = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    if (f < 0 || f > 150) {
      o.scale.setScalar(0);
    } else {
      const t = f / 30;
      const a = hash(i) * Math.PI * 2;
      const sp = 2 + hash(i + 11) * 4.5;
      const vy = 6 + hash(i + 23) * 7;
      const drag = 1 - Math.exp(-t * 1.4);
      o.position.set(origin[0] + Math.cos(a) * sp * drag, origin[1] + vy * t - 4.2 * t * t, origin[2] + Math.sin(a) * sp * drag);
      o.rotation.set(t * (3 + hash(i + 3) * 6), t * 4 * hash(i + 5), t * (2 + hash(i + 9) * 5));
      o.scale.setScalar(f > 120 ? (150 - f) / 30 : 1);
    }
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// Expanding Bluetooth-style rings.
export const Rings = ({ frame, t0, t1, position, color = "#54c5f8" }: { frame: number; t0: number; t1: number; position: [number, number, number]; color?: string }) => {
  if (frame < t0 || frame > t1 + 30) return null;
  const rings = [0, 10, 20].map((off) => {
    const p = ((frame - t0 + off) % 30) / 30;
    return p;
  });
  return (
    <group position={position}>
      {rings.map((p, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + p * 3.2}>
          <torusGeometry args={[0.5, 0.035, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={(1 - p) * 0.9} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

export const Laptop = ({ position, rotationY = 0, glow = 0.7 }: { position: [number, number, number]; rotationY?: number; glow?: number }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh material={plastic(C.gray)} position={[0, 0.03, 0]} castShadow>
      <boxGeometry args={[1.3, 0.06, 0.9]} />
    </mesh>
    <group position={[0, 0.06, -0.45]} rotation={[-0.25, 0, 0]}>
      <mesh material={plastic(C.gray)} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.3, 0.9, 0.05]} />
      </mesh>
      <mesh position={[0, 0.45, 0.03]}>
        <planeGeometry args={[1.18, 0.78]} />
        <meshStandardMaterial color="#1b2a3a" emissive="#54c5f8" emissiveIntensity={glow} />
      </mesh>
    </group>
  </group>
);

export const Plane = ({ position, heading }: { position: [number, number, number]; heading: number }) => (
  <group position={position} rotation={[0, heading, 0]}>
    <mesh material={plastic(C.white)} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.18, 1.8, 16]} />
    </mesh>
    <mesh material={plastic(C.red)} position={[0, 0, 0.95]} castShadow>
      <sphereGeometry args={[0.22, 16, 12]} />
    </mesh>
    <mesh material={plastic(C.white)} position={[0, 0, 0.1]} castShadow>
      <boxGeometry args={[2.2, 0.06, 0.5]} />
    </mesh>
    <mesh material={plastic(C.flutter)} position={[0, 0.35, -0.75]} castShadow>
      <boxGeometry args={[0.06, 0.6, 0.35]} />
    </mesh>
    <mesh material={plastic(C.white)} position={[0, 0.05, -0.8]} castShadow>
      <boxGeometry args={[0.9, 0.05, 0.3]} />
    </mesh>
  </group>
);

// Scales its children in with a small overshoot at frame t (hidden before).
export const popScale = (f: number, t: number, len = 10) => {
  const p = (f - t) / len;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 + Math.sin(p * Math.PI) * 0.25 * (1 - p) - Math.pow(1 - p, 3);
};
export const Pop = ({ f, t, len = 10, position, children }: { f: number; t: number; len?: number; position?: [number, number, number]; children: ReactNode }) => {
  const s = popScale(f, t, len);
  return s > 0 ? (
    <group position={position} scale={s}>
      {children}
    </group>
  ) : null;
};

// A flat panel with a canvas-drawn texture (book covers, posters, screens). `id` must be unique per design.
export const CanvasPanel = ({ id, w, h, px = 700, draw, position, rotation = [0, 0, 0], glow = 0.12 }: {
  id: string; w: number; h: number; px?: number; draw: (g: CanvasRenderingContext2D, W: number, H: number) => void;
  position: [number, number, number]; rotation?: [number, number, number]; glow?: number;
}) => {
  const W = px;
  const H = Math.round((px * h) / w);
  const tex = useCanvasTex(`panel-${id}`, W, H, (g) => draw(g, W, H));
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: glow }), [tex, glow]);
  return (
    <mesh position={position} rotation={rotation} material={mat}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
};
