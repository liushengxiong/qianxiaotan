import type { CSSProperties } from "react";

// Reuse the supplied IP sheet exactly; CSS viewports expose its existing poses.
// No generative redraw, image editing, or fabricated lip-sync frames are involved.
const CROPS = {
  hero: { x: 5, y: 24, w: 446, h: 710 },
  face: { x: 20, y: 765, w: 126, h: 137 },
  thinking: { x: 271, y: 765, w: 119, h: 137 },
  happy: { x: 516, y: 765, w: 121, h: 138 },
  point: { x: 639, y: 396, w: 162, h: 281 },
  observe: { x: 810, y: 467, w: 180, h: 208 },
  note: { x: 1001, y: 403, w: 210, h: 274 },
};
export type XiaozhiPose = keyof typeof CROPS;

export function XiaozhiArt({ pose = "face", className = "", label = "" }: { pose?: XiaozhiPose; className?: string; label?: string }) {
  const crop = CROPS[pose];
  const style: CSSProperties = { aspectRatio: `${crop.w}/${crop.h}` };
  return <span className={`xiaozhi-art xiaozhi-${pose} ${className}`} style={style} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
    <img src="/characters/xiaozhi-reference.png" alt="" draggable={false} width={1230} height={1278} style={{ width: `${1230 / crop.w * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%` }} />
  </span>;
}
