/**
 * @behavior Class member text-block transaction derivation.
 */

import type { AttributeId, ClassId, MethodId } from "../../../../../../../../shared/ids";
import type { MemberClassifier, MemberKind } from "../../../../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../../../../commands/editorCommands";
import type { ClassMemberView } from "../../../../../../../views/schema";

export function toMemberCommitTransaction(
  classId: ClassId,
  memberKind: MemberKind,
  memberId: AttributeId | MethodId,
  text: string,
  classifier: MemberClassifier | null
): EditorCommandTransaction {
  return memberKind === "field"
    ? [{ type: "class.attribute.set", attributeId: memberId as AttributeId, text, classifier }]
    : [{ type: "class.method.set", methodId: memberId as MethodId, text, classifier }];
}

export function toMemberDeleteTransaction(
  memberKind: MemberKind,
  memberId: AttributeId | MethodId
): EditorCommandTransaction {
  return memberKind === "field"
    ? [{ type: "class.attribute.delete", attributeId: memberId as AttributeId }]
    : [{ type: "class.method.delete", methodId: memberId as MethodId }];
}

export function toMemberCreateTransaction(
  classId: ClassId,
  memberKind: MemberKind,
  text: string,
  classifier: MemberClassifier | null
): EditorCommandTransaction {
  return memberKind === "field"
    ? [
        {
          type: "class.attribute.create",
          classId,
          text,
          classifier,
          beforeAttributeId: null,
        },
      ]
    : [
        {
          type: "class.method.create",
          classId,
          text,
          classifier,
          beforeMethodId: null,
        },
      ];
}

export function toMemberMoveTransaction(
  classId: ClassId,
  memberKind: MemberKind,
  members: readonly ClassMemberView[],
  draggedMemberId: AttributeId | MethodId,
  dropGap: number
): EditorCommandTransaction {
  const orderedMembers = members.filter((member) => member.kind === memberKind);
  const draggedIndex = orderedMembers.findIndex((member) => member.memberId === draggedMemberId);
  if (draggedIndex === -1) return [];

  const remainingMembers = orderedMembers.filter((member) => member.memberId !== draggedMemberId);
  const beforeMember = remainingMembers[dropGap] ?? null;
  const nextIndex = beforeMember
    ? orderedMembers.findIndex((member) => member.memberId === beforeMember.memberId)
    : orderedMembers.length;
  if (nextIndex === draggedIndex || nextIndex === draggedIndex + 1) return [];

  return memberKind === "field"
    ? [
        {
          type: "class.attribute.move",
          attributeId: draggedMemberId as AttributeId,
          classId,
          beforeAttributeId: (beforeMember?.memberId as AttributeId | undefined) ?? null,
        },
      ]
    : [
        {
          type: "class.method.move",
          methodId: draggedMemberId as MethodId,
          classId,
          beforeMethodId: (beforeMember?.memberId as MethodId | undefined) ?? null,
        },
      ];
}
