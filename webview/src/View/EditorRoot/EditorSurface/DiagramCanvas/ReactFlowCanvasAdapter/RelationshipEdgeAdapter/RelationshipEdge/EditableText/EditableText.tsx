/**
 * @render Relationship edge inline text editor: a content-sized text box
 * centered on its edge anchor.
 */

import type { ReactElement } from "react";
import {
  RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT,
  RELATIONSHIP_EDGE_TEXT_REGION_WIDTH,
} from "../../../../../../../config/editorUiConfig";
import styles from "./EditableText.module.css";

type EditableTextProps = {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly tone: "light" | "dark";
  readonly isEditing: boolean;
  readonly isEditStartEnabled: boolean;
  readonly onSelect: () => void;
  readonly onEditStart: () => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftCommit: () => void;
  readonly onDraftDiscard: () => void;
};

export default function EditableText({
  x,
  y,
  text,
  tone,
  isEditing,
  isEditStartEnabled,
  onSelect,
  onEditStart,
  onDraftChange,
  onDraftCommit,
  onDraftDiscard,
}: EditableTextProps): ReactElement {
  const displayText = text === "" ? " " : text;
  const toneClassName = tone === "light" ? styles.light : styles.dark;

  return (
    <foreignObject
      x={x - RELATIONSHIP_EDGE_TEXT_REGION_WIDTH / 2}
      y={y - RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT / 2}
      width={RELATIONSHIP_EDGE_TEXT_REGION_WIDTH}
      height={RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT}
      className={styles.textObject}
    >
      <div className={styles.fitBox}>
        {isEditing ? (
          <input
            className={`${styles.textInput} ${toneClassName}`}
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
            className={`${styles.textButton} ${toneClassName}`}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
              if (isEditStartEnabled) onEditStart();
            }}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onSelect();
              onEditStart();
            }}
          >
            {displayText}
          </button>
        )}
      </div>
    </foreignObject>
  );
}
