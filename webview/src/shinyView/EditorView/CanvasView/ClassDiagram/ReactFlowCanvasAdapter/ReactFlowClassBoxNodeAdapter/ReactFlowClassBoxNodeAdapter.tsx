/**
 * @role [A] Framework adapter
 * @adapts NodeProps: translates React Flow class-box NodeProps into a framework-neutral ClassBox view.
 */
import type { Node, NodeProps } from "@xyflow/react";
import ClassBox from "./ClassBox/ClassBox";
import type { ClassBoxNodeData } from "../reactFlowAdapters";
import { toClassBoxRenderView } from "./reactFlowAdapters";

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

export default function ReactFlowClassBoxNodeAdapter(props: NodeProps<ClassBoxNode>) {
  // @job connect:framework:props
  const classBoxView = toClassBoxRenderView(props);

  // @job connect:child:compose
  return <ClassBox view={classBoxView} />;
}
