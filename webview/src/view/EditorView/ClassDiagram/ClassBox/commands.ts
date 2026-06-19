/**
 * @fileoverview Editor commands owned by class-box rendering and content.
 */

import type { Rect } from "../../../../shared/geometry";
import type { ClassId } from "../../../../shared/ids";
import type { MemberCommand } from "./MemberTable/commands";

export type ClassBoxCommand =
  | { readonly type: "class.move"; readonly classId: ClassId; readonly rect: Rect }
  | { readonly type: "class.resize"; readonly classId: ClassId; readonly rect: Rect };

export type ClassHeaderCommand = {
  readonly type: "class.header.setLabel";
  readonly classId: ClassId;
  readonly label: string;
};

export type ClassContentCommand = ClassHeaderCommand | MemberCommand;
