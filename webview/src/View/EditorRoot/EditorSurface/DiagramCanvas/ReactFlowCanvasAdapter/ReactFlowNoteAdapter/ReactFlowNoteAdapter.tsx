/**
 * @framework React Flow note NodeProps to View NoteBox props.
 */

import type { ReactElement } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { Point, Rect } from "../../../../../../shared/geometry";
import type { NoteId } from "../../../../../../shared/ids";
import type { EditingState } from "../../../../../state/editorStates";
import type { NoteView } from "../../../../../views/schema";
import type { NamespaceResizeHandle } from "../frameworkAdapters";
import NoteBox from "./NoteBox/NoteBox";
import styles from "./ReactFlowNoteAdapter.module.css";

type NoteBoxNodeData = {
  readonly view: NoteView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly editingState: EditingState;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onNoteResizeHandlePress: (
    noteId: NoteId,
    bounds: Rect,
    handle: NamespaceResizeHandle,
    screenPoint: Point
  ) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

type NoteBoxNode = Node<NoteBoxNodeData, "noteBox">;

export default function ReactFlowNoteAdapter(props: NodeProps<NoteBoxNode>): ReactElement {
  // Framework prop and event adaptation
  return (
    <>
      <NoteBox
        view={props.data.view}
        bounds={props.data.bounds}
        isSelected={props.data.isSelected}
        isResizeVisible={props.data.isResizeVisible}
        isDragging={props.dragging ?? false}
        editingState={props.data.editingState}
        onNoteSelect={props.data.onNoteSelect}
        onNoteResizeHandlePress={props.data.onNoteResizeHandlePress}
        onTextBlockEditStart={props.data.onTextBlockEditStart}
        onTextBlockEditCancel={props.data.onTextBlockEditCancel}
      />
      <Handle id="top" type="source" position={Position.Top} className={styles.edgeHandle} />
      <Handle id="right" type="source" position={Position.Right} className={styles.edgeHandle} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={styles.edgeHandle} />
      <Handle id="left" type="source" position={Position.Left} className={styles.edgeHandle} />
    </>
  );
}
