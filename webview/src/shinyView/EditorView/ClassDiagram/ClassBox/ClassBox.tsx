/**
 * @role [L+P] Logic plus presentational
 * @logic Resize UI visibility for class boxes.
 * @presents React Flow class-box node.
 */
import type { ReactElement } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, NodeResizer, Position } from "@xyflow/react";
import type { ClassBoxNodeData } from "../reactFlowAdapters";
import MemberTable from "./MemberTable/MemberTable";
import { useClassBoxInteractions } from "./useClassBoxInteractions";
import styles from "./ClassBox.module.css";

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

const CONNECTION_HANDLES: ReadonlyArray<{
  id: string;
  type: "source" | "target";
  position: Position;
}> = [
  { id: "top", type: "source", position: Position.Top },
  { id: "right", type: "source", position: Position.Right },
  { id: "bottom", type: "source", position: Position.Bottom },
  { id: "left", type: "source", position: Position.Left },
  { id: "target-top", type: "target", position: Position.Top },
  { id: "target-right", type: "target", position: Position.Right },
  { id: "target-bottom", type: "target", position: Position.Bottom },
  { id: "target-left", type: "target", position: Position.Left },
];

/**
 * Renders a ReactFlow class-box node with members and connection handles.
 */
export default function ClassBox({
  id,
  data,
  selected,
  dragging,
}: NodeProps<ClassBoxNode>): ReactElement {
  const classBoxView = data.view.view;

  // @job adapt:slice-view
  const fields = classBoxView.members.filter((m) => m.kind === "field");
  const methods = classBoxView.members.filter((m) => m.kind === "method");

  // @job wire:command
  const { onResizeEnd } = useClassBoxInteractions(classBoxView);

  // @job logic:ui-prop
  const isResizeVisible = selected && data.view.isResizeVisible;

  // @job render:style
  const className = [
    styles.classBox,
    selected ? styles.selected : "",
    dragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  // @job render:style
  const dynamicVars = classBoxView.style
    ? ({
        "--class-fill": classBoxView.style.fill,
        "--class-stroke": classBoxView.style.stroke,
        "--class-color": classBoxView.style.color,
      } as React.CSSProperties)
    : undefined;

  // @job render:ui
  return (
    <div className={className} style={dynamicVars} title={classBoxView.classId}>
      <NodeResizer
        nodeId={id}
        isVisible={isResizeVisible}
        minWidth={80}
        minHeight={48}
        handleClassName={styles.resizeHandle}
        lineClassName={styles.resizeLine}
        onResizeEnd={onResizeEnd}
      />
      {/* @job adapt:framework-props */}
      {CONNECTION_HANDLES.map(({ id, type, position }) => (
        <Handle
          key={id}
          className={styles.connectionHandle}
          id={id}
          type={type}
          position={position}
          isConnectable={false}
        />
      ))}
      {/* @job render:ui */}
      <header className={styles.header}>
        {classBoxView.header.stereotype ? (
          <div className={styles.stereotype} title={classBoxView.header.stereotype}>
            &lt;&lt;{classBoxView.header.stereotype}&gt;&gt;
          </div>
        ) : null}
        <div className={styles.className} title={classBoxView.header.label}>
          {classBoxView.header.label}
        </div>
      </header>
      {/* @job adapt:slice-view */}
      <MemberTable fields={fields} methods={methods} selected={selected} />
    </div>
  );
}
