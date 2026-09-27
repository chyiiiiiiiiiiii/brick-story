// Big-head brick figure of the hero: voxel sculpture -> hollow shell -> 1xN plates.
import { BrickSpec } from "./bricks";

export type HeroLook = {
  hair: string;
  skin: string;
  top: string;
  pants: string;
  shoes?: string;
  glasses?: boolean;
  frame?: string;
};

const EYE = "#1b1b1b";
const MOUTH = "#8a3b2e";
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
};

type V = Map<string, string>;
const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

const box = (v: V, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) => {
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) v.set(key(x, y, z), c);
};

const sculpt = (h: HeroLook) => {
  const SKIN = h.skin, HAIR = h.hair, SWEATER = h.top, COLLAR = shade(h.top, 0.9), PANTS = h.pants;
  const SHOE = h.shoes ?? "#f4f4f4", FRAME = h.frame ?? "#7d838b";
  const v: V = new Map();
  // shoes, legs, body, arms, hands
  box(v, 0, 2, 0, 1, 0, 4, SHOE);
  box(v, 3, 5, 0, 1, 0, 4, SHOE);
  box(v, 0, 5, 2, 6, 0, 3, PANTS);
  box(v, 0, 5, 7, 15, 0, 3, SWEATER);
  box(v, 1, 4, 15, 15, 0, 3, COLLAR);
  v.set(key(2, 14, 3), COLLAR);
  v.set(key(3, 14, 3), COLLAR);
  box(v, -1, -1, 8, 15, 1, 2, SWEATER);
  box(v, 6, 6, 8, 15, 1, 2, SWEATER);
  box(v, -1, -1, 6, 7, 1, 2, SKIN);
  box(v, 6, 6, 6, 7, 1, 2, SKIN);
  // head
  box(v, -1, 6, 16, 33, -1, 5, SKIN);
  box(v, -2, -2, 22, 24, 1, 2, SKIN); // ears
  box(v, 7, 7, 22, 24, 1, 2, SKIN);
  // hair: cap, sides, back, fringe
  box(v, -1, 6, 31, 33, -1, 5, HAIR);
  box(v, 0, 5, 34, 35, 0, 4, HAIR);
  for (let y = 25; y <= 30; y++) for (let z = -1; z <= 5; z++) {
    v.set(key(-1, y, z), HAIR);
    v.set(key(6, y, z), HAIR);
  }
  box(v, -1, 6, 20, 30, -1, -1, HAIR);
  box(v, -1, 6, 28, 30, 5, 5, HAIR);
  for (const x of [-1, 0, 2, 3, 5, 6]) v.set(key(x, 27, 5), HAIR);
  box(v, -1, 6, 29, 32, 6, 6, HAIR); // bangs overhang
  // face
  for (const x of [1, 4]) for (const y of [23, 24]) v.set(key(x, y, 5), EYE);
  v.set(key(2, 19, 5), MOUTH);
  v.set(key(3, 19, 5), MOUTH);
  v.set(key(1, 20, 5), MOUTH);
  v.set(key(4, 20, 5), MOUTH);
  // glasses stand proud of the face
  for (const xc of h.glasses ? [1, 4] : []) {
    for (let x = xc - 1; x <= xc + 1; x++) {
      v.set(key(x, 22, 6), FRAME);
      v.set(key(x, 26, 6), FRAME);
    }
    for (let y = 23; y <= 25; y++) {
      v.set(key(xc - 1, y, 6), FRAME);
      v.set(key(xc + 1, y, 6), FRAME);
    }
  }
  return v;
};

// Hollow shell merged into x-runs of plates (length <= 4, staggered per layer).
export const bigheadBricks = (h: HeroLook): Omit<BrickSpec, "t">[] => {
  const v = sculpt(h);
  const has = (x: number, y: number, z: number) => v.has(key(x, y, z));
  const shell = new Map<string, string>();
  for (const [k, c] of v) {
    const [x, y, z] = k.split(",").map(Number);
    const exposed = !has(x + 1, y, z) || !has(x - 1, y, z) || !has(x, y + 1, z) || !has(x, y - 1, z) || !has(x, y, z + 1) || !has(x, y, z - 1);
    if (exposed) shell.set(k, c);
  }
  const out: Omit<BrickSpec, "t">[] = [];
  const rows = new Map<string, number[]>(); // (y,z,color) -> xs
  for (const [k, c] of shell) {
    const [x, y, z] = k.split(",").map(Number);
    const rk = `${y}|${z}|${c}`;
    if (!rows.has(rk)) rows.set(rk, []);
    rows.get(rk)!.push(x);
  }
  for (const [rk, xs] of rows) {
    const [y, z, c] = [Number(rk.split("|")[0]), Number(rk.split("|")[1]), rk.split("|")[2]];
    xs.sort((a, b) => a - b);
    let i = 0;
    while (i < xs.length) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      let x = xs[i];
      let left = j - i + 1;
      let first = (y + z) % 2 === 0;
      while (left > 0) {
        let n = Math.min(4, left);
        if (first && left > 2 && n === 4) n = 2;
        if (left - n === 1 && n > 2) n -= 1;
        let studs = false;
        for (let q = x; q < x + n; q++) if (!has(q, y + 1, z)) studs = true;
        out.push({ gx: x, gy: y, gz: z, w: n, d: 1, h: 1, color: c, studs });
        x += n;
        left -= n;
        first = false;
      }
      i = j + 1;
    }
  }
  return out;
};
