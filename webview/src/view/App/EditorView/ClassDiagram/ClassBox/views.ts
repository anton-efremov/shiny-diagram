/**
 * @fileoverview Render contract for class-box nodes.
 */

import type { ClassId } from "../../../../../shared/ids";
import type { ClassBoxMemberView } from "./MemberTable/views";

/**
 * Exposes the classDef name so StylePane can display the applied style.
 */
export type ClassBoxView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
};
