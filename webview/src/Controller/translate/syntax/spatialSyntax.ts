/**
 * @fileoverview Spells the Shiny @spatial annotation line.
 */

import type { Point, Size, SpatialAttachment } from "../../../shared/geometry";
import type { ClassId } from "../../../shared/ids";
import { spellIdentity } from "../../model/identitySpelling";

export function composeSpatialAnnotation(
  targetId: ClassId,
  spatial: SpatialAttachment | { readonly position: Point; readonly size: Size }
): string {
  const x = Math.round(spatial.position.x);
  const y = Math.round(spatial.position.y);
  return `%% @spatial:${spellIdentity(targetId)} x=${x} y=${y} w=${spatial.size.width} h=${
    spatial.size.height
  }`;
}
