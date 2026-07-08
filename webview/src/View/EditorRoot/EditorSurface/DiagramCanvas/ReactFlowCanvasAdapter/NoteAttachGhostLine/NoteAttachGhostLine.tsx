/**
 * @render Note attachment ghost line.
 */

import type { ReactElement } from "react";
import type { Point } from "../../../../../../shared/geometry";
import {
  NOTE_ATTACH_GHOST_DASH_PATTERN,
  NOTE_ATTACH_GHOST_STROKE,
  NOTE_ATTACH_GHOST_STROKE_WIDTH,
  NOTE_ATTACH_GHOST_Z_INDEX,
} from "../../../../../config/editorUiConfig";
import styles from "./NoteAttachGhostLine.module.css";

type NoteAttachGhostLineProps = {
  readonly sourcePoint: Point;
  readonly targetPoint: Point;
};

export default function NoteAttachGhostLine({
  sourcePoint,
  targetPoint,
}: NoteAttachGhostLineProps): ReactElement {
  return (
    <svg className={styles.layer} style={{ zIndex: NOTE_ATTACH_GHOST_Z_INDEX }} aria-hidden="true">
      <line
        className={styles.line}
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        stroke={NOTE_ATTACH_GHOST_STROKE}
        strokeWidth={NOTE_ATTACH_GHOST_STROKE_WIDTH}
        strokeDasharray={NOTE_ATTACH_GHOST_DASH_PATTERN}
      />
    </svg>
  );
}
