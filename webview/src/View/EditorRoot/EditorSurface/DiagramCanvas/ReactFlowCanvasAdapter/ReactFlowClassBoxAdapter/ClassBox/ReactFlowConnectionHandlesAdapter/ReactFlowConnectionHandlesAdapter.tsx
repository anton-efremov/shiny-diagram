/**
 * @framework View connection handle descriptors to React Flow Handle props.
 */

import type { CSSProperties } from "react";
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
  readonly isConnectSourceEnabled: boolean;
};

const HIDDEN_HANDLE_STYLE: CSSProperties = {
  width: 1,
  height: 1,
  border: 0,
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
};

const CONNECT_HANDLE_STYLE: CSSProperties = {
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  transform: "none",
  borderRadius: 0,
  border: 0,
  background: "transparent",
  opacity: 0,
};

export default function ReactFlowConnectionHandlesAdapter({
  handles,
  isConnectSourceEnabled,
}: ReactFlowConnectionHandlesAdapterProps) {
  return (
    <>
      {/* framework-adaptation nesting exception: existing Handle adapter lives under ClassBox. */}
      <Handle
        style={isConnectSourceEnabled ? CONNECT_HANDLE_STYLE : HIDDEN_HANDLE_STYLE}
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
          style={HIDDEN_HANDLE_STYLE}
          id={id}
          type={direction}
          position={SIDE_TO_POSITION[side]}
          isConnectable={false}
        />
      ))}
    </>
  );
}
