/**
 * @behavior Class member edit, create, and delete semantic handlers.
 * @state EditingState updates requested after committed or cancelled member edits.
 */

import { useCallback } from "react";
import type { AttributeId, ClassId, MethodId } from "../../../../../../../../shared/ids";
import type { MemberClassifier, MemberKind } from "../../../../../../../../shared/uml";
import { useDispatchTransaction } from "../../../../../../../contexts";
import {
  toMemberCommitTransaction,
  toMemberCreateTransaction,
  toMemberDeleteTransaction,
} from "./transactions";

type Interactions = {
  readonly onMemberCommit: (
    memberKind: MemberKind,
    memberId: AttributeId | MethodId,
    text: string,
    classifier: MemberClassifier | null
  ) => readonly string[];
  readonly onMemberDelete: (
    memberKind: MemberKind,
    memberId: AttributeId | MethodId
  ) => readonly string[];
  readonly onMemberCreate: (
    memberKind: MemberKind,
    text: string,
    classifier: MemberClassifier | null
  ) => readonly string[];
};

export function useInteractions(classId: ClassId, onTextBlockEditCancel: () => void): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onMemberCommit = useCallback(
    (
      memberKind: MemberKind,
      memberId: AttributeId | MethodId,
      text: string,
      classifier: MemberClassifier | null
    ) => {
      const result = dispatchTransaction(
        toMemberCommitTransaction(classId, memberKind, memberId, text, classifier)
      );
      if (result.status === "rejected") return result.errors.map((error) => error.message);
      onTextBlockEditCancel();
      return [];
    },
    [classId, dispatchTransaction, onTextBlockEditCancel]
  );

  const onMemberDelete = useCallback(
    (memberKind: MemberKind, memberId: AttributeId | MethodId) => {
      const result = dispatchTransaction(toMemberDeleteTransaction(memberKind, memberId));
      if (result.status === "rejected") return result.errors.map((error) => error.message);
      onTextBlockEditCancel();
      return [];
    },
    [dispatchTransaction, onTextBlockEditCancel]
  );

  const onMemberCreate = useCallback(
    (memberKind: MemberKind, text: string, classifier: MemberClassifier | null) => {
      const result = dispatchTransaction(
        toMemberCreateTransaction(classId, memberKind, text, classifier)
      );
      if (result.status === "rejected") return result.errors.map((error) => error.message);
      onTextBlockEditCancel();
      return [];
    },
    [classId, dispatchTransaction, onTextBlockEditCancel]
  );

  return { onMemberCommit, onMemberDelete, onMemberCreate };
}
