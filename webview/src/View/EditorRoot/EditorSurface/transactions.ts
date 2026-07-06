/**
 * @behavior Relationship creation and reconnect transaction derivation.
 */

import type { ClassId, RelationshipId } from "../../../shared/ids";
import type { EditorCommandTransaction } from "../../commands/editorCommands";
import type { RelationshipSeed } from "../../state/editorStates";

export function toRelationshipCreateTransaction(
  seed: RelationshipSeed,
  sourceClassId: ClassId,
  targetClassId: ClassId
): EditorCommandTransaction {
  return [
    {
      type: "relationship.create",
      source: {
        classId: sourceClassId,
        multiplicity: seed.sourceMultiplicity,
        endpointKind: seed.sourceEndpointKind,
      },
      target: {
        classId: targetClassId,
        multiplicity: seed.targetMultiplicity,
        endpointKind: seed.targetEndpointKind,
      },
      lineKind: seed.lineKind,
      label: seed.label,
    },
  ];
}

export function toRelationshipReconnectTransaction(
  relationshipId: RelationshipId,
  end: "source" | "target",
  newClassId: ClassId
): EditorCommandTransaction {
  return [
    end === "source"
      ? { type: "relationship.source.class.set", relationshipId, classId: newClassId }
      : { type: "relationship.target.class.set", relationshipId, classId: newClassId },
  ];
}
