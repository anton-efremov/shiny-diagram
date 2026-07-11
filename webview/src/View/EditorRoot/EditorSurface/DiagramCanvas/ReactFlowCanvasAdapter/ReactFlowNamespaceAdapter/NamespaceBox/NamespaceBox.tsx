/**
 * @behavior Namespace selection event routing.
 * @render Namespace hull box.
 */

import type { CSSProperties, MouseEvent, ReactElement } from "react";
import type { NamespaceId } from "../../../../../../../shared/ids";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { NamespaceView } from "../../../../../../views/schema";
import BoxOutline from "../../../../../../ui/primitives/BoxOutline/BoxOutline";
import ResizeAffordance from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import type { ResizeHandle } from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
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
} from "../../../../../../config/editorUiConfig";
import styles from "./NamespaceBox.module.css";

type NamespaceBoxProps = {
  readonly view: NamespaceView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isPendingMember: boolean;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onNamespaceResizeHandlePress: (
    namespaceId: NamespaceId,
    bounds: Rect,
    handle: ResizeHandle,
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
  const className = [styles.namespaceBox].filter(Boolean).join(" ");
  const strokeWidth = toCssLength(
    view.style?.strokeWidth ?? String(NAMESPACE_DEFAULT_STROKE_WIDTH)
  );
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
    "--namespace-stroke-width": strokeWidth,
    "--namespace-selection-ring-width": `${NAMESPACE_SELECTION_RING_WIDTH}px`,
    "--namespace-stroke-dasharray": view.style?.strokeDasharray ?? undefined,
    "--namespace-color": view.style?.color ?? undefined,
    "--namespace-pending-stroke": NAMESPACE_PENDING_STROKE,
    "--namespace-pending-stroke-width": `${NAMESPACE_PENDING_STROKE_WIDTH}px`,
    "--namespace-pending-outline-offset": `${NAMESPACE_PENDING_OUTLINE_OFFSET}px`,
    "--shiny-box-selection-center-offset": `calc(${strokeWidth} + 2px)`,
  } as CSSProperties;

  // Event handler props derivation
  const onNamespaceClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onNamespaceSelect(view.namespaceId);
  };
  const onNamespacePress = () => {
    onNamespaceSelect(view.namespaceId);
  };
  const onResizeGrab = (handle: ResizeHandle, point: Point) => {
    onNamespaceResizeHandlePress(view.namespaceId, bounds, handle, point);
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
      {isPendingMember ? <BoxOutline variant="pending" /> : null}
      {isSelected ? <BoxOutline variant="selected" /> : <BoxOutline variant="hover" />}
      {isSelected ? (
        <div className="nodrag nopan">
          <ResizeAffordance onGrab={onResizeGrab} />
        </div>
      ) : null}
    </div>
  );
}

function toCssLength(value: string): string {
  return /^-?(?:\d+|\d*\.\d+)$/.test(value.trim()) ? `${value.trim()}px` : value;
}
