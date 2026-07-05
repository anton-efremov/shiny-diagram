/**
 * @framework React Flow class-box NodeProps to View ClassBox props.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ClassId } from "../../../../../../shared/ids";
import type { ClassView } from "../../../../../views/schema";
import ClassBox from "./ClassBox/ClassBox";

type ClassBoxNodeData = {
  readonly view: ClassView;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly selectedClassIds: readonly ClassId[];
  readonly onClassSelect: (classIds: readonly ClassId[]) => void;
};

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

export default function ReactFlowClassBoxNodeAdapter(props: NodeProps<ClassBoxNode>) {
  // Framework prop and event adaptation
  return (
    <ClassBox
      view={props.data.view}
      isSelected={props.data.isSelected}
      isDragging={props.dragging ?? false}
      isResizeVisible={props.data.isResizeVisible}
      selectedClassIds={props.data.selectedClassIds}
      onClassSelect={props.data.onClassSelect}
    />
  );
}
