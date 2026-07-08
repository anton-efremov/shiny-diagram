/**
 * @behavior Class member text-block transaction derivation.
 */

import type { AttributeId, ClassId, MethodId } from "../../../../../../../../shared/ids";
import type { MemberClassifier, MemberKind } from "../../../../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../../../../commands/editorCommands";

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
