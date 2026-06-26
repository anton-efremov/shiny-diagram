/**
 * @fileoverview Missing-annotations editor-state interface render contract.
 */

import type { ClassId } from "../../../shared/ids";
import type { ElementViews } from "../views";

export type MissingAnnotationsViewModel = {
  readonly missingIds: readonly ClassId[];
  readonly elements: ElementViews;
};
