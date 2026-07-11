/**
 * @behavior Editable row list with add and reorder gestures.
 * @render Editable list rows.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactElement } from "react";
import EmphasisCommitTextField from "../EmphasisCommitTextField/EmphasisCommitTextField";
import type { TextEmphasis } from "../EmphasisCommitTextField/EmphasisCommitTextField";
import styles from "./EditableList.module.css";

export type { TextEmphasis };

export type EditableListRow = {
  readonly text: string;
  readonly emphasis?: TextEmphasis | null;
};

type DragState = {
  readonly index: number;
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly isActive: boolean;
  readonly dropGap: number;
};

type EditableListProps = {
  readonly rows: readonly EditableListRow[];
  readonly addLabel: string;
  readonly addTitle: string;
  readonly validate: (draft: string) => readonly string[];
  readonly isEditStartEnabled: boolean;
  readonly isEmphasisEditable: boolean;
  readonly onRowCommit: (index: number, value: string, emphasis: TextEmphasis | null) => void;
  readonly onRowAdd: (value: string, emphasis: TextEmphasis | null) => void;
  readonly onRowReorder: (from: number, to: number) => void;
};

const DRAG_THRESHOLD = 4;

export default function EditableList({
  rows,
  addLabel,
  addTitle,
  validate,
  isEditStartEnabled,
  isEmphasisEditable,
  onRowCommit,
  onRowAdd,
  onRowReorder,
}: EditableListProps): ReactElement {
  const listRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

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
    <div
      ref={listRef}
      className={[
        styles.list,
        isEditStartEnabled ? styles.isEditable : "",
        dragState?.isActive ? styles.isDragging : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
                className={[
                  styles.row,
                  "nodrag nopan",
                  isDragged ? styles.draggedRow : "",
                  row.emphasis === "underline" ? styles.underlined : "",
                  row.emphasis === "italic" ? styles.italic : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-editable-list-row="true"
                onPointerDown={(event) => {
                  if (!isEditStartEnabled) return;
                  event.stopPropagation();
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
                onMouseDown={(event) => {
                  if (!isEditStartEnabled) return;
                  event.stopPropagation();
                }}
                onPointerMove={(event) =>
                  updateDrag(event, index, dragState, setDragState, listRef.current)
                }
                onPointerUp={(event) => {
                  if (dragState?.pointerId !== event.pointerId || dragState.index !== index) {
                    return;
                  }
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
                onClick={(event) => {
                  if (!isEditStartEnabled) return;
                  event.stopPropagation();
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  if (isEditStartEnabled) setEditingIndex(index);
                }}
              >
                {row.text}
              </button>
            )}
          </Fragment>
        );
      })}
      {dragState?.isActive && dragState.dropGap === rows.length ? <DropIndicator /> : null}
      <div className={styles.addCell}>
        {editingIndex === "new" ? (
          <Editor
            initialValue=""
            initialEmphasis={null}
            validate={validate}
            onCommit={(value, emphasis) => {
              if (value.trim() !== "") onRowAdd(value.trim(), isEmphasisEditable ? emphasis : null);
              setEditingIndex(null);
            }}
            onDiscard={() => setEditingIndex(null)}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <button
            type="button"
            className={styles.addAffordance}
            disabled={!isEditStartEnabled}
            aria-label={addLabel}
            title={addTitle}
            onClick={() => setEditingIndex("new")}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function Editor({
  initialValue,
  initialEmphasis,
  validate,
  onCommit,
  onDiscard,
  onCancel,
}: {
  readonly initialValue: string;
  readonly initialEmphasis: TextEmphasis | null;
  readonly validate: (draft: string) => readonly string[];
  readonly onCommit: (value: string, emphasis: TextEmphasis | null) => void;
  readonly onDiscard: () => void;
  readonly onCancel: () => void;
}): ReactElement {
  return (
    <div className={`${styles.editorHost} nodrag nopan`}>
      <EmphasisCommitTextField
        initialValue={initialValue}
        initialEmphasis={initialEmphasis}
        validate={validate}
        autoFocus
        appearance="inline"
        onCommit={onCommit}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    </div>
  );
}

function DropIndicator(): ReactElement {
  return <span className={styles.dropIndicator} aria-hidden="true" />;
}

function updateDrag(
  event: PointerEvent<HTMLButtonElement>,
  index: number,
  dragState: DragState | null,
  setDragState: (state: DragState | null) => void,
  listElement: HTMLDivElement | null
): void {
  if (dragState?.pointerId !== event.pointerId || dragState.index !== index) return;
  const distance = Math.hypot(event.clientX - dragState.originX, event.clientY - dragState.originY);
  if (!dragState.isActive && distance < DRAG_THRESHOLD) return;
  event.preventDefault();
  event.stopPropagation();
  setDragState({
    ...dragState,
    isActive: true,
    dropGap: toDropGap(listElement, index, event.clientY),
  });
}

function toDropGap(listElement: HTMLDivElement | null, draggedIndex: number, pointerY: number) {
  if (!listElement) return 0;
  const rows = [...listElement.querySelectorAll<HTMLElement>("[data-editable-list-row='true']")];
  let gap = 0;
  rows.forEach((row, index) => {
    if (index === draggedIndex) return;
    const rect = row.getBoundingClientRect();
    if (pointerY >= rect.top + rect.height / 2) gap++;
  });
  return gap;
}
