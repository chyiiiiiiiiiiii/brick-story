import { Minifig } from "./Minifig";
import { FigureDef, MOMENTS, STORY, TOP } from "./story";

const bounceOut = (x: number) => {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

// The story hero's minifig look (for figures you render yourself in a View).
export const heroLook = () => ({
  torso: STORY.hero.top,
  legs: STORY.hero.pants,
  hair: STORY.hero.hair,
  glasses: !!STORY.hero.glasses,
  print: ((STORY.hero as { print?: string }).print ?? "sweater") as "sweater",
  hairStyle: ((STORY.hero as { hairStyle?: string }).hairStyle ?? "short") as "short",
});

// Drops in from above with a bounce at `drop`; hero figures wave during the final pull-back.
export const FigureView = ({ d, f }: { d: FigureDef; f: number }) => {
  const p = (f - d.drop) / 14;
  if (p < 0) return null;
  const dy = p >= 1 ? 0 : (1 - bounceOut(p)) * 7;
  const isHero = !d.look || d.look === "hero";
  const look = isHero ? { ...heroLook(), ...(d.outfit ?? {}) } : { ...(d.look as object), ...(d.outfit ?? {}) };
  const pose = d.pose?.(f) ?? {};
  const endWave = isHero && f > MOMENTS.pullBack + 30 ? { armR: 2.5 + Math.sin(f * 0.4) * 0.35 } : {};
  return (
    <Minifig position={[(d.move?.(f) ?? d.at)[0], TOP + (d.y ?? 0) + dy, (d.move?.(f) ?? d.at)[1]]} rotationY={d.turn?.(f) ?? d.rotY ?? 0} scale={d.scale ?? 1} {...look} {...pose} {...endWave} />
  );
};
