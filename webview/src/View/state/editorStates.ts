/**
 * @fileoverview Canonical ledger of Shiny View editor state shapes.
 *
 * This file lists semantic React state contracts used by the Shiny View tree.
 * It defines state vocabulary only. Runtime ownership, initial values, reducers,
 * reconciliation, and consumer-specific interpretations stay with owning components.
 *
 * State annotations identify the View component that owns runtime storage.
 */

import type { ClassId, NamespaceId, NoteId, RelationshipId } from "../../shared/ids";
import type { Rect } from "../../shared/geometry";
import type { PlaceableNodeKind } from "../../shared/nodeKinds";
/*
 * Owned by: EditorSurface.
 *
 * Canonical selected editor entities. Consumers interpret this state for their
 * own scenarios, such as style inspection, shortcuts, canvas affordances, or
 * command derivation.
 */
export type SelectionState = {
  readonly classIds: readonly ClassId[];
  readonly relationshipIds: readonly RelationshipId[];
  readonly namespaceIds: readonly NamespaceId[];
  readonly noteIds: readonly NoteId[];
};

/*
 * Owned by: EditorSurface.
 *
 * Pending node-placement tool state. Null means no node placement is active;
 * a value means the next canvas placement creates that node kind.
 */
export type NodePlacementState = PlaceableNodeKind | null;

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
