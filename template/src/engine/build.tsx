import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, PH } from "./parts";
import { BrickSpec, DROP, hash } from "./bricks";
export * from "./bricks";

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

const bodyGeoCache = new Map<string, THREE.BufferGeometry>();
const bodyGeo = (w: number, d: number, h: number) => {
  const k = `${w}x${d}x${h}`;
  if (!bodyGeoCache.has(k)) bodyGeoCache.set(k, new RoundedBoxGeometry(w * P - 0.02, h * PH - 0.01, d * P - 0.02, 2, 0.035));
  return bodyGeoCache.get(k)!;
};
let studG: THREE.BufferGeometry | null = null;
const studGeo = () => (studG ??= new THREE.CylinderGeometry(0.24, 0.24, 0.17, 20));

const white = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.32, clearcoat: 0.55, clearcoatRoughness: 0.22 });
const glowMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.3, clearcoat: 0.5, emissive: "#ffffff", emissiveIntensity: 0.9 });

// Where a brick is at a given frame: null = not yet visible.
export const brickPose = (b: BrickSpec, frame: number, i: number) => {
  const p = (frame - b.t) / DROP;
  if (p < 0) return null;
  const cx = (b.gx + b.w / 2) * P;
  const cy = b.gy * PH + (b.h * PH) / 2;
  const cz = (b.gz + b.d / 2) * P;
  if (p >= 1.6) return { x: cx, y: cy, z: cz, rx: 0, rz: 0, s: 1 };
  const q = Math.min(1, p);
  const e = easeOut(q);
  const fall = (1 - e) * (3.2 + hash(i) * 2.4);
  const side = (1 - e) * (hash(i + 7) - 0.5) * 1.6;
  // tiny settle bounce after landing
  const settle = p > 1 ? Math.sin((p - 1) * Math.PI * 1.66) * 0.05 * (1.6 - p) : 0;
  return {
    x: cx + side,
    y: cy + fall + settle,
    z: cz + side * 0.5,
    rx: (1 - e) * (hash(i + 3) - 0.5) * 1.2,
    rz: (1 - e) * (hash(i + 5) - 0.5) * 1.2,
    s: 0.75 + 0.25 * Math.min(1, q * 2),
  };
};

export const BuildModel = ({ bricks, frame }: { bricks: BrickSpec[]; frame: number }) => {
  // group bricks by body geometry
  const groups = useMemo(() => {
    const m = new Map<string, number[]>();
    bricks.forEach((b, i) => {
      const k = `${b.w}x${b.d}x${b.h}${b.glow ? "g" : ""}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(i);
    });
    return [...m.entries()].map(([k, idx]) => {
      const b = bricks[idx[0]];
      const mesh = new THREE.InstancedMesh(bodyGeo(b.w, b.d, b.h), b.glow ? glowMat : white, idx.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      idx.forEach((bi, j) => mesh.setColorAt(j, new THREE.Color(bricks[bi].color)));
      return { key: k, idx, mesh };
    });
  }, [bricks]);

  const studs = useMemo(() => {
    const list: { bi: number; ox: number; oz: number }[] = [];
    bricks.forEach((b, bi) => {
      if (b.studs === false) return;
      for (let i = 0; i < b.w; i++) for (let j = 0; j < b.d; j++) list.push({ bi, ox: (i - (b.w - 1) / 2) * P, oz: (j - (b.d - 1) / 2) * P });
    });
    const mesh = new THREE.InstancedMesh(studGeo(), white, Math.max(1, list.length));
    mesh.castShadow = true;
    mesh.frustumCulled = false;
    list.forEach((s, j) => mesh.setColorAt(j, new THREE.Color(bricks[s.bi].color)));
    return { list, mesh };
  }, [bricks]);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    const poses = bricks.map((b, i) => brickPose(b, frame, i));
    for (const g of groups) {
      g.idx.forEach((bi, j) => {
        const ps = poses[bi];
        if (!ps) return g.mesh.setMatrixAt(j, hidden);
        o.position.set(ps.x, ps.y, ps.z);
        o.rotation.set(ps.rx, 0, ps.rz);
        o.scale.setScalar(ps.s);
        o.updateMatrix();
        g.mesh.setMatrixAt(j, o.matrix);
      });
      g.mesh.instanceMatrix.needsUpdate = true;
    }
    const top = new THREE.Vector3();
    studs.list.forEach((s, j) => {
      const ps = poses[s.bi];
      if (!ps) return studs.mesh.setMatrixAt(j, hidden);
      const b = bricks[s.bi];
      o.position.set(ps.x, ps.y, ps.z);
      o.rotation.set(ps.rx, 0, ps.rz);
      o.scale.setScalar(ps.s);
      o.updateMatrix();
      top.set(s.ox, (b.h * PH) / 2 + 0.085, s.oz).applyMatrix4(o.matrix);
      const m = new THREE.Matrix4().compose(top, o.quaternion, new THREE.Vector3(ps.s, ps.s, ps.s));
      studs.mesh.setMatrixAt(j, m);
    });
    studs.mesh.instanceMatrix.needsUpdate = true;
  }, [frame, bricks, groups, studs]);

  return (
    <group>
      {groups.map((g) => (
        <primitive key={g.key} object={g.mesh} />
      ))}
      <primitive object={studs.mesh} />
    </group>
  );
};

