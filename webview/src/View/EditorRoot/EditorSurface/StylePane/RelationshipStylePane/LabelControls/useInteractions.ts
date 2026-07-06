/**
 * @behavior Relationship label command dispatch handlers.
 */

import { useCallback } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../contexts";
import { toRelationshipLabelSetTransaction } from "./transactions";

type Interactions = {
  readonly onLabelCommit: (label: string | null) => void;
};

export function useInteractions(relationshipId: RelationshipId): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onLabelCommit = useCallback(
    (label: string | null) => {
      dispatchTransaction(toRelationshipLabelSetTransaction(relationshipId, label));
    },
    [dispatchTransaction, relationshipId]
  );

  return { onLabelCommit };
}
