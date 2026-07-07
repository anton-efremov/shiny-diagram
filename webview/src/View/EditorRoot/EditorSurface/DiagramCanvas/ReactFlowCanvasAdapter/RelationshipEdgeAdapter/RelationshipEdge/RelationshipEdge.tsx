/**
 * @behavior Relationship selection and inline text editing.
 * @render Relationship edge path, markers, multiplicities, and label.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { RelationshipId } from "../../../../../../../shared/ids";
import {
  RELATIONSHIP_EDGE_DASH_PATTERN,
  RELATIONSHIP_EDGE_HIT_PATH_STROKE_WIDTH,
  RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION,
} from "../../../../../../config/editorUiConfig";
import type { RelationshipView } from "../../../../../../views/schema";
import RelationshipMarker from "../../../../../../ui/RelationshipMarker/RelationshipMarker";
import EditableText from "./EditableText/EditableText";
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

type EditTarget = "label" | "sourceMultiplicity" | "targetMultiplicity";

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
      {view.sourceMultiplicity ? (
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
      {view.targetMultiplicity ? (
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
      {view.label ? (
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

// Private helpers
function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}
