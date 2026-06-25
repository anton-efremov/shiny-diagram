/**
 * @role [A] Framework adapter
 * @adapts Handle: translates editor-facing connection handle descriptors to React Flow Handle props.
 */
import { Handle, Position } from "@xyflow/react";
import type { ConnectionHandleDescriptor } from "./views";

const SIDE_TO_POSITION: Record<string, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

type ReactFlowConnectionHandlesAdapterProps = {
  readonly handles: readonly ConnectionHandleDescriptor[];
  readonly className: string;
};

export default function ReactFlowConnectionHandlesAdapter({
  handles,
  className,
}: ReactFlowConnectionHandlesAdapterProps) {
  // @job connect:framework:props
  return (
    <>
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
