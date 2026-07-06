/**
 * @fileoverview Canonical ledger of Shiny View editor state shapes.
 *
 * This file lists semantic React state contracts used by the Shiny View tree.
 * It defines state vocabulary only. Runtime ownership, initial values, reducers,
 * reconciliation, and consumer-specific interpretations stay with owning components.
 *
 * State annotations identify the View component that owns runtime storage.
 */

import type { ClassId, RelationshipId, StyleDefId } from "../../shared/ids";
import type { Rect } from "../../shared/geometry";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../shared/uml";
/*
 * Owned by: EditorSurface.
 *
 * Canonical selected editor entities. Consumers interpret this state for their
 * own scenarios, such as style inspection, shortcuts, canvas affordances, or
 * command derivation.
 */
export type SelectionState =
  | {
      readonly kind: "none";
    }
  | {
      readonly kind: "classes";
      readonly classIds: readonly ClassId[];
    }
  | {
      readonly kind: "relationship";
      readonly relationshipId: RelationshipId;
    }
  | {
      readonly kind: "style";
      readonly styleDefId: StyleDefId;
    };

/*
 * Owned by: EditorSurface.
 *
 * Pending node-placement tool state. Null means no node placement is active.
 */
export type NodePlacementState =
  | null
  | { readonly kind: "class" }
  | {
      readonly kind: "relationship";
      readonly seed: RelationshipSeed;
      readonly pendingSourceClassId: ClassId | null;
    };

export type RelationshipSeed = {
  readonly sourceEndpointKind: RelationshipEndpointKind;
  readonly lineKind: RelationshipLineKind;
  readonly targetEndpointKind: RelationshipEndpointKind;
  readonly sourceMultiplicity: string | null;
  readonly targetMultiplicity: string | null;
  readonly label: string | null;
};

/*
 * Owned by: DiagramCanvas.
 *
 * Framework-neutral transient class-box placement. It mirrors source-derived class
 * placement while React Flow interactions are in progress, before final editor
 * commands are dispatched and persisted by Controller.
 */
export type ClassBoxPlacementState = {
  readonly rectByClassId: ReadonlyMap<ClassId, Rect>;
};
