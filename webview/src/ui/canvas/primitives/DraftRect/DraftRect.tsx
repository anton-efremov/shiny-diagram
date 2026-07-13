/**
 * Draft rectangle showing a pending box extent.
 *
 * Places the noninteractive rectangle at `rect` and applies `stacking` when
 * supplied.
 *
 * Options:
 * - `tone` — `accent` uses pending placement treatment; `positive` uses success
 *   treatment
 * - `positioning` — `absolute` positions within the containing surface; `fixed`
 *   positions against the viewport
 */

import type { CSSProperties, ReactElement } from "react";
import type { Rect } from "../../../../shared/geometry";
import styles from "./DraftRect.module.css";

type DraftRectProps = {
  readonly rect: Rect;
  readonly tone?: "accent" | "positive";
  readonly positioning?: "absolute" | "fixed";
  readonly stacking?: number;
};

export default function DraftRect({
  rect,
  tone = "accent",
  positioning = "absolute",
  stacking,
}: DraftRectProps): ReactElement {
  const style = {
    left: rect.x,
    top: rect.y,
    width: rect.w,
    height: rect.h,
    zIndex: stacking,
  } satisfies CSSProperties;

  return (
    <div className={`${styles.draftRect} ${styles[tone]} ${styles[positioning]}`} style={style} />
  );
}
