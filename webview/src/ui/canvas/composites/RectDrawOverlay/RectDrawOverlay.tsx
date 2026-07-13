/**
 * @behavior Full-surface pointer capture for rectangle drawing.
 */

import type { CSSProperties, PointerEvent, ReactElement } from "react";
import type { Rect } from "../../../../shared/geometry";
import DraftRect from "../../primitives/DraftRect/DraftRect";
import styles from "./RectDrawOverlay.module.css";

type RectDrawOverlayProps = {
  readonly rect: Rect | null;
  readonly stacking: number;
  readonly onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export default function RectDrawOverlay({
  rect,
  stacking,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: RectDrawOverlayProps): ReactElement {
  const style = { zIndex: stacking } satisfies CSSProperties;
  return (
    <div
      className={styles.overlay}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {rect ? <DraftRect rect={rect} /> : null}
    </div>
  );
}
