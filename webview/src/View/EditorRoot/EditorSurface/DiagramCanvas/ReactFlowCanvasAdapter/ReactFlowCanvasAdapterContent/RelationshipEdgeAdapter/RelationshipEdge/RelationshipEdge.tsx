/**
 * @behavior Relationship selection and inline text editing.
 * @render Relationship edge path, markers, multiplicities, and label.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { RelationshipId } from "../../../../../../../../shared/ids";
import {
  RELATIONSHIP_EDGE_DASH_PATTERN,
  RELATIONSHIP_EDGE_HIT_PATH_STROKE_WIDTH,
  RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION,
} from "../../../../../../../config/editorUiConfig";
import type { RelationshipView } from "../../../../../../../views/schema";
import RelationshipMarker from "../../../../../../../ui/RelationshipMarker/RelationshipMarker";
import EditableText from "./EditableText/EditableText";
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
  const [draft, setDraft] = useState("");

  // Event handler props derivation
  const { onEdgeSelect, onEditStart, onDraftChange, onDraftCommit, onDraftDiscard } =
    useInteractions({
      view,
      isSelected,
      onRelationshipSelect,
      editTarget,
      setEditTarget,
      draft,
      setDraft,
    });
  const onLabelEditStart = () => onEditStart("label", view.label ?? "");
  const onSourceMultiplicityEditStart = () =>
    onEditStart("sourceMultiplicity", view.sourceMultiplicity ?? "");
  const onTargetMultiplicityEditStart = () =>
    onEditStart("targetMultiplicity", view.targetMultiplicity ?? "");

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
          x={sourceMultiplicityX}
          y={sourceMultiplicityY}
          text={isSourceMultiplicityEditing ? draft : (view.sourceMultiplicity ?? "")}
          isEditing={isSourceMultiplicityEditing}
          isEditStartEnabled={isSelected}
          onEditStart={onSourceMultiplicityEditStart}
          onDraftChange={onDraftChange}
          onDraftCommit={onDraftCommit}
          onDraftDiscard={onDraftDiscard}
        />
      ) : null}
      {view.targetMultiplicity ? (
        <EditableText
          x={targetMultiplicityX}
          y={targetMultiplicityY}
          text={isTargetMultiplicityEditing ? draft : (view.targetMultiplicity ?? "")}
          isEditing={isTargetMultiplicityEditing}
          isEditStartEnabled={isSelected}
          onEditStart={onTargetMultiplicityEditStart}
          onDraftChange={onDraftChange}
          onDraftCommit={onDraftCommit}
          onDraftDiscard={onDraftDiscard}
        />
      ) : null}
      {view.label ? (
        <EditableText
          x={labelX}
          y={labelY}
          text={isLabelEditing ? draft : (view.label ?? "")}
          isEditing={isLabelEditing}
          isEditStartEnabled={isSelected}
          onEditStart={onLabelEditStart}
          onDraftChange={onDraftChange}
          onDraftCommit={onDraftCommit}
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
