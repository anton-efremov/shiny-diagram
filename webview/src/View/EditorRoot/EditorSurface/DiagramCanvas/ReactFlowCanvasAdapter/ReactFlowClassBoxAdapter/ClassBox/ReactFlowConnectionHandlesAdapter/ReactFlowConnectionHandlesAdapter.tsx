/**
 * @framework View connection handle descriptors to React Flow Handle props.
 */

import { Handle, Position } from "@xyflow/react";

const SIDE_TO_POSITION: Record<string, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

type ConnectionHandleDescriptor = {
  readonly id: string;
  readonly direction: "source" | "target";
  readonly side: "top" | "right" | "bottom" | "left";
};

type ReactFlowConnectionHandlesAdapterProps = {
  readonly handles: readonly ConnectionHandleDescriptor[];
  readonly className: string;
  readonly connectSourceClassName: string;
  readonly isConnectSourceEnabled: boolean;
};

export default function ReactFlowConnectionHandlesAdapter({
  handles,
  className,
  connectSourceClassName,
  isConnectSourceEnabled,
}: ReactFlowConnectionHandlesAdapterProps) {
  // Framework prop and event adaptation
  const connectHandleClassName = isConnectSourceEnabled
    ? connectSourceClassName
    : `${connectSourceClassName} ${className}`;

  return (
    <>
      {/* framework-adaptation nesting exception: existing Handle adapter lives under ClassBox. */}
      <Handle
        className={connectHandleClassName}
        id="connect"
        type="source"
        position={Position.Top}
        isConnectable
        isConnectableStart={isConnectSourceEnabled}
        isConnectableEnd
      />
      {handles.map(({ id, direction, side }) => (
        <Handle
          key={id}
          className={className}
          id={id}
          type={direction}
          position={SIDE_TO_POSITION[side]}
          isConnectable={false}
        />
      ))}
    </>
  );
}
