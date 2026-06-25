/**
 * @fileoverview ClassBox/MemberTable editor commands.
 * Extracted because MemberTable is an exclusively owned child component.
 */

import type { ClassId, MemberId } from "../../../../../../../../shared/ids";

export type MemberPrefix = "+" | "-" | "#" | "~" | "$" | "*" | "";

export type MemberCommand =
  | {
      readonly type: "class.member.setText";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly text: string;
    }
  | {
      readonly type: "class.member.setPrefix";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly prefix: MemberPrefix;
    };
