/**
 * @framework View resize-control props and callback to React Flow NodeResizer props.
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
  // Framework prop and event adaptation
  const onResizeEnd = useCallback<OnResizeEnd>(
    (_event, params) => {
      onResizeEndCallback({ x: params.x, y: params.y, w: params.width, h: params.height });
    },
    [onResizeEndCallback]
  );

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
