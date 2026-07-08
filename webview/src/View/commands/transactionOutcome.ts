/**
@fileoverview Controller-reported identity outcome of one editor command transaction.

`TransactionOutcome` is the synchronous return value of `EditorDispatch`: the
Controller reports, by construction while translating the transaction, which
source identities the transaction renamed or created. View may use it to carry
transient state (e.g. selection) across an ID-changing command; the post-reparse
view push validates it implicitly through existing state reconciliation.

Contract rules:
- Array order equals command order within the transaction.
- `deleted` is deliberately absent: View reconciliation's "selected ID missing →
  clear" rule already covers deletions.
- Rename pairs are independent — no `to` of one pair is the `from` of another.
  This is guaranteed by the transaction limitation that a transaction must not
  target an object by its old ID after an ID-changing command
  (see `editorCommands.ts`).
*/

import type { ClassId, NoteId, RelationshipId, StyleDefId } from "../../shared/ids";

/** Identity changes of one kind reported for one transaction. */
export type IdentityDelta<Id> = {
  readonly renamed: ReadonlyArray<{ readonly from: Id; readonly to: Id }>;
  readonly created: ReadonlyArray<Id>;
};

/** Identity changes of all source-identity kinds reported for one transaction. */
export type TransactionOutcome = {
  readonly classes: IdentityDelta<ClassId>;
  readonly relationships: IdentityDelta<RelationshipId>;
  readonly notes: IdentityDelta<NoteId>;
  readonly styles: IdentityDelta<StyleDefId>;
};

/** Outcome of a transaction with no identity effect. */
export const EMPTY_TRANSACTION_OUTCOME: TransactionOutcome = {
  classes: { renamed: [], created: [] },
  relationships: { renamed: [], created: [] },
  notes: { renamed: [], created: [] },
  styles: { renamed: [], created: [] },
};
