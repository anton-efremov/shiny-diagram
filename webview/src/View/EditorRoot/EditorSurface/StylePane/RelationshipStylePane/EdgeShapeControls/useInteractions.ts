/**
 * @behavior Relationship shape control command dispatch handlers.
 */

import { useCallback } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../../../shared/uml";
import { useDispatchTransaction } from "../../../../../contexts";
import { toPredictedRelationshipId } from "../../../../../utils/relationshipIdPrediction";
import type { RelationshipView } from "../../../../../views/schema";
import {
  toLineKindSetTransaction,
  toRelationshipReverseTransaction,
  toSourceEndpointKindSetTransaction,
  toTargetEndpointKindSetTransaction,
} from "./transactions";

type Interactions = {
  readonly onSourceEndpointKindChange: (endpointKind: RelationshipEndpointKind) => void;
  readonly onLineKindChange: (lineKind: RelationshipLineKind) => void;
  readonly onTargetEndpointKindChange: (endpointKind: RelationshipEndpointKind) => void;
  readonly onReverse: () => void;
};

export function useInteractions(
  view: RelationshipView,
  onRelationshipSelect: (relationshipId: RelationshipId) => void
): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onSourceEndpointKindChange = useCallback(
    (endpointKind: RelationshipEndpointKind) => {
      if (endpointKind === view.sourceEndpointKind) return;
      dispatchTransaction(toSourceEndpointKindSetTransaction(view.relationshipId, endpointKind));
    },
    [dispatchTransaction, view.relationshipId, view.sourceEndpointKind]
  );

  const onLineKindChange = useCallback(
    (lineKind: RelationshipLineKind) => {
      if (lineKind === view.lineKind) return;
      dispatchTransaction(toLineKindSetTransaction(view.relationshipId, lineKind));
    },
    [dispatchTransaction, view.lineKind, view.relationshipId]
  );

  const onTargetEndpointKindChange = useCallback(
    (endpointKind: RelationshipEndpointKind) => {
      if (endpointKind === view.targetEndpointKind) return;
      dispatchTransaction(toTargetEndpointKindSetTransaction(view.relationshipId, endpointKind));
    },
    [dispatchTransaction, view.relationshipId, view.targetEndpointKind]
  );

  const onReverse = useCallback(() => {
    const transaction = toRelationshipReverseTransaction(view);
    if (transaction.length === 0) return;
    dispatchTransaction(transaction);
    onRelationshipSelect(
      toPredictedRelationshipId(view.relationshipId, view.targetClassId, view.sourceClassId)
    );
  }, [dispatchTransaction, onRelationshipSelect, view]);

  return {
    onSourceEndpointKindChange,
    onLineKindChange,
    onTargetEndpointKindChange,
    onReverse,
  };
}
