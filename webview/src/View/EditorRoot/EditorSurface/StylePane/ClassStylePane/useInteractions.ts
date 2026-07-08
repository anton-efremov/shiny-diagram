/**
 * @behavior Class header text-block edit transaction dispatch.
 */

import { useCallback } from "react";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../shared/uml";
import { useDispatchTransaction } from "../../../../contexts";
import {
  toClassAnnotationCommitTransaction,
  toClassLabelCommitTransaction,
  toClassNameCommitTransaction,
} from "./transactions";

type Interactions = {
  readonly onNameCommit: (classId: ClassId, name: string) => readonly string[];
  readonly onAnnotationCommit: (
    classId: ClassId,
    annotation: ClassAnnotation | null
  ) => readonly string[];
  readonly onLabelCommit: (classId: ClassId, label: string | null) => readonly string[];
};

export function useInteractions(): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onNameCommit = useCallback(
    (classId: ClassId, name: string) => {
      const result = dispatchTransaction(toClassNameCommitTransaction(classId, name));
      return result.status === "rejected" ? result.errors.map((error) => error.message) : [];
    },
    [dispatchTransaction]
  );

  const onAnnotationCommit = useCallback(
    (classId: ClassId, annotation: ClassAnnotation | null) => {
      const result = dispatchTransaction(toClassAnnotationCommitTransaction(classId, annotation));
      return result.status === "rejected" ? result.errors.map((error) => error.message) : [];
    },
    [dispatchTransaction]
  );

  const onLabelCommit = useCallback(
    (classId: ClassId, label: string | null) => {
      const result = dispatchTransaction(toClassLabelCommitTransaction(classId, label));
      return result.status === "rejected" ? result.errors.map((error) => error.message) : [];
    },
    [dispatchTransaction]
  );

  return { onNameCommit, onAnnotationCommit, onLabelCommit };
}
