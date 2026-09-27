import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Brick units: 1 stud pitch = 0.8, brick height = 0.96, plate = 0.32 (real brick proportions)
export const P = 0.8;
export const BH = 0.96;
export const PH = 0.32;

import { C } from "./colors";
export { C };

const matCache = new Map<string, THREE.Material>();
export const plastic = (color: string, opts: { transparent?: boolean; emissive?: string; emissiveIntensity?: number } = {}) => {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.32,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.22,
        transparent: !!opts.transparent,
        opacity: opts.transparent ? 0.55 : 1,
        emissive: opts.emissive ?? "#000000",
        emissiveIntensity: opts.emissiveIntensity ?? 0,
      }),
    );
  }
  return matCache.get(key)!;
};

const geoCache = new Map<string, THREE.BufferGeometry>();
const cached = <T extends THREE.BufferGeometry>(key: string, make: () => T): T => {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key) as T;
};

export const studGeo = () => cached("stud", () => new THREE.CylinderGeometry(0.24, 0.24, 0.17, 24));
const bodyGeo = (w: number, d: number, h: number) =>
  cached(`body${w}x${d}x${h}`, () => new RoundedBoxGeometry(w * P - 0.02, h - 0.01, d * P - 0.02, 2, 0.035));

type BrickProps = {
  w?: number;
  d?: number;
  h?: number; // in plates (3 = brick)
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  studs?: boolean;
  transparent?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  scale?: number;
};

// Brick origin sits at the bottom-center so stacking is plain y math.
export const Brick = ({ w = 2, d = 4, h = 3, color, position = [0, 0, 0], rotation = [0, 0, 0], studs = true, transparent, emissive, emissiveIntensity, scale = 1 }: BrickProps) => {
  const height = h * PH;
  const mat = plastic(color, { transparent, emissive, emissiveIntensity });
  const studList = useMemo(() => {
    const out: [number, number, number][] = [];
    if (!studs) return out;
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) out.push([(i - (w - 1) / 2) * P, height + 0.085, (j - (d - 1) / 2) * P]);
    return out;
  }, [w, d, height, studs]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={bodyGeo(w, d, height)} material={mat} position={[0, height / 2, 0]} castShadow receiveShadow />
      {studList.map((s, k) => (
        <mesh key={k} geometry={studGeo()} material={mat} position={s} castShadow />
      ))}
    </group>
  );
};

// Flat studded baseplate made of one slab + instanced studs.
export const Baseplate = ({ w, d, color, position = [0, 0, 0] as [number, number, number] }) => {
  const mat = plastic(color);
  const inst = useMemo(() => {
    const m = new THREE.InstancedMesh(studGeo(), mat, w * d);
    const o = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < w; i++)
      for (let j = 0; j < d; j++) {
        o.position.set((i - (w - 1) / 2) * P, PH + 0.085, (j - (d - 1) / 2) * P);
        o.updateMatrix();
        m.setMatrixAt(k++, o.matrix);
      }
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, [w, d, mat]);
  return (
    <group position={position}>
      <mesh geometry={bodyGeo(w, d, PH)} material={mat} position={[0, PH / 2, 0]} receiveShadow />
      <primitive object={inst} />
    </group>
  );
};

// Round 1x1 tile/cylinder for trees, lamps etc.
export const Round = ({ r = 0.4, h = BH, color, position = [0, 0, 0] as [number, number, number], emissive = undefined, emissiveIntensity = 0 }) => (
  <mesh position={[position[0], position[1] + h / 2, position[2]]} material={plastic(color, { emissive, emissiveIntensity })} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, h, 28]} />
  </mesh>
);

export const Cone = ({ r = 0.8, h = 1.6, color, position = [0, 0, 0] as [number, number, number] }) => (
  <mesh position={[position[0], position[1] + h / 2, position[2]]} material={plastic(color)} castShadow receiveShadow>
    <coneGeometry args={[r, h, 28]} />
  </mesh>
);

export const Tree = ({ position = [0, 0, 0] as [number, number, number], s = 1, color = C.green }) => (
  <group position={position} scale={s}>
    <Round r={0.22} h={0.9} color={C.brown} />
    <Cone r={0.85} h={1.3} color={color} position={[0, 0.7, 0]} />
    <Cone r={0.62} h={1.0} color={color} position={[0, 1.45, 0]} />
  </group>
);
