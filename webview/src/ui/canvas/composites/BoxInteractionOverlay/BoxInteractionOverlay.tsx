/**
 * @behavior Reports resize grabs while assembling optional box interaction dressing.
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
