/**
 * @framework React Flow namespace NodeProps to View NamespaceBox props.
 */

import type { Node, NodeProps } from "@xyflow/react";
import type { ReactElement } from "react";
import type { NamespaceId } from "../../../../../../shared/ids";
import type { Point, Rect } from "../../../../../../shared/geometry";
import type { NamespaceView } from "../../../../../views/schema";
import type { EditingState } from "../../../../../state/editorStates";
import type { TransactionResult } from "../../../../../commands/editorCommands";
import type { NamespaceResizeHandle } from "../frameworkAdapters";
import NamespaceBox from "./NamespaceBox/NamespaceBox";

type NamespaceNodeData = {
  readonly view: NamespaceView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isPendingMember: boolean;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onNamespaceResizeHandlePress: (
    namespaceId: NamespaceId,
    bounds: Rect,
    handle: NamespaceResizeHandle,
    screenPoint: Point
  ) => void;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

type NamespaceNode = Node<NamespaceNodeData, "namespaceBox">;

export default function ReactFlowNamespaceAdapter(props: NodeProps<NamespaceNode>): ReactElement {
  // Framework prop and event adaptation
  return (
    <NamespaceBox
      view={props.data.view}
      isSelected={props.data.isSelected}
      isPendingMember={props.data.isPendingMember}
      bounds={props.data.bounds}
      onNamespaceSelect={props.data.onNamespaceSelect}
      onNamespaceResizeHandlePress={props.data.onNamespaceResizeHandlePress}
      editingState={props.data.editingState}
      onTextBlockEditStart={props.data.onTextBlockEditStart}
      onTextBlockEditCancel={props.data.onTextBlockEditCancel}
      onNamespaceRenameCommitted={props.data.onNamespaceRenameCommitted}
    />
  );
}
