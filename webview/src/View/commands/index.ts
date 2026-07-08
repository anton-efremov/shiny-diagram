/**
 * @fileoverview Public command contract of the View layer.
 */

export type {
  EditorCommand,
  EditorCommandOf,
  EditorCommandTransaction,
  EditorDispatch,
  TransactionError,
  TransactionResult,
} from "./editorCommands";
export type { IdentityDelta, TransactionOutcome } from "./transactionOutcome";
export { EMPTY_TRANSACTION_OUTCOME } from "./transactionOutcome";
