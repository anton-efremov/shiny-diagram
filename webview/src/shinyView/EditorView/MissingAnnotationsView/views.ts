/**
 * @fileoverview Missing-annotations editor-state interface render contract.
 */

import type { ClassId } from "../../../shared/ids";

export type MissingAnnotationsViewModel = {
  readonly missingIds: readonly ClassId[];
  readonly classes: readonly MissingAnnotationClassView[];
};

export type MissingAnnotationClassView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly h: number;
};
