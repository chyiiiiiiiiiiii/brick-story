import { useCurrentFrame, useVideoConfig } from "remotion";

// All scene timing is authored in 30 fps frames; higher-fps renders sample it fractionally.
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * 30) / fps;
};
