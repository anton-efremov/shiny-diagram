/**
 * @role [A] Framework adapter
 * @adapts NodeResizer: translates a resize-control view and a framework-neutral callback to NodeResizer props.
 */
import { useCallback } from "react";
import type { OnResizeEnd } from "@xyflow/react";
import { NodeResizer } from "@xyflow/react";
import type { Rect } from "../../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../../shared/ids";

type ReactFlowNodeResizerAdapterProps = {
  readonly nodeId: ClassId;
  readonly isVisible: boolean;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly handleClassName: string;
  readonly lineClassName: string;
  readonly onResizeEnd: (rect: Rect) => void;
};

export default function ReactFlowNodeResizerAdapter({
  nodeId,
  isVisible,
  minWidth,
  minHeight,
  handleClassName,
  lineClassName,
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
      nodeId={nodeId}
      isVisible={isVisible}
      minWidth={minWidth}
      minHeight={minHeight}
      handleClassName={handleClassName}
      lineClassName={lineClassName}
      onResizeEnd={onResizeEnd}
    />
  );
}
