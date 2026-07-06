/**
 * @behavior Relationship selection and inline text editing.
 * @render Relationship edge path, markers, multiplicities, and label.
 */

import { useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactElement } from "react";
import type { RelationshipId } from "../../../../../../../shared/ids";
import type { RelationshipView } from "../../../../../../views/schema";
import RelationshipMarker from "../../RelationshipMarker/RelationshipMarker";
import { useInteractions } from "./useInteractions";
import styles from "./RelationshipEdge.module.css";

type RelationshipEdgeProps = {
  readonly edgeId: string;
  readonly view: RelationshipView;
  readonly isSelected: boolean;
  readonly edgePath: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly sourceX: number;
  readonly sourceY: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
};

type EditTarget = "label" | "sourceMultiplicity" | "targetMultiplicity";

export default function RelationshipEdge({
  edgeId,
  view,
  isSelected,
  edgePath,
  labelX,
  labelY,
  sourceX,
  sourceY,
  targetX,
  targetY,
  onRelationshipSelect,
}: RelationshipEdgeProps): ReactElement {
  // State creation: local state - inline text edit target and draft value
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [draft, setDraft] = useState("");

  // Event handler props derivation
  const { onEdgeSelect, onTextEditStart, onDraftChange, onDraftKeyDown, onDraftBlur } =
    useInteractions({
      view,
      isSelected,
      onRelationshipSelect,
      editTarget,
      setEditTarget,
      draft,
      setDraft,
    });

  // UI props derivation
  const sourceMarkerId = `${edgeId}-source-${view.sourceEndpointKind}`;
  const targetMarkerId = `${edgeId}-target-${view.targetEndpointKind}`;
  const className = [styles.edgePath, isSelected ? styles.selected : ""].filter(Boolean).join(" ");
  const sourceMultiplicityX = sourceX + (labelX - sourceX) * 0.3;
  const sourceMultiplicityY = sourceY + (labelY - sourceY) * 0.3;
  const targetMultiplicityX = targetX + (labelX - targetX) * 0.3;
  const targetMultiplicityY = targetY + (labelY - targetY) * 0.3;

  return (
    <g onClick={onEdgeSelect}>
      <defs>
        <RelationshipMarker
          id={sourceMarkerId}
          endpointKind={view.sourceEndpointKind}
          side="source"
        />
        <RelationshipMarker
          id={targetMarkerId}
          endpointKind={view.targetEndpointKind}
          side="target"
        />
      </defs>
      <path
        className={styles.hitPath}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
      />
      <path
        className={className}
        d={edgePath}
        fill="none"
        markerStart={toMarkerUrl(sourceMarkerId, view.sourceEndpointKind)}
        markerEnd={toMarkerUrl(targetMarkerId, view.targetEndpointKind)}
        strokeDasharray={view.lineKind === "dashed" ? "6 4" : undefined}
      />
      {view.sourceMultiplicity || isSelected ? (
        <EditableText
          target="sourceMultiplicity"
          x={sourceMultiplicityX}
          y={sourceMultiplicityY}
          value={view.sourceMultiplicity ?? ""}
          editTarget={editTarget}
          draft={draft}
          isSelected={isSelected}
          onTextEditStart={onTextEditStart}
          onDraftChange={onDraftChange}
          onDraftKeyDown={onDraftKeyDown}
          onDraftBlur={onDraftBlur}
        />
      ) : null}
      {view.targetMultiplicity || isSelected ? (
        <EditableText
          target="targetMultiplicity"
          x={targetMultiplicityX}
          y={targetMultiplicityY}
          value={view.targetMultiplicity ?? ""}
          editTarget={editTarget}
          draft={draft}
          isSelected={isSelected}
          onTextEditStart={onTextEditStart}
          onDraftChange={onDraftChange}
          onDraftKeyDown={onDraftKeyDown}
          onDraftBlur={onDraftBlur}
        />
      ) : null}
      {view.label || isSelected ? (
        <EditableText
          target="label"
          x={labelX}
          y={labelY}
          value={view.label ?? ""}
          editTarget={editTarget}
          draft={draft}
          isSelected={isSelected}
          onTextEditStart={onTextEditStart}
          onDraftChange={onDraftChange}
          onDraftKeyDown={onDraftKeyDown}
          onDraftBlur={onDraftBlur}
        />
      ) : null}
    </g>
  );
}

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

function EditableText({
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
  const isEditing = editTarget === target;
  const displayValue = value === "" ? " " : value;
  return (
    <foreignObject x={x - 48} y={y - 14} width={96} height={28} className={styles.textObject}>
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

// Private helpers
function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}
