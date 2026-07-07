/**
 * @behavior Relationship shape edit transaction derivation.
 */

import type { RelationshipId } from "../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { RelationshipView } from "../../../../../views/schema";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../../../shared/uml";

export function toSourceEndpointKindSetTransaction(
  relationshipId: RelationshipId,
  endpointKind: RelationshipEndpointKind
): EditorCommandTransaction {
  return [{ type: "relationship.source.endpointKind.set", relationshipId, endpointKind }];
}

export function toTargetEndpointKindSetTransaction(
  relationshipId: RelationshipId,
  endpointKind: RelationshipEndpointKind
): EditorCommandTransaction {
  return [{ type: "relationship.target.endpointKind.set", relationshipId, endpointKind }];
}

export function toLineKindSetTransaction(
  relationshipId: RelationshipId,
  lineKind: RelationshipLineKind
): EditorCommandTransaction {
  return [{ type: "relationship.lineKind.set", relationshipId, lineKind }];
}

export function toRelationshipReverseTransaction(view: RelationshipView): EditorCommandTransaction {
  return [
    view.sourceClassId === view.targetClassId
      ? null
      : {
          type: "relationship.source.class.set" as const,
          relationshipId: view.relationshipId,
          classId: view.targetClassId,
        },
    view.sourceClassId === view.targetClassId
      ? null
      : {
          type: "relationship.target.class.set" as const,
          relationshipId: view.relationshipId,
          classId: view.sourceClassId,
        },
    (view.sourceMultiplicity ?? null) === (view.targetMultiplicity ?? null)
      ? null
      : {
          type: "relationship.source.multiplicity.set" as const,
          relationshipId: view.relationshipId,
          multiplicity: view.targetMultiplicity ?? null,
        },
    (view.sourceMultiplicity ?? null) === (view.targetMultiplicity ?? null)
      ? null
      : {
          type: "relationship.target.multiplicity.set" as const,
          relationshipId: view.relationshipId,
          multiplicity: view.sourceMultiplicity ?? null,
        },
  ].filter((command) => command !== null);
}
