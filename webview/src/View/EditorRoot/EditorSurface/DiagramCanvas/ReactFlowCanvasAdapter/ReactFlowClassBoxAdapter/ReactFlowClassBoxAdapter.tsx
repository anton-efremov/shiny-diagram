/**
 * @framework React Flow class-box NodeProps to View ClassBox props.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ReactElement } from "react";
import type { Point, Rect } from "../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../shared/ids";
import type { EditingState } from "../../../../../state/editorStates";
import type { BaseStyleView, ClassView } from "../../../../../views/schema";
import type { NamespaceResizeHandle } from "../frameworkAdapters";
import ClassBox from "./ClassBox/ClassBox";

type ClassBoxNodeData = {
  readonly view: ClassView;
  readonly baseStyle: BaseStyleView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly isConnectSourceEnabled: boolean;
  readonly isPendingMember: boolean;
  readonly haloColor: string | null;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassResizeHandlePress: (
    classId: ClassId,
    bounds: Rect,
    handle: NamespaceResizeHandle,
    screenPoint: Point
  ) => void;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

type ClassBoxNode = Node<ClassBoxNodeData, "classBox">;

export default function ReactFlowClassBoxNodeAdapter(props: NodeProps<ClassBoxNode>): ReactElement {
  // Framework prop and event adaptation
  return (
    <ClassBox
      view={props.data.view}
      baseStyle={props.data.baseStyle}
      bounds={props.data.bounds}
      isSelected={props.data.isSelected}
      isDragging={props.dragging ?? false}
      isResizeVisible={props.data.isResizeVisible}
      isConnectSourceEnabled={props.data.isConnectSourceEnabled}
      isPendingMember={props.data.isPendingMember}
      haloColor={props.data.haloColor}
      onClassSelect={props.data.onClassSelect}
      onClassResizeHandlePress={props.data.onClassResizeHandlePress}
      editingState={props.data.editingState}
      onTextBlockEditStart={props.data.onTextBlockEditStart}
      onTextBlockEditCancel={props.data.onTextBlockEditCancel}
    />
  );
}
