/**
 * @behavior Selected relationship style section routing.
 * @render Relationship style inspector sections.
 */

import type { ReactElement } from "react";
import type { RelationshipId } from "../../../../../shared/ids";
import type { RelationshipSeed } from "../../../../state/editorStates";
import type { RelationshipView } from "../../../../views/schema";
import EdgeActions from "./EdgeActions/EdgeActions";
import EdgeShapeControls from "./EdgeShapeControls/EdgeShapeControls";
import LabelControls from "./LabelControls/LabelControls";
import MultiplicityControls from "./MultiplicityControls/MultiplicityControls";
import styles from "./RelationshipEditPane.module.css";

type RelationshipEditPaneProps = {
  readonly view: RelationshipView;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onRelationshipDuplicate: (seed: RelationshipSeed) => void;
};

export default function RelationshipEditPane({
  view,
  onRelationshipSelect,
  onRelationshipDuplicate,
}: RelationshipEditPaneProps): ReactElement {
  return (
    <section className={styles.selectionPanel} aria-label="Selected relationship styles">
      <EdgeShapeControls view={view} onRelationshipSelect={onRelationshipSelect} />
      <MultiplicityControls view={view} />
      <LabelControls view={view} />
      <EdgeActions view={view} onRelationshipDuplicate={onRelationshipDuplicate} />
    </section>
  );
}
