/**
 * @render Note attachment ghost line.
 */

import type { CSSProperties, ReactElement } from "react";
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
  const layerStyle = {
    "--note-attach-ghost-z-index": NOTE_ATTACH_GHOST_Z_INDEX,
  } as CSSProperties;

  return (
    <svg className={styles.layer} style={layerStyle} aria-hidden="true">
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
