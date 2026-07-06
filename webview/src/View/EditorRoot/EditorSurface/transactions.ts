/**
 * @behavior Relationship creation transaction derivation.
 */

import type { ClassId } from "../../../shared/ids";
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
