/**
 * @behavior Resize grab reporting.
 * @render Four corner resize handles.
 */

import type { PointerEvent, ReactElement } from "react";
import type { Point } from "../../../../shared/geometry";
import styles from "./ResizeAffordance.module.css";

export type ResizeHandle = "nw" | "ne" | "sw" | "se";

type ResizeAffordanceProps = {
  readonly onGrab: (handle: ResizeHandle, point: Point) => void;
};

const HANDLES: readonly ResizeHandle[] = ["nw", "ne", "sw", "se"];

export default function ResizeAffordance({ onGrab }: ResizeAffordanceProps): ReactElement {
  // Event handler props derivation
  const onPointerDown =
    (handle: ResizeHandle) =>
    (event: PointerEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      onGrab(handle, { x: event.clientX, y: event.clientY });
    };

  return (
    <>
      {HANDLES.map((handle) => (
        <button
          key={handle}
          className={`${styles.handle} ${styles[handle]}`}
          type="button"
          aria-label={`Resize from ${toAccessibleCorner(handle)}`}
          onPointerDown={onPointerDown(handle)}
        />
      ))}
    </>
  );
}

function toAccessibleCorner(handle: ResizeHandle): string {
  switch (handle) {
    case "nw":
      return "top left";
    case "ne":
      return "top right";
    case "sw":
      return "bottom left";
    case "se":
      return "bottom right";
  }
}
