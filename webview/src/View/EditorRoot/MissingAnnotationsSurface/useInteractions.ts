/**
 * @behavior Missing annotation generation command dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../contexts";
import { toMissingAnnotationsGenerateTransaction } from "./transactions";
import type { EditorViewModel } from "../../views/schema";

type MissingAnnotationsView = Pick<
  Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
  "missingClassIds" | "diagram"
>;

type Interactions = {
  readonly onGenerate: () => void;
};

type UseInteractionsInput = {
  readonly view: MissingAnnotationsView;
};

export function useInteractions({ view }: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onGenerate = useCallback(() => {
    // Implementing interaction through command transaction
    dispatchTransaction(
      toMissingAnnotationsGenerateTransaction(view.missingClassIds, view.diagram.classes)
    );
  }, [dispatchTransaction, view]);

  return { onGenerate };
}
