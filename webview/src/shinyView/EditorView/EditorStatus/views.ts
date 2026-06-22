/**
 * @fileoverview Render state for Shiny editor status.
 */

import type { ClassId } from "../../../shared/ids";

export type EditorStatusView =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | { readonly status: "missingAnnotations"; readonly missingIds: readonly ClassId[] };
