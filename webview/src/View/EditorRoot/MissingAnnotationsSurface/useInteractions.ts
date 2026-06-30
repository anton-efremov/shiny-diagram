/**
 * @logic Missing annotation generation command dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../contexts";
import { toMissingAnnotationTransaction } from "./transactions";
import type { EditorViewModel } from "../../views/schema";

type Interactions = {
  onGenerate: () => void;
};

export function useInteractions({
  view,
}: {
  view: Extract<EditorViewModel, { readonly status: "missingAnnotations" }>;
}): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onGenerate = useCallback(() => {
    dispatchTransaction(toMissingAnnotationTransaction(view));
  }, [dispatchTransaction, view]);

  return { onGenerate };
}
