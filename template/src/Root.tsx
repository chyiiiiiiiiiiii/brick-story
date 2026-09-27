import { AbsoluteFill, Composition } from "remotion";
import { World } from "./engine/World";
import { Overlays } from "./engine/Overlays";
import { TOTAL } from "./engine/story";

const Video = () => (
  <AbsoluteFill style={{ background: "#e8f5fc" }}>
    <World />
    <Overlays />
  </AbsoluteFill>
);

const Clean = () => (
  <AbsoluteFill style={{ background: "#e8f5fc" }}>
    <World />
  </AbsoluteFill>
);

// Scene timing is authored at 30 fps. Video30 is for previews; Video120 is rendered then blended pairwise to 60 fps
// (motion blur). Clean2x renders 2160x3840 stills of the world without any text, for covers.
export const Root = () => (
  <>
    <Composition id="Video30" component={Video} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Video120" component={Video} durationInFrames={TOTAL * 4} fps={120} width={1080} height={1920} />
    <Composition id="Clean2x" component={Clean} durationInFrames={TOTAL} fps={30} width={2160} height={3840} />
  </>
);
