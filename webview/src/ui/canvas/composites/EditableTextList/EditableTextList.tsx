/**
 * @behavior Editable rows with add and pointer-reorder gestures.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import type { ReorderDragState } from "../../../core/reorderGesture";
import { updateReorderDrag } from "../../../core/reorderGesture";
import DropIndicator from "../../primitives/DropIndicator/DropIndicator";
import InlineActionButton from "../../primitives/InlineActionButton/InlineActionButton";
import InlineTextBlock from "../../primitives/InlineTextBlock/InlineTextBlock";
import InlineEmphasisCommitTextField from "../InlineEmphasisCommitTextField/InlineEmphasisCommitTextField";
import type { TextEmphasis } from "../InlineEmphasisCommitTextField/InlineEmphasisCommitTextField";
import styles from "./EditableTextList.module.css";

export type { TextEmphasis };

export type EditableTextListRow = {
  readonly text: string;
  readonly emphasis?: TextEmphasis | null;
};

type EditableTextListProps = {
  readonly rows: readonly EditableTextListRow[];
  readonly addLabel: string;
  readonly addTitle: string;
  readonly validate: (draft: string) => readonly string[];
  readonly isEditStartEnabled: boolean;
  readonly isEmphasisEditable: boolean;
  readonly actionStacking: number;
  readonly validationStacking: number;
  readonly surface?: string;
  readonly surfaceTone?: "default" | "base" | "neutral";
  readonly onRowCommit: (index: number, value: string, emphasis: TextEmphasis | null) => void;
  readonly onRowAdd: (value: string, emphasis: TextEmphasis | null) => void;
  readonly onRowReorder: (from: number, to: number) => void;
};

const ADD_GLYPH: GlyphDescriptor = {
  paths: ["M4 8h8M8 4v8"],
  filled: false,
  dashed: false,
};

export default function EditableTextList({
  rows,
  addLabel,
  addTitle,
  validate,
  isEditStartEnabled,
  isEmphasisEditable,
  actionStacking,
  validationStacking,
  surface,
  surfaceTone,
  onRowCommit,
  onRowAdd,
  onRowReorder,
}: EditableTextListProps): ReactElement {
  const listRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);
  const [dragState, setDragState] = useState<ReorderDragState | null>(null);
  const [isAddHovered, setIsAddHovered] = useState(false);

  useEffect(() => {
    if (!dragState?.isActive) return undefined;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setDragState(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dragState?.isActive]);

  return (
    <div ref={listRef} className={`${styles.list} ${dragState?.isActive ? styles.dragging : ""}`}>
      {rows.map((row, index) => {
        const isDragged = dragState?.index === index;
        const indicator =
          dragState?.isActive && dragState.dropGap === index && !isDragged ? (
            <DropIndicator key={`drop-before-${index}`} />
          ) : null;

        return (
          <Fragment key={`${index}:${row.text}`}>
            {indicator}
            {editingIndex === index ? (
              <Editor
                initialValue={row.text}
                initialEmphasis={isEmphasisEditable ? (row.emphasis ?? null) : null}
                validate={validate}
                actionStacking={actionStacking}
                validationStacking={validationStacking}
                surface={surface}
                surfaceTone={surfaceTone}
                onCommit={(value, emphasis) => {
                  onRowCommit(index, value.trim(), isEmphasisEditable ? emphasis : null);
                  setEditingIndex(null);
                }}
                onDiscard={() => setEditingIndex(null)}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <button
                type="button"
                className={`${styles.rowHost} ${isEditStartEnabled ? styles.editable : ""} ${isDragged ? styles.dragged : ""} ${row.emphasis === "underline" ? styles.underlined : ""} ${row.emphasis === "italic" ? styles.italic : ""}`}
                data-reorder-row="true"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (!isEditStartEnabled) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragState({
                    index,
                    pointerId: event.pointerId,
                    originX: event.clientX,
                    originY: event.clientY,
                    isActive: false,
                    dropGap: 0,
                  });
                }}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerMove={(event) =>
                  updateReorderDrag(event, index, dragState, setDragState, listRef.current)
                }
                onPointerUp={(event) => {
                  if (dragState?.pointerId !== event.pointerId || dragState.index !== index) return;
                  event.stopPropagation();
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  if (dragState.isActive) {
                    event.preventDefault();
                    suppressClickRef.current = true;
                    onRowReorder(index, dragState.dropGap);
                  }
                  setDragState(null);
                }}
              >
                <InlineTextBlock
                  text={row.text}
                  variant="row"
                  onEditRequest={(event) => {
                    event.stopPropagation();
                    if (!isEditStartEnabled) return;
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false;
                      return;
                    }
                    setEditingIndex(index);
                  }}
                />
              </button>
            )}
          </Fragment>
        );
      })}
      {dragState?.isActive && dragState.dropGap === rows.length ? <DropIndicator /> : null}
      <div
        className={styles.addCell}
        onPointerEnter={() => setIsAddHovered(true)}
        onPointerLeave={() => setIsAddHovered(false)}
      >
        {editingIndex === "new" ? (
          <Editor
            initialValue=""
            initialEmphasis={null}
            validate={validate}
            actionStacking={actionStacking}
            validationStacking={validationStacking}
            surface={surface}
            surfaceTone={surfaceTone}
            onCommit={(value, emphasis) => {
              if (value.trim() !== "") {
                onRowAdd(value.trim(), isEmphasisEditable ? emphasis : null);
              }
              setEditingIndex(null);
            }}
            onDiscard={() => setEditingIndex(null)}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <InlineActionButton
            glyph={ADD_GLYPH}
            label={addLabel}
            title={addTitle}
            treatment="add"
            disabled={!isEditStartEnabled}
            visible={isAddHovered && isEditStartEnabled}
            onPress={() => setEditingIndex("new")}
          />
        )}
      </div>
    </div>
  );
}

function Editor({
  initialValue,
  initialEmphasis,
  validate,
  actionStacking,
  validationStacking,
  surface,
  surfaceTone,
  onCommit,
  onDiscard,
  onCancel,
}: {
  readonly initialValue: string;
  readonly initialEmphasis: TextEmphasis | null;
  readonly validate: (draft: string) => readonly string[];
  readonly actionStacking: number;
  readonly validationStacking: number;
  readonly surface?: string;
  readonly surfaceTone?: "default" | "base" | "neutral";
  readonly onCommit: (value: string, emphasis: TextEmphasis | null) => void;
  readonly onDiscard: () => void;
  readonly onCancel: () => void;
}): ReactElement {
  return (
    <div className={styles.editorHost}>
      <InlineEmphasisCommitTextField
        initialValue={initialValue}
        initialEmphasis={initialEmphasis}
        validate={validate}
        autoFocus
        actionStacking={actionStacking}
        validationStacking={validationStacking}
        surface={surface}
        surfaceTone={surfaceTone}
        onCommit={onCommit}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    </div>
  );
}
