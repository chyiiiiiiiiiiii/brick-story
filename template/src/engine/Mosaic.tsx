import { AbsoluteFill, Img, interpolate, spring, staticFile } from "remotion";
import mosaic from "../data/mosaic.json";
import { hash } from "./bricks";
import { MOMENTS, STORY } from "./story";
import { useT } from "./time";

const LATIN = 'Futura, "Avenir Next", "Helvetica Neue", sans-serif';
const SIZE = 640;
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A 1x1-round-plate mosaic of the photo at resolution n; `grow` pops studs in (0..1 per stud).
const Studs = ({ n, opacity, grow }: { n: number; opacity: number; grow?: (i: number) => number }) => {
  if (opacity <= 0) return null;
  const colors = (mosaic as Record<string, string[]>)[String(n)];
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={SIZE} height={SIZE} style={{ position: "absolute", inset: 0, opacity }}>
      <rect width={n} height={n} fill="#1b1f24" />
      {colors.map((c, i) => {
        const s = grow ? grow(i) : 1;
        if (s <= 0) return null;
        const x = (i % n) + 0.5;
        const y = Math.floor(i / n) + 0.5;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={0.46} fill={c} />
            {n <= 24 && <circle r={0.3} cx={-0.07} cy={-0.09} fill="#fff" opacity={0.2} />}
          </g>
        );
      })}
    </svg>
  );
};

// End card with a photo: brick mosaic pops in, sharpens 14 -> 24 -> 40 -> 64 studs, resolves into the photo on the final chord.
const MosaicReveal = () => {
  const f = useT();
  const t0 = MOMENTS.endCard;
  if (f < t0 - 44) return null;
  const card = spring({ frame: f - (t0 - 44), fps: 30, config: { damping: 15 } });
  const veil = interpolate(f, [t0 - 44, t0 - 20], [0, 0.55], clampOpts);
  const fade = (a: number, b: number) => interpolate(f, [a, b], [0, 1], clampOpts);
  const o24 = fade(t0 - 24, t0 - 20);
  const o40 = fade(t0 - 16, t0 - 12);
  const o64 = fade(t0 - 9, t0 - 5);
  const oPhoto = fade(t0 - 4, t0 + 6);
  const grow = (i: number) => {
    const start = t0 - 42 + hash(i + 900) * 14;
    const p = (f - start) / 5;
    return p <= 0 ? 0 : p >= 1 ? 1 : 1 + Math.sin(p * Math.PI) * 0.3 * (1 - p) - Math.pow(1 - p, 3);
  };
  const name = spring({ frame: f - (t0 + 2), fps: 30, config: { damping: 15 } });
  const handle = spring({ frame: f - (t0 + 12), fps: 30, config: { damping: 15 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${veil}) 0%, rgba(255,255,255,${veil * 0.7}) 55%, rgba(255,255,255,${veil * 0.3}) 100%)` }} />
      <div style={{ position: "absolute", top: 450, left: (1080 - SIZE) / 2, width: SIZE, height: SIZE, borderRadius: 48, overflow: "hidden", transform: `scale(${0.85 + 0.15 * card})`, opacity: card, boxShadow: "0 30px 80px rgba(19,38,59,0.35)" }}>
        <Studs n={14} opacity={1} grow={grow} />
        <Studs n={24} opacity={o24} />
        <Studs n={40} opacity={o40} />
        <Studs n={64} opacity={o64} />
        {oPhoto > 0 && <Img src={staticFile("ending.jpg")} style={{ position: "absolute", inset: 0, width: SIZE, height: SIZE, objectFit: "cover", opacity: oPhoto }} />}
      </div>
      <div style={{ position: "absolute", top: 1128, left: 0, right: 0, textAlign: "center", opacity: name, transform: `translateY(${(1 - name) * 30}px)` }}>
        <div style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 124, color: "#13263b", letterSpacing: 6, textShadow: "0 0 30px rgba(255,255,255,0.9)" }}>{STORY.ending?.name}</div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: handle, transform: `translateY(${(1 - handle) * 20}px)` }}>
        {STORY.ending?.handle && <div style={{ fontFamily: LATIN, fontSize: 42, color: "#fff", background: "#13263b", padding: "12px 36px", borderRadius: 999 }}>{STORY.ending.handle}</div>}
      </div>
    </AbsoluteFill>
  );
};

// End card without a photo: name + handle on a frosted card.
const NameCard = () => {
  const f = useT();
  const t0 = MOMENTS.endCard;
  if (f < t0 || !STORY.ending?.name) return null;
  const s = spring({ frame: f - t0, fps: 30, config: { damping: 16 } });
  const s2 = spring({ frame: f - t0 - 10, fps: 30, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 360 }}>
      <div style={{ textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 40}px)`, background: "rgba(255,255,255,0.86)", borderRadius: 40, padding: "34px 56px 30px", boxShadow: "0 20px 60px rgba(19,38,59,0.25)" }}>
        <div style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 120, color: "#13263b", letterSpacing: 6, lineHeight: 1.05 }}>{STORY.ending.name}</div>
        {STORY.ending.handle && <div style={{ marginTop: 22, opacity: s2, fontFamily: LATIN, fontSize: 40, color: "#fff", background: "#13263b", padding: "12px 34px", borderRadius: 999, display: "inline-block" }}>{STORY.ending.handle}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const EndCard = () => (STORY.ending?.photo ? <MosaicReveal /> : <NameCard />);
