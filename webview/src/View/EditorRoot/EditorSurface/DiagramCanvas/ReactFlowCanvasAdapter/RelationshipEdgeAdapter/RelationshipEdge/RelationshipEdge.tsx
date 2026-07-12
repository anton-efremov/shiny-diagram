/**
 * @behavior Relationship selection and inline text editing.
 * @render Relationship edge path, markers, multiplicities, and label.
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { RelationshipId } from "../../../../../../../shared/ids";
import {
  RELATIONSHIP_EDGE_DASH_PATTERN,
  RELATIONSHIP_EDGE_HIT_PATH_STROKE_WIDTH,
  RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION,
  RELATIONSHIP_EDGE_MULTIPLICITY_NORMAL_OFFSET,
  RELATIONSHIP_EDGE_TEXT_CANCEL_ALLOWANCE,
  RELATIONSHIP_EDGE_TEXT_CHARACTER_WIDTH,
  RELATIONSHIP_EDGE_TEXT_MIN_WIDTH,
  RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT,
  RELATIONSHIP_EDGE_TEXT_REGION_WIDTH,
} from "../../../../../../config/editorUiConfig";
import type { RelationshipView } from "../../../../../../views/schema";
import RelationshipMarker from "../../RelationshipMarker/RelationshipMarker";
import CommitTextField from "../../../../../../ui/composites/CommitTextField/CommitTextField";
import type { EditTarget } from "./state";
import { useInteractions } from "./useInteractions";
import styles from "./RelationshipEdge.module.css";

type RelationshipEdgeProps = {
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

export default function RelationshipEdge({
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

  // Event handler props derivation
  const { onEdgeSelect, onEditStart, onEditCommit, onDraftDiscard } = useInteractions({
    view,
    isSelected,
    onRelationshipSelect,
    editTarget,
    setEditTarget,
  });

  // UI props derivation
  const isLabelEditing = editTarget === "label";
  const isSourceMultiplicityEditing = editTarget === "sourceMultiplicity";
  const isTargetMultiplicityEditing = editTarget === "targetMultiplicity";
  const sourceMarkerId = `${view.relationshipId}-source-${view.sourceEndpointKind}`;
  const targetMarkerId = `${view.relationshipId}-target-${view.targetEndpointKind}`;
  const className = [styles.edgePath, isSelected ? styles.selected : ""].filter(Boolean).join(" ");
  const sourceMultiplicityX =
    sourceX + (labelX - sourceX) * RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION;
  const sourceMultiplicityY =
    sourceY + (labelY - sourceY) * RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION;
  const targetMultiplicityX =
    targetX + (labelX - targetX) * RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION;
  const targetMultiplicityY =
    targetY + (labelY - targetY) * RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION;
  const multiplicityNormal = toNormalOffset(
    sourceX,
    sourceY,
    targetX,
    targetY,
    RELATIONSHIP_EDGE_MULTIPLICITY_NORMAL_OFFSET
  );

  return (
    <g
      onClick={(event) => {
        event.stopPropagation();
        onEdgeSelect();
      }}
    >
      <defs>
        <RelationshipMarker
          id={sourceMarkerId}
          endpointKind={view.sourceEndpointKind}
          side="source"
          selected={isSelected}
        />
        <RelationshipMarker
          id={targetMarkerId}
          endpointKind={view.targetEndpointKind}
          side="target"
          selected={isSelected}
        />
      </defs>
      <path
        className={styles.hitPath}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={RELATIONSHIP_EDGE_HIT_PATH_STROKE_WIDTH}
      />
      <path
        className={className}
        d={edgePath}
        fill="none"
        markerStart={toMarkerUrl(sourceMarkerId, view.sourceEndpointKind)}
        markerEnd={toMarkerUrl(targetMarkerId, view.targetEndpointKind)}
        strokeDasharray={view.lineKind === "dashed" ? RELATIONSHIP_EDGE_DASH_PATTERN : undefined}
      />
      {isSelected ? (
        <>
          <circle className={styles.reconnectEndpoint} cx={sourceX} cy={sourceY} r={2.5} />
          <circle className={styles.reconnectEndpoint} cx={targetX} cy={targetY} r={2.5} />
        </>
      ) : null}
      {view.sourceMultiplicity || isSourceMultiplicityEditing ? (
        <EdgeText
          x={sourceMultiplicityX + multiplicityNormal.x}
          y={sourceMultiplicityY + multiplicityNormal.y}
          text={view.sourceMultiplicity ?? ""}
          tone="dark"
          isEditing={isSourceMultiplicityEditing}
          isEditStartEnabled={isSelected}
          onSelect={onEdgeSelect}
          onEditStart={() => onEditStart("sourceMultiplicity")}
          onCommit={onEditCommit}
          onDraftDiscard={onDraftDiscard}
        />
      ) : null}
      {view.targetMultiplicity || isTargetMultiplicityEditing ? (
        <EdgeText
          x={targetMultiplicityX + multiplicityNormal.x}
          y={targetMultiplicityY + multiplicityNormal.y}
          text={view.targetMultiplicity ?? ""}
          tone="dark"
          isEditing={isTargetMultiplicityEditing}
          isEditStartEnabled={isSelected}
          onSelect={onEdgeSelect}
          onEditStart={() => onEditStart("targetMultiplicity")}
          onCommit={onEditCommit}
          onDraftDiscard={onDraftDiscard}
        />
      ) : null}
      {view.label || isLabelEditing ? (
        <EdgeText
          x={labelX}
          y={labelY}
          text={view.label ?? ""}
          tone="light"
          isEditing={isLabelEditing}
          isEditStartEnabled={isSelected}
          onSelect={onEdgeSelect}
          onEditStart={() => onEditStart("label")}
          onCommit={onEditCommit}
          onDraftDiscard={onDraftDiscard}
        />
      ) : null}
    </g>
  );
}

// Private helpers
function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}

function EdgeText({
  x,
  y,
  text,
  tone,
  isEditing,
  isEditStartEnabled,
  onSelect,
  onEditStart,
  onCommit,
  onDraftDiscard,
}: {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly tone: "light" | "dark";
  readonly isEditing: boolean;
  readonly isEditStartEnabled: boolean;
  readonly onSelect: () => void;
  readonly onEditStart: () => void;
  readonly onCommit: (value: string) => void;
  readonly onDraftDiscard: () => void;
}): ReactElement {
  const [editorText, setEditorText] = useState(text);

  if (isEditing) {
    const editorWidth = toEditorWidth(editorText);
    return (
      <foreignObject
        x={x - editorWidth / 2}
        y={y - RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT / 2}
        width={editorWidth}
        height={RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT}
        className={styles.textObject}
      >
        <div
          className={`${styles.editorHost} ${tone === "light" ? styles.lightEditor : styles.darkEditor} nodrag nopan`}
        >
          <CommitTextField
            initialValue={text}
            validate={() => []}
            ariaLabel="Relationship text"
            isLabelVisible={false}
            autoFocus
            appearance="inline"
            situation={tone === "light" ? "edgeLabel" : "edgeCaption"}
            isCancelVisible
            onDraftChange={setEditorText}
            onCommit={onCommit}
            onDiscard={onDraftDiscard}
            onCancel={onDraftDiscard}
          />
        </div>
      </foreignObject>
    );
  }

  const surfaceWidth = Math.max(24, text.length * 7 + 12);
  return (
    <g
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
      <rect
        x={x - surfaceWidth / 2}
        y={y - 9}
        width={surfaceWidth}
        height={18}
        className={tone === "light" ? styles.lightTextSurface : styles.darkTextSurface}
      />
      <text
        x={x}
        y={y}
        className={tone === "light" ? styles.lightText : styles.darkText}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {text}
      </text>
    </g>
  );
}

function toEditorWidth(text: string): number {
  return Math.min(
    RELATIONSHIP_EDGE_TEXT_REGION_WIDTH,
    Math.max(
      RELATIONSHIP_EDGE_TEXT_MIN_WIDTH,
      text.length * RELATIONSHIP_EDGE_TEXT_CHARACTER_WIDTH + RELATIONSHIP_EDGE_TEXT_CANCEL_ALLOWANCE
    )
  );
}

function toNormalOffset(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  distance: number
): { readonly x: number; readonly y: number } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.hypot(dx, dy);
  return length === 0
    ? { x: 0, y: -distance }
    : { x: (-dy / length) * distance, y: (dx / length) * distance };
}
