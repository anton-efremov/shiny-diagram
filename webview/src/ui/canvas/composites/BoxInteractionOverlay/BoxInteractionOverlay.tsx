/**
 * Box interaction overlay combining outline, halo, and resize affordances.
 *
 * Centers outline and resize geometry with `centerOffset`. A supplied `haloTint`
 * paints the halo at `haloStacking`; resize targets use `affordanceStacking` and
 * report handle and viewport point through `onResizeGrab` without propagating
 * their pointer press.
 *
 * Options:
 * - `selected` — on keeps the selection outline visible; off shows it only on
 *   parent hover
 * - `pending` — on adds a pending placement outline
 * - `resizeVisible` — on renders corner, midpoint, and full-edge resize targets
 * - `haloTone` — absent renders no default halo unless `haloTint` is supplied;
 *   `canvas` uses canvas ground and `faint` uses a translucent wash when tint is
 *   absent
 */

import type { ReactElement } from "react";
import type { Point } from "../../../../shared/geometry";
import BoxOutline from "../../primitives/BoxOutline/BoxOutline";
import HaloRing from "../../primitives/HaloRing/HaloRing";
import ResizeAffordance from "../../primitives/ResizeAffordance/ResizeAffordance";
import type { ResizeHandle } from "../../primitives/ResizeAffordance/ResizeAffordance";

export type { ResizeHandle };

type BoxInteractionOverlayProps = {
  readonly selected: boolean;
  readonly pending: boolean;
  readonly resizeVisible: boolean;
  readonly centerOffset?: string;
  readonly haloTint?: string;
  readonly haloTone?: "canvas" | "faint";
  readonly haloStacking: number;
  readonly affordanceStacking: number;
  readonly onResizeGrab: (handle: ResizeHandle, point: Point) => void;
};

export default function BoxInteractionOverlay({
  selected,
  pending,
  resizeVisible,
  centerOffset,
  haloTint,
  haloTone,
  haloStacking,
  affordanceStacking,
  onResizeGrab,
}: BoxInteractionOverlayProps): ReactElement {
  return (
    <>
      {haloTint || haloTone ? (
        <HaloRing tint={haloTint} tone={haloTone} stacking={haloStacking} />
      ) : null}
      {pending ? <BoxOutline variant="pending" centerOffset={centerOffset} /> : null}
      <BoxOutline variant={selected ? "selected" : "hover"} centerOffset={centerOffset} />
      {resizeVisible ? (
        <div
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ResizeAffordance
            centerOffset={centerOffset}
            stacking={affordanceStacking}
            onGrab={onResizeGrab}
          />
        </div>
      ) : null}
    </>
  );
}
