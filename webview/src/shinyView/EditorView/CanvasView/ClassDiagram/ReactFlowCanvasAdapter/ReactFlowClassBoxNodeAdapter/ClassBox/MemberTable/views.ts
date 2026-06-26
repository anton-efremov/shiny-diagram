/**
 * @fileoverview ClassBox/MemberTable render contract.
 * Extracted because MemberTable is an exclusively owned child component.
 */

import type { MemberId } from "../../../../../../../../shared/ids";

export type MemberRowView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

export type MemberTableView = {
  readonly fields: readonly MemberRowView[];
  readonly methods: readonly MemberRowView[];
  readonly isSelected: boolean;
};
