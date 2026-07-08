/**
 * @framework React Flow class-box NodeProps to View ClassBox props.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ClassId } from "../../../../../../shared/ids";
import type { EditingState } from "../../../../../state/editorStates";
import type { ClassView } from "../../../../../views/schema";
import ClassBox from "./ClassBox/ClassBox";

type ClassBoxNodeData = {
  readonly view: ClassView;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly isConnectSourceEnabled: boolean;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
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
      isConnectSourceEnabled={props.data.isConnectSourceEnabled}
      onClassSelect={props.data.onClassSelect}
      editingState={props.data.editingState}
      onTextBlockEditStart={props.data.onTextBlockEditStart}
      onTextBlockEditCancel={props.data.onTextBlockEditCancel}
    />
  );
}
