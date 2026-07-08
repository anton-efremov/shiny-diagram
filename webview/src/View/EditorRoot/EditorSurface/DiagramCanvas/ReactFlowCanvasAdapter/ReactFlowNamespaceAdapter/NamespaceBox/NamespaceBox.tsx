/**
 * @behavior Namespace selection event routing.
 * @render Namespace hull box.
 */

import type { CSSProperties, MouseEvent, PointerEvent, ReactElement } from "react";
import type { NamespaceId } from "../../../../../../../shared/ids";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { NamespaceView } from "../../../../../../views/schema";
import {
  NAMESPACE_LABEL_BAND_HEIGHT,
  NAMESPACE_LABEL_FONT_SIZE,
  NAMESPACE_LABEL_FONT_WEIGHT,
  NAMESPACE_LABEL_BAND_FILL_MIX_PERCENT,
  NAMESPACE_LABEL_LINE_HEIGHT,
  NAMESPACE_LABEL_PADDING_X,
  NAMESPACE_LABEL_PADDING_Y,
  NAMESPACE_DEFAULT_STROKE_WIDTH,
  NAMESPACE_SELECTION_RING_WIDTH,
  NAMESPACE_DEFAULT_FILL,
  NAMESPACE_DEFAULT_STROKE,
  NAMESPACE_PENDING_STROKE,
  NAMESPACE_PENDING_OUTLINE_OFFSET,
  NAMESPACE_PENDING_STROKE_WIDTH,
  NAMESPACE_RESIZE_HANDLE_OFFSET,
  NAMESPACE_RESIZE_HANDLE_SIZE,
} from "../../../../../../config/editorUiConfig";
import styles from "./NamespaceBox.module.css";

type NamespaceResizeHandle = "nw" | "ne" | "sw" | "se";

type NamespaceBoxProps = {
  readonly view: NamespaceView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isPendingMember: boolean;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onNamespaceResizeHandlePress: (
    namespaceId: NamespaceId,
    bounds: Rect,
    handle: NamespaceResizeHandle,
    screenPoint: Point
  ) => void;
};

export default function NamespaceBox({
  view,
  bounds,
  isSelected,
  isPendingMember,
  onNamespaceSelect,
  onNamespaceResizeHandlePress,
}: NamespaceBoxProps): ReactElement {
  // UI props derivation
  const className = [
    styles.namespaceBox,
    isSelected ? styles.selected : "",
    isPendingMember ? styles.pendingMember : "",
  ]
    .filter(Boolean)
    .join(" ");
  const dynamicVars = {
    "--namespace-label-band-height": `${NAMESPACE_LABEL_BAND_HEIGHT}px`,
    "--namespace-label-font-size": `${NAMESPACE_LABEL_FONT_SIZE}px`,
    "--namespace-label-font-weight": NAMESPACE_LABEL_FONT_WEIGHT,
    "--namespace-label-line-height": `${NAMESPACE_LABEL_LINE_HEIGHT}px`,
    "--namespace-label-padding-x": `${NAMESPACE_LABEL_PADDING_X}px`,
    "--namespace-label-padding-y": `${NAMESPACE_LABEL_PADDING_Y}px`,
    "--namespace-label-band-fill-mix": `${NAMESPACE_LABEL_BAND_FILL_MIX_PERCENT}%`,
    "--namespace-fill": view.style?.fill ?? NAMESPACE_DEFAULT_FILL,
    "--namespace-stroke": view.style?.stroke ?? NAMESPACE_DEFAULT_STROKE,
    "--namespace-stroke-width": view.style?.strokeWidth ?? `${NAMESPACE_DEFAULT_STROKE_WIDTH}px`,
    "--namespace-selection-ring-width": `${NAMESPACE_SELECTION_RING_WIDTH}px`,
    "--namespace-stroke-dasharray": view.style?.strokeDasharray ?? undefined,
    "--namespace-color": view.style?.color ?? undefined,
    "--namespace-pending-stroke": NAMESPACE_PENDING_STROKE,
    "--namespace-pending-stroke-width": `${NAMESPACE_PENDING_STROKE_WIDTH}px`,
    "--namespace-pending-outline-offset": `${NAMESPACE_PENDING_OUTLINE_OFFSET}px`,
    "--namespace-resize-handle-size": `${NAMESPACE_RESIZE_HANDLE_SIZE}px`,
    "--namespace-resize-handle-offset": `${NAMESPACE_RESIZE_HANDLE_OFFSET}px`,
  } as CSSProperties;

  // Event handler props derivation
  const onNamespaceClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onNamespaceSelect(view.namespaceId);
  };
  const onNamespacePress = () => {
    onNamespaceSelect(view.namespaceId);
  };
  const onResizeHandlePointerDown =
    (handle: NamespaceResizeHandle) => (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onNamespaceResizeHandlePress(view.namespaceId, bounds, handle, {
        x: event.clientX,
        y: event.clientY,
      });
    };

  return (
    <div
      className={className}
      style={dynamicVars}
      title={view.namespaceId}
      onMouseDown={onNamespacePress}
      onClick={onNamespaceClick}
    >
      <div className={styles.labelBand}>{view.label}</div>
      {isSelected ? (
        <>
          <button
            className={`${styles.resizeHandle} ${styles.nw}`}
            aria-label="Resize namespace from top left"
            onPointerDown={onResizeHandlePointerDown("nw")}
          />
          <button
            className={`${styles.resizeHandle} ${styles.ne}`}
            aria-label="Resize namespace from top right"
            onPointerDown={onResizeHandlePointerDown("ne")}
          />
          <button
            className={`${styles.resizeHandle} ${styles.sw}`}
            aria-label="Resize namespace from bottom left"
            onPointerDown={onResizeHandlePointerDown("sw")}
          />
          <button
            className={`${styles.resizeHandle} ${styles.se}`}
            aria-label="Resize namespace from bottom right"
            onPointerDown={onResizeHandlePointerDown("se")}
          />
        </>
      ) : null}
    </div>
  );
}
