/**
 * @render Relationship edge inline text editor.
 */

import type { KeyboardEvent, MouseEvent, ReactElement } from "react";
import {
  RELATIONSHIP_EDGE_TEXT_BOX_HEIGHT,
  RELATIONSHIP_EDGE_TEXT_BOX_WIDTH,
  RELATIONSHIP_EDGE_TEXT_BOX_X_OFFSET,
  RELATIONSHIP_EDGE_TEXT_BOX_Y_OFFSET,
} from "../../../../../../../config/editorUiConfig";
import styles from "./EditableText.module.css";

type EditTarget = "label" | "sourceMultiplicity" | "targetMultiplicity";

type EditableTextProps = {
  readonly target: EditTarget;
  readonly x: number;
  readonly y: number;
  readonly value: string;
  readonly editTarget: EditTarget | null;
  readonly draft: string;
  readonly isSelected: boolean;
  readonly onTextEditStart: (target: EditTarget, value: string) => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onDraftBlur: () => void;
};

export default function EditableText({
  target,
  x,
  y,
  value,
  editTarget,
  draft,
  isSelected,
  onTextEditStart,
  onDraftChange,
  onDraftKeyDown,
  onDraftBlur,
}: EditableTextProps): ReactElement {
  // UI props derivation
  const isEditing = editTarget === target;
  const displayValue = value === "" ? " " : value;

  return (
    <foreignObject
      x={x - RELATIONSHIP_EDGE_TEXT_BOX_X_OFFSET}
      y={y - RELATIONSHIP_EDGE_TEXT_BOX_Y_OFFSET}
      width={RELATIONSHIP_EDGE_TEXT_BOX_WIDTH}
      height={RELATIONSHIP_EDGE_TEXT_BOX_HEIGHT}
      className={styles.textObject}
    >
      {isEditing ? (
        <input
          className={styles.textInput}
          value={draft}
          autoFocus
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onDraftKeyDown}
          onBlur={onDraftBlur}
        />
      ) : (
        <button
          className={styles.textButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isSelected) onTextEditStart(target, value);
          }}
          onDoubleClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onTextEditStart(target, value);
          }}
        >
          {displayValue}
        </button>
      )}
    </foreignObject>
  );
}
