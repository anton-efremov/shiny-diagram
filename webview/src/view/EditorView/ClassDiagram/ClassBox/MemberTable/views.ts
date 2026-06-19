/**
 * @fileoverview Render contract for class-member rows.
 */

import type { MemberId } from "../../../../../shared/ids";

/**
 * Preserves the field/method divider in ClassBox rendering.
 */
export type ClassBoxMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};
