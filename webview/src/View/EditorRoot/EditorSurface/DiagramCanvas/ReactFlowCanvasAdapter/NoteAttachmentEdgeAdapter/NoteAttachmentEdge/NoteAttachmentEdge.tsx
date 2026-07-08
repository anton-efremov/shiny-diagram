/**
 * @render Note attachment edge path.
 */

import type { ReactElement } from "react";
import {
  NOTE_ATTACHMENT_EDGE_STROKE,
  NOTE_ATTACHMENT_EDGE_STROKE_WIDTH,
  RELATIONSHIP_EDGE_DASH_PATTERN,
} from "../../../../../../config/editorUiConfig";
import styles from "./NoteAttachmentEdge.module.css";

type NoteAttachmentEdgeProps = {
  readonly edgePath: string;
};

export default function NoteAttachmentEdge({ edgePath }: NoteAttachmentEdgeProps): ReactElement {
  return (
    <path
      className={styles.edge}
      d={edgePath}
      stroke={NOTE_ATTACHMENT_EDGE_STROKE}
      strokeWidth={NOTE_ATTACHMENT_EDGE_STROKE_WIDTH}
      strokeDasharray={RELATIONSHIP_EDGE_DASH_PATTERN}
    />
  );
}
