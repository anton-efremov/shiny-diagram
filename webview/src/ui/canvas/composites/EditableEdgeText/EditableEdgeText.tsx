/**
 * Editable edge text swapping a centered pill for a width-tracking editor.
 *
 * Displays `text`; a rest-state click reports `onSelect` and may report
 * `onEditRequest`, while double-click always reports both. During editing the
 * field grows with its local draft up to a fixed region, validates trivially,
 * and routes completion through `onCommit`; invalid blur, Escape, and cancel all
 * report `onDiscard`. Validation overlays use `validationStacking`.
 *
 * Options:
 * - `treatment` — `label` uses light label treatment; `multiplicity` uses dark
 *   caption treatment
 * - `isEditing` — off renders the text pill; on renders the editor
 * - `isEditRequestEnabled` — on lets a single click request editing; double-click
 *   requests editing in either state
 */

import { useState } from "react";
import type { ReactElement } from "react";
import EdgeTextSurface from "../../primitives/EdgeTextSurface/EdgeTextSurface";
import InlineCommitTextField from "../InlineCommitTextField/InlineCommitTextField";
import styles from "./EditableEdgeText.module.css";

type EditableEdgeTextProps = {
  readonly text: string;
  readonly treatment: "label" | "multiplicity";
  readonly isEditing: boolean;
  readonly isEditRequestEnabled: boolean;
  readonly validationStacking: number;
  readonly onSelect: () => void;
  readonly onEditRequest: () => void;
  readonly onCommit: (value: string) => void;
  readonly onDiscard: () => void;
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
  isEditRequestEnabled,
  validationStacking,
  onSelect,
  onEditRequest,
  onCommit,
  onDiscard,
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
            autoFocus
            isCancelVisible
            validationStacking={validationStacking}
            onDraftChange={setEditorText}
            onCommit={onCommit}
            onDiscard={onDiscard}
            onCancel={onDiscard}
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
        if (isEditRequestEnabled) onEditRequest();
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
