/**
 * @behavior Relationship marker, line, and reverse edit routing.
 * @render Relationship shape controls.
 */

import type { ReactElement } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../../../shared/uml";
import type { RelationshipView } from "../../../../../views/schema";
import Button from "../../../../../ui/primitives/Button/Button";
import Dropdown from "../../../../../ui/composites/Dropdown/Dropdown";
import { useInteractions } from "./useInteractions";

const endpointKinds: readonly RelationshipEndpointKind[] = [
  "none",
  "arrow",
  "triangle",
  "composition",
  "aggregation",
  "lollipop",
];

const lineKinds: readonly RelationshipLineKind[] = ["solid", "dashed"];

type EdgeShapeControlsProps = {
  readonly view: RelationshipView;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
};

export default function EdgeShapeControls({
  view,
  onRelationshipSelect,
}: EdgeShapeControlsProps): ReactElement {
  // Event handler props derivation
  const { onSourceEndpointKindChange, onLineKindChange, onTargetEndpointKindChange, onReverse } =
    useInteractions(view, onRelationshipSelect);

  return (
    <>
      <Dropdown
        options={endpointKinds.map((endpointKind) => ({
          value: endpointKind,
          label: `Source endpoint: ${toEndpointLabel(endpointKind)}`,
        }))}
        value={view.sourceEndpointKind}
        onChange={(value) => onSourceEndpointKindChange(value as RelationshipEndpointKind)}
      />
      <Dropdown
        options={lineKinds.map((lineKind) => ({
          value: lineKind,
          label: `Line: ${toLineLabel(lineKind)}`,
        }))}
        value={view.lineKind}
        onChange={(value) => onLineKindChange(value as RelationshipLineKind)}
      />
      <Dropdown
        options={endpointKinds.map((endpointKind) => ({
          value: endpointKind,
          label: `Target endpoint: ${toEndpointLabel(endpointKind)}`,
        }))}
        value={view.targetEndpointKind}
        onChange={(value) => onTargetEndpointKindChange(value as RelationshipEndpointKind)}
      />
      <Button label="Reverse" onClick={onReverse} />
    </>
  );
}

// Private helpers
function toEndpointLabel(endpointKind: RelationshipEndpointKind): string {
  switch (endpointKind) {
    case "none":
      return "None";
    case "arrow":
      return "Arrow";
    case "triangle":
      return "Triangle";
    case "composition":
      return "Composition";
    case "aggregation":
      return "Aggregation";
    case "lollipop":
      return "Lollipop";
  }
}

function toLineLabel(lineKind: RelationshipLineKind): string {
  switch (lineKind) {
    case "solid":
      return "Solid";
    case "dashed":
      return "Dashed";
  }
}
