import { useMemo } from "react";
import * as THREE from "three";
import { C, plastic } from "./parts";

export type Face = "smile" | "grin" | "focus" | "wow" | "tired";

const texCache = new Map<string, THREE.Texture>();

const faceTexture = (face: Face, glasses: boolean, skin: string) => {
  const key = `${face}-${glasses}-${skin}`;
  if (texCache.has(key)) return texCache.get(key)!;
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 512;
  const g = cv.getContext("2d")!;
  g.fillStyle = skin;
  g.fillRect(0, 0, 1024, 512);
  const cx = 512;
  g.fillStyle = "#1b1b1b";
  g.strokeStyle = "#1b1b1b";
  g.lineCap = "round";
  // eyes
  const eyeY = 225;
  for (const dx of [-62, 62]) {
    if (face === "tired") {
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(cx + dx - 22, eyeY + 4);
      g.lineTo(cx + dx + 22, eyeY + 4);
      g.stroke();
    } else {
      g.beginPath();
      g.ellipse(cx + dx, eyeY, face === "wow" ? 22 : 18, face === "wow" ? 30 : 26, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(cx + dx + 6, eyeY - 9, 6, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#1b1b1b";
    }
  }
  // brows
  g.lineWidth = 9;
  for (const dx of [-62, 62]) {
    g.beginPath();
    const tilt = face === "focus" ? (dx < 0 ? 8 : -8) : 0;
    g.moveTo(cx + dx - 26, eyeY - 58 - tilt);
    g.lineTo(cx + dx + 26, eyeY - 58 + tilt);
    g.stroke();
  }
  if (glasses) {
    g.strokeStyle = "#6f6a64";
    g.lineWidth = 7;
    for (const dx of [-66, 66]) {
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.beginPath();
      g.roundRect(cx + dx - 50, eyeY - 40, 100, 80, 26);
      g.fill();
      g.stroke();
    }
    g.beginPath();
    g.moveTo(cx - 16, eyeY - 8);
    g.lineTo(cx + 16, eyeY - 8);
    g.stroke();
  }
  // mouth
  g.lineWidth = 11;
  g.beginPath();
  if (face === "grin") {
    g.fillStyle = "#1b1b1b";
    g.arc(cx, 300, 70, 0.05 * Math.PI, 0.95 * Math.PI);
    g.closePath();
    g.fill();
    g.fillStyle = "#ffffff";
    g.fillRect(cx - 50, 302, 100, 16);
  } else if (face === "wow") {
    g.ellipse(cx, 330, 22, 30, 0, 0, Math.PI * 2);
    g.fill();
  } else if (face === "focus") {
    g.moveTo(cx - 34, 330);
    g.quadraticCurveTo(cx, 340, cx + 34, 326);
    g.stroke();
  } else if (face === "tired") {
    g.moveTo(cx - 34, 340);
    g.quadraticCurveTo(cx, 322, cx + 34, 340);
    g.stroke();
  } else {
    g.arc(cx, 290, 58, 0.18 * Math.PI, 0.82 * Math.PI);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

const torsoTexture = (color: string, print: string) => {
  const key = `torso-${color}-${print}`;
  if (texCache.has(key)) return texCache.get(key)!;
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 512;
  const g = cv.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  if (print === "sweater") {
    // crew-neck sweatshirt with the little V stitch under the collar, like the photo
    g.strokeStyle = "rgba(120,100,70,0.45)";
    g.lineWidth = 10;
    g.beginPath();
    g.arc(256, -40, 120, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(232, 86);
    g.lineTo(256, 122);
    g.lineTo(280, 86);
    g.stroke();
    g.strokeStyle = "rgba(120,100,70,0.25)";
    for (let x = 20; x < 512; x += 22) {
      g.beginPath();
      g.moveTo(x, 470);
      g.lineTo(x, 512);
      g.stroke();
    }
  } else if (print === "tee") {
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.lineWidth = 12;
    g.beginPath();
    g.arc(256, -30, 110, 0.12 * Math.PI, 0.88 * Math.PI);
    g.stroke();
  } else if (print === "open") {
    g.fillStyle = "#8d9096";
    g.beginPath();
    g.moveTo(170, 0);
    g.lineTo(342, 0);
    g.lineTo(318, 512);
    g.lineTo(194, 512);
    g.closePath();
    g.fill();
    g.fillStyle = "#f4f4f4";
    g.font = "bold 44px Helvetica";
    g.textAlign = "center";
    g.fillText("Flutter", 256, 250);
    g.strokeStyle = "#f4f4f4";
    g.lineWidth = 6;
    for (const x of [178, 334]) {
      g.beginPath();
      g.moveTo(x, 30);
      g.lineTo(x + (x < 256 ? -4 : 4), 170);
      g.stroke();
    }
    g.strokeStyle = "rgba(255,255,255,0.25)";
    g.lineWidth = 4;
    for (const x of [166, 346]) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (x < 256 ? 26 : -26), 512);
      g.stroke();
    }
  } else if (print === "hoodie") {
    // zipper + drawstrings + flutter chevron badge
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(256, 60);
    g.lineTo(256, 512);
    g.stroke();
    g.strokeStyle = "#f4f4f4";
    g.lineWidth = 7;
    for (const x of [216, 296]) {
      g.beginPath();
      g.moveTo(x, 40);
      g.lineTo(x - (x < 256 ? 6 : -6), 180);
      g.stroke();
    }
    // Flutter-like chevrons badge (left chest)
    const bx = 350,
      by = 190;
    g.fillStyle = C.flutterLight;
    g.beginPath();
    g.moveTo(bx, by);
    g.lineTo(bx + 40, by - 40);
    g.lineTo(bx + 62, by - 40);
    g.lineTo(bx + 11, by + 11);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(bx + 22, by + 22);
    g.lineTo(bx + 40, by + 4);
    g.lineTo(bx + 62, by + 4);
    g.lineTo(bx + 33, by + 33);
    g.closePath();
    g.fill();
    g.fillStyle = C.flutter;
    g.beginPath();
    g.moveTo(bx + 22, by + 22);
    g.lineTo(bx + 33, by + 33);
    g.lineTo(bx + 62, by + 62);
    g.lineTo(bx + 40, by + 62);
    g.closePath();
    g.fill();
  } else if (print === "shirt") {
    g.fillStyle = "#f4f4f4";
    g.beginPath();
    g.moveTo(190, 0);
    g.lineTo(256, 120);
    g.lineTo(322, 0);
    g.fill();
    g.fillStyle = "#c91a09";
    g.beginPath();
    g.moveTo(246, 60);
    g.lineTo(266, 60);
    g.lineTo(276, 300);
    g.lineTo(256, 330);
    g.lineTo(236, 300);
    g.closePath();
    g.fill();
  } else if (print === "robot") {
    g.fillStyle = "#1b1b1b";
    g.fillRect(150, 120, 212, 150);
    g.fillStyle = "#6cf0ff";
    for (let i = 0; i < 4; i++) g.fillRect(172 + i * 46, 160 + (i % 2) * 30, 30, 30);
    g.fillStyle = "#fe8a18";
    g.beginPath();
    g.arc(256, 350, 34, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
};

const torsoGeo = (() => {
  let g: THREE.BufferGeometry | null = null;
  return () => {
    if (g) return g;
    const b = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    const p = b.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const s = y > 0 ? 1.18 : 1.56;
      p.setX(i, p.getX(i) * s);
      p.setY(i, y * 1.22);
      p.setZ(i, p.getZ(i) * 0.78);
    }
    b.computeVertexNormals();
    g = b;
    return g;
  };
})();

export type MinifigProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  torso?: string;
  legs?: string;
  hair?: string | null;
  hairStyle?: "short" | "spiky" | "cap" | "long" | "helmet";
  skin?: string;
  face?: Face;
  glasses?: boolean;
  print?: "hoodie" | "open" | "shirt" | "robot" | "plain" | "sweater" | "tee";
  walk?: number | null; // phase in radians; null = standing
  armL?: number; // raise angle (rad), positive = forward/up
  armR?: number;
  armSpreadL?: number;
  armSpreadR?: number;
  headYaw?: number;
  headPitch?: number;
  bob?: number;
  hold?: "laptop" | "flag" | "mic" | "trophy" | "cup" | null;
  antenna?: boolean;
};

export const Minifig = ({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  torso = C.navy,
  legs = C.dark,
  hair = C.black,
  hairStyle = "short",
  skin = C.skin,
  face = "smile",
  glasses = false,
  print = "hoodie",
  walk = null,
  armL = 0,
  armR = 0,
  armSpreadL = 0.12,
  armSpreadR = 0.12,
  headYaw = 0,
  headPitch = 0,
  bob = 0,
  hold = null,
  antenna = false,
}: MinifigProps) => {
  const skinM = plastic(skin);
  const torsoM = plastic(torso);
  const legM = plastic(legs);
  const faceTex = useMemo(() => faceTexture(face, glasses, skin), [face, glasses, skin]);
  const torsoTex = useMemo(() => torsoTexture(torso, print), [torso, print]);
  const headMats = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ map: faceTex, roughness: 0.32, clearcoat: 0.55, clearcoatRoughness: 0.2 });
    return [side, skinM, skinM];
  }, [faceTex, skinM]);
  const torsoMats = useMemo(() => {
    const front = new THREE.MeshPhysicalMaterial({ map: torsoTex, roughness: 0.34, clearcoat: 0.5 });
    return [torsoM, torsoM, torsoM, torsoM, front, torsoM];
  }, [torsoTex, torsoM]);

  const swing = walk === null ? 0 : Math.sin(walk) * 0.55;
  const lift = walk === null ? 0 : Math.abs(Math.cos(walk)) * 0.06;
  const legY = 1.28; // hip pivot height

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, lift + bob, 0]}>
        {/* legs */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.39, legY, 0]} rotation={[s * swing, 0, 0]}>
            <mesh material={legM} position={[0, -0.6, 0]} castShadow>
              <boxGeometry args={[0.74, 1.12, 0.8]} />
            </mesh>
            <mesh material={legM} position={[0, -1.14, 0.08]} castShadow>
              <boxGeometry args={[0.74, 0.28, 0.98]} />
            </mesh>
          </group>
        ))}
        {/* hip */}
        <mesh material={legM} position={[0, legY + 0.14, 0]} castShadow>
          <boxGeometry args={[1.56, 0.3, 0.8]} />
        </mesh>
        {/* torso */}
        <mesh geometry={torsoGeo()} material={torsoMats} position={[0, legY + 0.29 + 0.61, 0]} castShadow />
        {/* arms */}
        {[-1, 1].map((s) => {
          const raise = (s < 0 ? armL : armR) + (walk === null ? 0 : -s * swing * 0.8);
          const spread = s < 0 ? armSpreadL : armSpreadR;
          return (
            <group key={s} position={[s * 0.74, legY + 1.36, 0]} rotation={[-raise, 0, s * spread]}>
              <mesh material={torsoM} position={[s * 0.12, -0.42, 0]} rotation={[0, 0, s * 0.12]} castShadow>
                <cylinderGeometry args={[0.18, 0.22, 0.95, 16]} />
              </mesh>
              <mesh material={skinM} position={[s * 0.2, -0.98, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.14, 0.07, 10, 20, Math.PI * 1.6]} />
              </mesh>
              {s > 0 && hold === "mic" && (
                <group position={[0.2, -1.0, 0.1]}>
                  <mesh material={plastic(C.black)} rotation={[0.3, 0, 0]} position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.06, 0.05, 0.5, 12]} />
                  </mesh>
                  <mesh material={plastic(C.darkgray)} position={[0, 0.5, 0.1]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                  </mesh>
                </group>
              )}
              {s > 0 && hold === "flag" && (
                <group position={[0.2, -1.0, 0.1]}>
                  <mesh material={plastic(C.gray)} position={[0, 0.8, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 2.2, 10]} />
                  </mesh>
                  <mesh material={plastic(C.flutterLight)} position={[0.5, 1.6, 0]}>
                    <boxGeometry args={[0.9, 0.6, 0.04]} />
                  </mesh>
                </group>
              )}
              {s > 0 && hold === "cup" && (
                <group position={[0.2, -0.98, 0.18]}>
                  <mesh material={plastic(C.white)} position={[0, 0.22, 0]} castShadow>
                    <cylinderGeometry args={[0.2, 0.16, 0.36, 18]} />
                  </mesh>
                  <mesh material={plastic("#6b4226")} position={[0, 0.39, 0]}>
                    <cylinderGeometry args={[0.17, 0.17, 0.02, 18]} />
                  </mesh>
                </group>
              )}
              {s > 0 && hold === "trophy" && (
                <group position={[0.2, -0.95, 0.15]}>
                  <mesh material={plastic("#e8b923", { emissive: "#6b4b00", emissiveIntensity: 0.4 })} position={[0, 0.35, 0]}>
                    <cylinderGeometry args={[0.28, 0.12, 0.45, 20]} />
                  </mesh>
                  <mesh material={plastic("#e8b923")} position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.16, 0.2, 0.15, 16]} />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}
        {hold === "laptop" && (
          <group position={[0, legY + 0.75, 0.75]} rotation={[0.1, 0, 0]}>
            <mesh material={plastic(C.gray)} position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.3, 0.06, 0.9]} />
            </mesh>
            <group position={[0, 0.03, 0.45]} rotation={[-1.85, 0, 0]}>
              <mesh material={plastic(C.gray)} position={[0, 0, -0.45]} castShadow>
                <boxGeometry args={[1.3, 0.05, 0.9]} />
              </mesh>
              <mesh material={plastic("#1b2a3a", { emissive: "#54c5f8", emissiveIntensity: 0.6 })} position={[0, -0.03, -0.45]}>
                <boxGeometry args={[1.18, 0.02, 0.78]} />
              </mesh>
            </group>
          </group>
        )}
        {/* neck + head */}
        <group position={[0, legY + 1.52, 0]} rotation={[headPitch, headYaw, 0]}>
          <mesh material={skinM} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
          </mesh>
          <mesh material={headMats} position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.47, 0.47, 0.84, 40, 1, false, Math.PI, Math.PI * 2]} />
          </mesh>
          {/* rounded head caps */}
          <mesh material={skinM} position={[0, 1.0, 0]} scale={[1, 0.18, 1]}>
            <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={skinM} position={[0, 0.16, 0]} scale={[1, 0.18, 1]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {!hair && (
            <mesh material={skinM} position={[0, 1.13, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.2, 20]} />
            </mesh>
          )}
          {hair && hairStyle !== "cap" && hairStyle !== "helmet" && (
            <group>
              {/* dome: wraps past the equator so the bangs sit just above the brows */}
              <mesh material={plastic(hair)} position={[0, 0.9, 0]} scale={[1, hairStyle === "spiky" ? 0.95 : 0.82, 1.02]} castShadow>
                <sphereGeometry args={[0.565, 40, 20, 0, Math.PI * 2, 0, 1.78]} />
              </mesh>
              {/* back and sides hang lower */}
              <mesh material={plastic(hair)} position={[0, hairStyle === "long" ? 0.52 : 0.64, 0]} castShadow>
                <cylinderGeometry args={[0.555, 0.54, hairStyle === "long" ? 0.8 : 0.38, 40, 1, false, Math.PI * 0.68, Math.PI * 0.64]} />
              </mesh>
              {hairStyle === "spiky" &&
                [-0.3, -0.1, 0.1, 0.3].map((x, i) => (
                  <mesh key={i} material={plastic(hair)} position={[x, 1.42, 0.05 - i * 0.06]} rotation={[0.2, 0, x * 0.8]} castShadow>
                    <coneGeometry args={[0.14, 0.34, 8]} />
                  </mesh>
                ))}
            </group>
          )}
          {hairStyle === "cap" && (
            <group>
              <mesh material={plastic(hair ?? C.red)} position={[0, 0.9, 0]} scale={[1.08, 0.8, 1.08]} castShadow>
                <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh material={plastic(hair ?? C.red)} position={[0, 0.92, 0.46]} castShadow>
                <boxGeometry args={[0.8, 0.06, 0.5]} />
              </mesh>
            </group>
          )}
          {hairStyle === "helmet" && (
            <mesh material={plastic(hair ?? C.white)} position={[0, 0.72, 0]} castShadow>
              <sphereGeometry args={[0.6, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            </mesh>
          )}
          {antenna && (
            <group position={[0, 1.2, 0]}>
              <mesh material={plastic(C.gray)} position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
              </mesh>
              <mesh material={plastic(C.orange, { emissive: C.orange, emissiveIntensity: 1.5 })} position={[0, 0.52, 0]}>
                <sphereGeometry args={[0.09, 16, 16]} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};
