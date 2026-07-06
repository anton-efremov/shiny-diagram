/**
 * @behavior Relationship marker, line, and reverse edit routing.
 * @render Relationship shape controls.
 */

import type { ChangeEvent, ReactElement } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../../../shared/uml";
import type { RelationshipView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./EdgeShapeControls.module.css";

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
  const { onSourceEndpointKindChange, onLineKindChange, onTargetEndpointKindChange, onReverse } =
    useInteractions(view, onRelationshipSelect);

  function onSourceChange(event: ChangeEvent<HTMLSelectElement>): void {
    onSourceEndpointKindChange(event.currentTarget.value as RelationshipEndpointKind);
  }

  function onLineChange(event: ChangeEvent<HTMLSelectElement>): void {
    onLineKindChange(event.currentTarget.value as RelationshipLineKind);
  }

  function onTargetChange(event: ChangeEvent<HTMLSelectElement>): void {
    onTargetEndpointKindChange(event.currentTarget.value as RelationshipEndpointKind);
  }

  return (
    <section className={styles.section} aria-label="Relationship shape">
      <label className={styles.field}>
        <span>Source marker</span>
        <select value={view.sourceEndpointKind} onChange={onSourceChange}>
          {endpointKinds.map((endpointKind) => (
            <option key={endpointKind} value={endpointKind}>
              {toEndpointLabel(endpointKind)}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Line</span>
        <select value={view.lineKind} onChange={onLineChange}>
          {lineKinds.map((lineKind) => (
            <option key={lineKind} value={lineKind}>
              {toLineLabel(lineKind)}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Target marker</span>
        <select value={view.targetEndpointKind} onChange={onTargetChange}>
          {endpointKinds.map((endpointKind) => (
            <option key={endpointKind} value={endpointKind}>
              {toEndpointLabel(endpointKind)}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onReverse}>
        Reverse
      </button>
    </section>
  );
}

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
