// Pure brick data + scheduling (no three.js) so node scripts can reuse it.
// gx/gz: stud cell of the min corner, gy: plate level of the bottom, h in plates.
export type BrickSpec = {
  gx: number; gy: number; gz: number;
  w: number; d: number; h: number;
  color: string;
  t: number; // absolute frame the brick starts moving
  studs?: boolean;
  glow?: number;
};

export const DROP = 9; // frames from start to landing

export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};


// ---------- builders ----------

// Split a horizontal run into bricks of length <= 4, staggering joints per row.
const splitRun = (len: number, row: number) => {
  const out: number[] = [];
  let left = len;
  let first = row % 2 === 0;
  while (left > 0) {
    let n = Math.min(4, left);
    if (first && left > 2 && n === 4) n = 2;
    if (left - n === 1 && n > 2) n -= 1;
    out.push(n);
    left -= n;
    first = false;
  }
  return out;
};

// Upright wall from a bitmap (rows top->bottom), 1 stud deep.
export const wallFromBitmap = (rows: string[], color: string | ((r: number, c: number) => string), gx0: number, gy0: number, gz: number) => {
  const out: Omit<BrickSpec, "t">[] = [];
  const H = rows.length;
  rows.forEach((line, r) => {
    const level = H - 1 - r;
    let c = 0;
    while (c < line.length) {
      if (line[c] !== "#") { c++; continue; }
      let e = c;
      while (e < line.length && line[e] === "#") e++;
      let x = c;
      for (const n of splitRun(e - c, level)) {
        out.push({ gx: gx0 + x, gy: gy0 + level * 3, gz, w: n, d: 1, h: 3, color: typeof color === "string" ? color : color(r, x) });
        x += n;
      }
      c = e;
    }
  });
  return out;
};

// Solid box of bricks (w x d studs, `layers` bricks tall), top layers can taper.
export const boxOf = (gx: number, gy: number, gz: number, w: number, d: number, layers: number, color: string | ((layer: number) => string), h = 3) => {
  const out: Omit<BrickSpec, "t">[] = [];
  for (let l = 0; l < layers; l++) {
    const col = typeof color === "string" ? color : color(l);
    // alternate orientation of 2xN bricks for a real bond
    if (l % 2 === 0) {
      for (let x = 0; x < w; x += 2) for (let z = 0; z < d; z += 4)
        out.push({ gx: gx + x, gy: gy + l * h, gz: gz + z, w: Math.min(2, w - x), d: Math.min(4, d - z), h, color: col });
    } else {
      for (let z = 0; z < d; z += 2) for (let x = 0; x < w; x += 4)
        out.push({ gx: gx + x, gy: gy + l * h, gz: gz + z, w: Math.min(4, w - x), d: Math.min(2, d - z), h, color: col });
    }
  }
  return out;
};

// Assign start frames: bottom-up, with jitter; spread across [start, start+span].
export const schedule = (bricks: Omit<BrickSpec, "t">[], start: number, span: number, order: "up" | "left" | "random" = "up") => {
  const keyed = bricks.map((b, i) => ({ b, k: order === "up" ? b.gy * 100 + hash(i) * 60 : order === "left" ? b.gx * 10 + b.gy * 0.5 + hash(i) : hash(i) }));
  keyed.sort((a, b) => a.k - b.k);
  const n = keyed.length;
  return keyed.map(({ b }, i) => ({ ...b, t: Math.round(start + (n <= 1 ? 0 : (i / (n - 1)) * span)) }));
};
