/**
 * @behavior Relationship multiplicity command dispatch handlers.
 */

import { useCallback } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../contexts";
import { toRelationshipMultiplicitySetTransaction } from "./transactions";

type Interactions = {
  readonly onMultiplicityCommit: (side: "source" | "target", multiplicity: string | null) => void;
};

export function useInteractions(relationshipId: RelationshipId): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onMultiplicityCommit = useCallback(
    (side: "source" | "target", multiplicity: string | null) => {
      dispatchTransaction(
        toRelationshipMultiplicitySetTransaction(relationshipId, side, multiplicity)
      );
    },
    [dispatchTransaction, relationshipId]
  );

  return { onMultiplicityCommit };
}
