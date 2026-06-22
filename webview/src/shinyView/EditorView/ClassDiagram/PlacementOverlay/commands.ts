/**
 * @fileoverview Placement overlay editor commands.
 */

import type { Rect } from "../../../../shared/geometry";

export type ClassAddCommand = {
  readonly type: "class.add";
  readonly rect: Rect;
};
