/**
 * @fileoverview Note spatial vocabulary shared by View command contracts and Controller graph model.
 */

import type { AttachmentSide, Point, Size } from "./geometry";
import type { ClassId } from "./ids";

export type FreeNoteSpatial = {
  readonly kind: "free";
  readonly position: Point;
  readonly size: Size;
};

export type AttachedNoteSpatial = {
  readonly kind: "attached";
  readonly classId: ClassId;
  readonly side: AttachmentSide;
  readonly offset: number;
  readonly distance: number;
  readonly size: Size;
};

export type NoteSpatial = FreeNoteSpatial | AttachedNoteSpatial;
