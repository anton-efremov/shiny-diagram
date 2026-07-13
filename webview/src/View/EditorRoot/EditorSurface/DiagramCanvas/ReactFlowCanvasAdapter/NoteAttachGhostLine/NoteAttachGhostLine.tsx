/**
 * @render Note attachment ghost line.
 */

import type { CSSProperties, ReactElement } from "react";
import type { Point } from "../../../../../../shared/geometry";
import { NOTE_ATTACH_GHOST_Z_INDEX } from "../../../../../config/editorUiConfig";
import EdgeGhostLine from "../../../../../../ui/canvas/primitives/EdgeGhostLine/EdgeGhostLine";

type NoteAttachGhostLineProps = {
  readonly sourcePoint: Point;
  readonly targetPoint: Point;
};

export default function NoteAttachGhostLine({
  sourcePoint,
  targetPoint,
}: NoteAttachGhostLineProps): ReactElement {
  const layerStyle = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    zIndex: NOTE_ATTACH_GHOST_Z_INDEX,
    pointerEvents: "none",
  } as CSSProperties;

  return (
    <svg style={layerStyle} aria-hidden="true">
      <EdgeGhostLine
        startPoint={sourcePoint}
        endPoint={targetPoint}
        lineKind="dashed"
        tone="attachment"
      />
    </svg>
  );
}
