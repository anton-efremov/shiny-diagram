/**
 * @render Relationship edge inline text editor.
 */

import type { ReactElement } from "react";
import {
  RELATIONSHIP_EDGE_TEXT_BOX_HEIGHT,
  RELATIONSHIP_EDGE_TEXT_BOX_WIDTH,
  RELATIONSHIP_EDGE_TEXT_BOX_X_OFFSET,
  RELATIONSHIP_EDGE_TEXT_BOX_Y_OFFSET,
} from "../../../../../../../../config/editorUiConfig";
import styles from "./EditableText.module.css";

type EditableTextProps = {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly isEditing: boolean;
  readonly isEditStartEnabled: boolean;
  readonly onEditStart: () => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftCommit: () => void;
  readonly onDraftDiscard: () => void;
};

export default function EditableText({
  x,
  y,
  text,
  isEditing,
  isEditStartEnabled,
  onEditStart,
  onDraftChange,
  onDraftCommit,
  onDraftDiscard,
}: EditableTextProps): ReactElement {
  const displayText = text === "" ? " " : text;

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
          value={text}
          autoFocus
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onDraftCommit();
            if (event.key === "Escape") onDraftDiscard();
          }}
          onBlur={() => onDraftDiscard()}
        />
      ) : (
        <button
          className={styles.textButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isEditStartEnabled) onEditStart();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            onEditStart();
          }}
        >
          {displayText}
        </button>
      )}
    </foreignObject>
  );
}
