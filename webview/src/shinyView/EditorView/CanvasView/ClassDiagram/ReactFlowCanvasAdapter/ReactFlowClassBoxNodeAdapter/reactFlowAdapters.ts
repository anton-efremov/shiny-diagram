/**
 * @fileoverview ReactFlowClassBoxNodeAdapter framework projection helpers.
 * Translates React Flow NodeProps into a framework-neutral ClassBox view.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ClassBoxNodeData } from "../reactFlowAdapters";
import type { ClassBoxRenderView } from "./ClassBox/views";

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

// @job connect:framework:props
export function toClassBoxRenderView(props: NodeProps<ClassBoxNode>): ClassBoxRenderView {
  return {
    classId: props.data.classId,
    header: props.data.header,
    members: props.data.members,
    style: props.data.style,
    isSelected: props.selected ?? false,
    isDragging: props.dragging ?? false,
    isResizeVisible: (props.selected ?? false) && props.data.isResizeVisible,
  };
}
