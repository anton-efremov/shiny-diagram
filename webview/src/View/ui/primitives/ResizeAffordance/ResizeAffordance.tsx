/**
 * @behavior Resize grab reporting.
 * @render Eight resize handles and four full-edge hit zones.
 */

import type { CSSProperties, PointerEvent, ReactElement } from "react";
import type { Point } from "../../../../shared/geometry";
import styles from "./ResizeAffordance.module.css";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type ResizeAffordanceProps = {
  readonly centerOffset?: string;
  readonly onGrab: (handle: ResizeHandle, point: Point) => void;
};

const HANDLES: readonly ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const EDGE_HANDLES: readonly Extract<ResizeHandle, "n" | "e" | "s" | "w">[] = ["n", "e", "s", "w"];

export default function ResizeAffordance({
  centerOffset = "3px",
  onGrab,
}: ResizeAffordanceProps): ReactElement {
  // Event handler props derivation
  const onPointerDown =
    (handle: ResizeHandle) =>
    (event: PointerEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      onGrab(handle, { x: event.clientX, y: event.clientY });
    };

  const affordanceStyle = { "--resize-affordance-center-offset": centerOffset } as CSSProperties;

  return (
    <>
      {EDGE_HANDLES.map((handle) => (
        <button
          key={`edge-${handle}`}
          className={`${styles.edge} ${styles[`edge${handle.toUpperCase()}`]}`}
          style={affordanceStyle}
          type="button"
          aria-label={`Resize from ${toAccessiblePosition(handle)} edge`}
          onPointerDown={onPointerDown(handle)}
        />
      ))}
      {HANDLES.map((handle) => (
        <button
          key={handle}
          className={`${styles.handle} ${styles[handle]}`}
          style={affordanceStyle}
          type="button"
          aria-label={`Resize from ${toAccessiblePosition(handle)}`}
          onPointerDown={onPointerDown(handle)}
        />
      ))}
    </>
  );
}

function toAccessiblePosition(handle: ResizeHandle): string {
  switch (handle) {
    case "nw":
      return "top left";
    case "n":
      return "top";
    case "ne":
      return "top right";
    case "e":
      return "right";
    case "sw":
      return "bottom left";
    case "se":
      return "bottom right";
    case "s":
      return "bottom";
    case "w":
      return "left";
  }
}
