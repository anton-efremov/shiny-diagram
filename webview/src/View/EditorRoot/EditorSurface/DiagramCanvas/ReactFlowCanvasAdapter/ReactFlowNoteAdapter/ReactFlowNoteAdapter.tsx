/**
 * @framework React Flow note NodeProps to View NoteBox props.
 */

import { useCallback } from "react";
import type { ReactElement } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  type Node,
  type NodeProps,
  type OnResizeEnd,
} from "@xyflow/react";
import { NOTE_MIN_HEIGHT, NOTE_MIN_WIDTH } from "../../../../../config/editorUiConfig";
import type { NoteId } from "../../../../../../shared/ids";
import type { EditingState } from "../../../../../state/editorStates";
import type { NoteView } from "../../../../../views/schema";
import NoteBox from "./NoteBox/NoteBox";
import styles from "./ReactFlowNoteAdapter.module.css";

type NoteBoxNodeData = {
  readonly view: NoteView;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly editingState: EditingState;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onNoteResizeEnd: (change: {
    readonly noteId: NoteId;
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  }) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

type NoteBoxNode = Node<NoteBoxNodeData, "noteBox">;

export default function ReactFlowNoteAdapter(props: NodeProps<NoteBoxNode>): ReactElement {
  // Framework prop and event adaptation
  const onResizeEnd = useCallback<OnResizeEnd>(
    (_event, params) => {
      props.data.onNoteResizeEnd({
        noteId: props.data.view.noteId,
        x: params.x,
        y: params.y,
        w: params.width,
        h: params.height,
      });
    },
    [props.data]
  );

  return (
    <>
      <NodeResizer
        nodeId={props.data.view.noteId}
        isVisible={props.data.isResizeVisible}
        minWidth={NOTE_MIN_WIDTH}
        minHeight={NOTE_MIN_HEIGHT}
        handleClassName={styles.resizeHandle}
        lineClassName={styles.resizeLine}
        onResizeEnd={onResizeEnd}
      />
      <NoteBox
        view={props.data.view}
        isSelected={props.data.isSelected}
        isDragging={props.dragging ?? false}
        editingState={props.data.editingState}
        onNoteSelect={props.data.onNoteSelect}
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
