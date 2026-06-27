/**
 * @role [A] Framework adapter
 * @adapts NodeProps: translates React Flow class-box NodeProps into a framework-neutral ClassBox view.
 */
import type { Node, NodeProps } from "@xyflow/react";
import ClassBox from "./ClassBox/ClassBox";
import type { ClassBoxNodeData } from "../reactFlowAdapters";

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

export default function ReactFlowClassBoxNodeAdapter(props: NodeProps<ClassBoxNode>) {
  // @job connect:child:compose
  return (
    <ClassBox
      view={props.data.view}
      isSelected={props.selected ?? false}
      isDragging={props.dragging ?? false}
      isResizeVisible={(props.selected ?? false) && props.data.isResizeVisible}
    />
  );
}
