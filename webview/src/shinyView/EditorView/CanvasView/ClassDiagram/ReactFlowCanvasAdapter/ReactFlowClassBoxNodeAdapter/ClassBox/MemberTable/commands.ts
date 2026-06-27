/**
 * @fileoverview MemberTable editor command transaction derivation.
 */

import type { ClassId, MemberId } from "../../../../../../../../shared/ids";
import type { MemberPrefix } from "../../../../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../../../../commands/editorCommands";

// @job logic:command:derive
export function toMemberTextSetTransaction({
  classId,
  memberId,
  text,
}: {
  readonly classId: ClassId;
  readonly memberId: MemberId;
  readonly text: string;
}): EditorCommandTransaction {
  return [{ type: "class.member.text.set", classId, memberId, text }];
}

// @job logic:command:derive
export function toMemberPrefixSetTransaction({
  classId,
  memberId,
  prefix,
}: {
  readonly classId: ClassId;
  readonly memberId: MemberId;
  readonly prefix: MemberPrefix | null;
}): EditorCommandTransaction {
  return [{ type: "class.member.prefix.set", classId, memberId, prefix }];
}
