/**
 * @role [A] Framework adapter
 * @adapts NodeResizer: translates a resize-control view and a framework-neutral callback to NodeResizer props.
 */
import { useCallback } from "react";
import type { OnResizeEnd } from "@xyflow/react";
import { NodeResizer } from "@xyflow/react";
import type { Rect } from "../../../../../../../../shared/geometry";
import type { ReactFlowNodeResizerAdapterView } from "./views";

type ReactFlowNodeResizerAdapterProps = {
  readonly view: ReactFlowNodeResizerAdapterView;
  readonly onResizeEnd: (rect: Rect) => void;
};

export default function ReactFlowNodeResizerAdapter({
  view,
  onResizeEnd: onResizeEndCallback,
}: ReactFlowNodeResizerAdapterProps) {
  // @job connect:event:normalize
  const onResizeEnd = useCallback<OnResizeEnd>(
    (_event, params) => {
      onResizeEndCallback({ x: params.x, y: params.y, w: params.width, h: params.height });
    },
    [onResizeEndCallback]
  );

  // @job connect:framework:props
  return (
    <NodeResizer
      nodeId={view.nodeId}
      isVisible={view.isVisible}
      minWidth={view.minWidth}
      minHeight={view.minHeight}
      handleClassName={view.handleClassName}
      lineClassName={view.lineClassName}
      onResizeEnd={onResizeEnd}
    />
  );
}
