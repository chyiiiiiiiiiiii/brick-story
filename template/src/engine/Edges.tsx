import { forwardRef, useMemo } from "react";
import { Effect, EffectAttribute } from "postprocessing";
import { Color, Uniform, Vector2 } from "three";

// Instruction-manual style seams: depth Laplacian relative to depth marks silhouettes and brick joints.
const frag = /* glsl */ `
uniform vec2 texel;
uniform float strength;
uniform vec3 edgeColor;
float vz(vec2 uv) { return -getViewZ(readDepth(uv)); }
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  float c = -getViewZ(depth);
  float l = vz(uv - vec2(texel.x, 0.0));
  float r = vz(uv + vec2(texel.x, 0.0));
  float u = vz(uv + vec2(0.0, texel.y));
  float d = vz(uv - vec2(0.0, texel.y));
  float lap = abs(l + r + u + d - 4.0 * c) / max(c, 1e-3);
  float e = smoothstep(0.004, 0.022, lap);
  e *= 1.0 - smoothstep(70.0, 160.0, c);
  outputColor = vec4(mix(inputColor.rgb, edgeColor, e * strength), inputColor.a);
}`;

class EdgeEffect extends Effect {
  constructor(strength: number, color: string) {
    super("EdgeEffect", frag, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ["texel", new Uniform(new Vector2(1 / 1080, 1 / 1920))],
        ["strength", new Uniform(strength)],
        ["edgeColor", new Uniform(new Color(color))],
      ]),
    });
  }
  setSize(width: number, height: number) {
    (this.uniforms.get("texel")!.value as Vector2).set(1 / width, 1 / height);
  }
}

export const Edges = forwardRef<EdgeEffect, { strength?: number; color?: string }>(({ strength = 0.55, color = "#20242b" }, ref) => {
  const effect = useMemo(() => new EdgeEffect(strength, color), [strength, color]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});
