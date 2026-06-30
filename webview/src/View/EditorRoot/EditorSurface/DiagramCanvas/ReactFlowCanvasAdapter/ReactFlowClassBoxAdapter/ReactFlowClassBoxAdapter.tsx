/**
 * @framework React Flow class-box NodeProps to View ClassBox props.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ClassView } from "../../../../../views/schema";
import ClassBox from "./ClassBox/ClassBox";

type ClassBoxNodeData = {
  readonly view: ClassView;
  readonly isResizeVisible: boolean;
};

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

export default function ReactFlowClassBoxNodeAdapter(props: NodeProps<ClassBoxNode>) {
  // Framework prop and event adaptation
  return (
    <ClassBox
      view={props.data.view}
      isSelected={props.selected ?? false}
      isDragging={props.dragging ?? false}
      isResizeVisible={(props.selected ?? false) && props.data.isResizeVisible}
    />
  );
}
