/**
 * @fileoverview Render state for editor status shown by the application header.
 */

import type { ClassId } from "../../../shared/ids";

export type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | { readonly status: "missingAnnotations"; readonly missingIds: readonly ClassId[] };
