import { AbsoluteFill, interpolate, spring } from "remotion";
import { useT } from "./time";
import { LANG, MOMENTS, STORY, TRAVEL, chapters, clamp01, easeOut } from "./story";
import { cues } from "./cues";
import { EndCard } from "./Mosaic";

const CJK = '"PingFang TC", "Noto Sans TC", "Heiti TC", sans-serif';
const LATIN = 'Futura, "Avenir Next", "Helvetica Neue", sans-serif';
const BODY = '"Avenir Next", "Helvetica Neue", sans-serif';
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MODE = STORY.subtitles;
const bilingual = MODE === "zh+en" && LANG === "zh";

// Tag pill (or an animated counter) + big title (+ small English title in bilingual mode).
const ChapterTag = () => {
  const f = useT();
  const last = chapters.length - 1;
  return (
    <>
      {chapters.map((c, i) => {
        const inAt = c.start + (i === 0 ? 96 : TRAVEL - 6);
        const outAt = i === last ? MOMENTS.endCard - 58 : c.id === STORY.climax && MOMENTS.climax !== null ? MOMENTS.climax - 24 : c.start + c.dur - 10;
        if (f < inAt || f > outAt + 12) return null;
        const sIn = spring({ frame: f - inAt, fps: 30, config: { damping: 14, mass: 0.7 } });
        const o = sIn * (1 - interpolate(f, [outAt, outAt + 12], [0, 1], clampOpts));
        let tag = c.tag;
        if (c.counter?.length) {
          const p = easeOut(clamp01((f - c.voice.start - 20) / (c.voice.dur - 30)));
          tag = c.counter.map((k) => k.fmt.replace("{n}", Math.round(p * k.to).toLocaleString("en-US"))).join(" · ");
        }
        const latinTitle = /^[\x00-\x7F]*$/.test(c.title);
        return (
          <div key={c.id} style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `translateY(${(1 - sIn) * -40}px) scale(${0.9 + 0.1 * sIn})` }}>
            {tag && <div style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: "#fff", background: "rgba(2,86,155,0.88)", padding: "10px 28px", borderRadius: 999, boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}>{tag}</div>}
            <div style={{ marginTop: 18, fontFamily: latinTitle ? LATIN : CJK, fontWeight: 600, fontSize: c.title.length > 14 ? 62 : 84, color: "#13263b", textShadow: "0 0 18px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.9)", letterSpacing: 2 }}>{c.title}</div>
            {bilingual && c.title_en && <div style={{ marginTop: 4, fontFamily: LATIN, fontWeight: 500, fontSize: 38, color: "#2b4a6b", textShadow: "0 0 14px rgba(255,255,255,0.95)" }}>{c.title_en}</div>}
          </div>
        );
      })}
    </>
  );
};

const Subtitles = () => {
  const f = useT();
  if (MODE === "none") return null;
  const cue = cues.find((q) => !q.speaker && f >= q.from && f < q.to);
  if (!cue) return null;
  const a = interpolate(f, [cue.from, cue.from + 5], [0, 1], clampOpts);
  const onlyLatin = LANG === "en" || MODE === "en";
  const line = onlyLatin && LANG === "zh" ? cue.en : cue.main;
  return (
    <div style={{ position: "absolute", bottom: 370, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ textAlign: "center", background: "rgba(10,20,35,0.58)", padding: "14px 30px 16px", borderRadius: 22, maxWidth: 980 }}>
        {onlyLatin ? (
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: "#fff" }}>{line}</div>
        ) : (
          <>
            <div style={{ fontFamily: CJK, fontWeight: 600, fontSize: 48, lineHeight: 1.3, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{cue.main}</div>
            {bilingual && cue.en && <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: "#dfe8f2", marginTop: 4 }}>{cue.en}</div>}
          </>
        )}
      </div>
    </div>
  );
};

// Badge that springs in at the climax (e.g. an award or title).
const Badge = () => {
  const f = useT();
  const c = chapters.find((x) => x.id === STORY.climax);
  if (!c?.badge || MOMENTS.climax === null || f < MOMENTS.climax || f > c.start + c.dur) return null;
  const s = spring({ frame: f - MOMENTS.climax, fps: 30, config: { damping: 11 } });
  const out = interpolate(f, [c.start + c.dur - 12, c.start + c.dur], [1, 0], clampOpts);
  return (
    <div style={{ position: "absolute", top: 260, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: out, transform: `scale(${0.6 + 0.4 * s})` }}>
      <div style={{ textAlign: "center", background: "linear-gradient(135deg, #02569B, #0a3d6b)", borderRadius: 28, padding: "18px 40px", boxShadow: "0 0 40px rgba(255,190,60,0.75), 0 10px 30px rgba(0,0,0,0.25)", border: "3px solid #ffd36b" }}>
        <div style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 44, color: "#fff", letterSpacing: 4 }}>{c.badge.title}</div>
        {c.badge.sub && <div style={{ fontFamily: LATIN, fontWeight: 500, fontSize: 36, color: "#ffd36b", marginTop: 4 }}>{c.badge.sub}</div>}
      </div>
    </div>
  );
};

// The sidekick's line, typed into a speech bubble.
const AsideBubble = () => {
  const f = useT();
  const c = chapters.find((x) => x.aside && f >= x.aside.start - 4 && f <= x.aside.start + x.aside.dur + 20);
  if (!c?.aside) return null;
  const x = c.aside;
  const s = spring({ frame: f - x.start + 4, fps: 30, config: { damping: 12 } });
  const out = interpolate(f, [x.start + x.dur + 8, x.start + x.dur + 20], [1, 0], clampOpts);
  const shown = Math.min(x.show.length, Math.floor(((f - x.start) / x.dur) * x.show.length * 1.3) + 1);
  return (
    <div style={{ position: "absolute", top: 520, right: 70, opacity: out, transform: `scale(${s})`, transformOrigin: "80% 100%" }}>
      <div style={{ fontFamily: LANG === "en" ? BODY : CJK, fontWeight: 600, fontSize: 48, color: "#1b1b1b", background: "#fff", padding: "22px 34px", borderRadius: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.18)", border: "4px solid #fe8a18" }}>
        {STORY.sidekick?.name && <span style={{ fontFamily: LATIN, fontSize: 30, color: "#fe8a18", display: "block", letterSpacing: 3 }}>{STORY.sidekick.name.toUpperCase()}</span>}
        {x.show.slice(0, Math.max(0, shown))}
        {bilingual && x.show_en && <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: 30, color: "#5a6675", display: "block", marginTop: 6, opacity: interpolate(f, [x.start + x.dur * 0.5, x.start + x.dur * 0.5 + 8], [0, 1], clampOpts) }}>{x.show_en}</span>}
      </div>
    </div>
  );
};

const Opening = () => {
  const f = useT();
  const o = interpolate(f, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  return o > 0 ? <AbsoluteFill style={{ background: "#0b1320", opacity: o }} /> : null;
};

export const Overlays = () => (
  <AbsoluteFill>
    <ChapterTag />
    <Badge />
    <AsideBubble />
    <Subtitles />
    <EndCard />
    <Opening />
  </AbsoluteFill>
);
