/**
 * Editable edge text swapping a centered pill for a width-tracking editor.
 *
 * Displays `text`; clicking it while at rest reports `onSelect` and may report
 * `onEditRequest`, while double-clicking always reports both. During editing the
 * field grows with the draft up to a fixed maximum; committing reports
 * `onCommit`; abandoning or cancelling reports `onCancel`. Validation overlays
 * use `validationStacking`.
 *
 * Lifecycle:
 * - `isEditing` — off renders the text pill; on renders the editor
 * - `isClickEditEnabled` — on lets a single click request editing; double-click
 *   requests editing in either state
 *
 * Modifiers:
 * - `treatment` — the edge-text situation:
 *   - `label` uses light label treatment. Used by: relationship labels
 *   - `multiplicity` uses dark caption treatment. Used by: endpoint
 *     multiplicities
 */

import { useState } from "react";
import type { ReactElement } from "react";
import EdgeTextSurface from "../../primitives/EdgeTextSurface/EdgeTextSurface";
import InlineCommitTextField from "../InlineCommitTextField/InlineCommitTextField";
import styles from "./EditableEdgeText.module.css";

type EditableEdgeTextProps = {
  readonly text: string;
  readonly validationStacking: number;
  readonly isEditing: boolean;
  readonly isClickEditEnabled: boolean;
  readonly treatment: "label" | "multiplicity";
  readonly onSelect: () => void;
  readonly onEditRequest: () => void;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
};

const REGION_WIDTH = 240;
const REGION_HEIGHT = 64;
const MIN_WIDTH = 48;
const CHARACTER_WIDTH = 7;
const CANCEL_ALLOWANCE = 30;

export default function EditableEdgeText({
  text,
  treatment,
  isEditing,
  isClickEditEnabled,
  validationStacking,
  onSelect,
  onEditRequest,
  onCommit,
  onCancel,
}: EditableEdgeTextProps): ReactElement {
  const [editorText, setEditorText] = useState(text);

  if (isEditing) {
    const editorWidth = Math.min(
      REGION_WIDTH,
      Math.max(MIN_WIDTH, editorText.length * CHARACTER_WIDTH + CANCEL_ALLOWANCE)
    );
    return (
      <foreignObject
        x={-editorWidth / 2}
        y={-REGION_HEIGHT / 2}
        width={editorWidth}
        height={REGION_HEIGHT}
        className={styles.textObject}
      >
        <div
          className={styles.editorHost}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <InlineCommitTextField
            initialValue={text}
            isEditing
            treatment={treatment}
            validate={() => []}
            ariaLabel="Relationship text"
            isCancelVisible
            validationStacking={validationStacking}
            onDraftChange={setEditorText}
            onCommit={onCommit}
            onDiscard={() => undefined}
            onCancel={onCancel}
          />
        </div>
      </foreignObject>
    );
  }

  return (
    <g
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
        if (isClickEditEnabled) onEditRequest();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onSelect();
        onEditRequest();
      }}
    >
      <EdgeTextSurface text={text} variant={treatment} />
    </g>
  );
}
