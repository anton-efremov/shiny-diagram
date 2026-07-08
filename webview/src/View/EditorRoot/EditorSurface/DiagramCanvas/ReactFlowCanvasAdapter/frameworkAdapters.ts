/**
 * @framework View diagram canvas props and React Flow event payloads to adapter boundary values.
 */

import type {
  Connection,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  NodeChange as ReactFlowNodeChange,
} from "@xyflow/react";
import type { Rect } from "../../../../../shared/geometry";
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import { toClassId } from "../../../../../shared/ids";
import type {
  ClassBoxPlacementState,
  EditingState,
  NoteAttachState,
  NoteBoxPlacementState,
  SelectionState,
} from "../../../../state/editorStates";
import type { ClassView, DiagramView, NoteView, RelationshipView } from "../../../../views/schema";

export type ClassBoxNodeData = {
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

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxNodeData, "classBox">;
export type NoteBoxNodeData = {
  readonly view: NoteView;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly editingState: EditingState;
  readonly onNoteSelect: (noteId: NoteView["noteId"]) => void;
  readonly onNoteResizeEnd: (change: NoteBoxPlacementChange) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

export type NoteBoxNodeDescriptor = ReactFlowNode<NoteBoxNodeData, "noteBox">;

export type RelationshipEdgeData = {
  readonly view: RelationshipView;
  readonly isSelected: boolean;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
};

export type RelationshipEdgeDescriptor = ReactFlowEdge<RelationshipEdgeData, "relationship">;

export type NoteAttachmentEdgeData = {
  readonly isActive: boolean;
};

export type NoteAttachmentEdgeDescriptor = ReactFlowEdge<NoteAttachmentEdgeData, "noteAttachment">;

export type ClassBoxPlacementChange = {
  readonly classId: ClassId;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

export type NoteBoxPlacementChange = {
  readonly noteId: NoteView["noteId"];
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

export type RelationshipConnection = {
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
};

export type RelationshipReconnect = {
  readonly relationshipId: RelationshipId;
  readonly end: "source" | "target";
  readonly newClassId: ClassId;
};

// Framework prop and event adaptation
export function toClassBoxNodeDescriptors(
  classes: readonly ClassView[],
  selectedClassIds: readonly ClassId[],
  classBoxPlacementState: ClassBoxPlacementState,
  isConnectSourceEnabled: boolean,
  onClassSelect: (classId: ClassId, additive: boolean) => void,
  editingState: EditingState,
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void,
  onTextBlockEditCancel: () => void
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  return classes.flatMap((classView) => {
    const placement = classBoxPlacementState.rectByClassId.get(classView.classId);
    if (!placement) return [];

    return [
      {
        id: classView.classId,
        type: "classBox" as const,
        position: { x: placement.x, y: placement.y },
        data: {
          view: classView,
          isSelected: selected.has(classView.classId),
          isResizeVisible: selected.size === 1 && selected.has(classView.classId),
          isConnectSourceEnabled,
          onClassSelect,
          editingState,
          onTextBlockEditStart,
          onTextBlockEditCancel,
        },
        selectable: false,
        focusable: false,
        width: placement.w,
        height: placement.h,
        style: { width: placement.w, height: placement.h },
      },
    ];
  });
}

// Framework prop and event adaptation
export function toNoteBoxNodeDescriptors(
  notes: readonly NoteView[],
  selectionState: SelectionState,
  editingState: EditingState,
  noteBoxPlacementState: NoteBoxPlacementState,
  onNoteSelect: (noteId: NoteView["noteId"]) => void,
  onNoteResizeEnd: (change: NoteBoxPlacementChange) => void,
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void,
  onTextBlockEditCancel: () => void
): NoteBoxNodeDescriptor[] {
  return notes.flatMap((noteView) => {
    const placement = noteBoxPlacementState.rectByNoteId.get(noteView.noteId);
    if (!placement) return [];
    const isSelected = selectionState.kind === "note" && selectionState.noteId === noteView.noteId;
    return [
      {
        id: noteView.noteId,
        type: "noteBox" as const,
        position: { x: placement.x, y: placement.y },
        data: {
          view: noteView,
          isSelected,
          isResizeVisible: isSelected,
          editingState,
          onNoteSelect,
          onNoteResizeEnd,
          onTextBlockEditStart,
          onTextBlockEditCancel,
        },
        selectable: false,
        focusable: false,
        width: placement.w,
        height: placement.h,
        style: { width: placement.w, height: placement.h },
      },
    ];
  });
}

// Framework command adaptation
export function toRelationshipConnection(connection: Connection): RelationshipConnection | null {
  return connection.source && connection.target
    ? {
        sourceClassId: toClassId(connection.source),
        targetClassId: toClassId(connection.target),
      }
    : null;
}

// Framework command adaptation
export function toRelationshipReconnect(
  oldEdge: RelationshipEdgeDescriptor,
  newConnection: Connection
): RelationshipReconnect | null {
  const relationshipView = oldEdge.data?.view;
  if (!relationshipView || !newConnection.source || !newConnection.target) return null;

  const sourceChanged = relationshipView.sourceClassId !== newConnection.source;
  const targetChanged = relationshipView.targetClassId !== newConnection.target;
  if (sourceChanged === targetChanged) return null;

  return sourceChanged
    ? {
        relationshipId: relationshipView.relationshipId,
        end: "source",
        newClassId: toClassId(newConnection.source),
      }
    : {
        relationshipId: relationshipView.relationshipId,
        end: "target",
        newClassId: toClassId(newConnection.target),
      };
}

// Framework prop and event adaptation
export function toRelationshipEdgeDescriptors(
  classes: readonly ClassView[],
  relationships: readonly RelationshipView[],
  selectionState: SelectionState,
  classBoxPlacementState: ClassBoxPlacementState,
  isRelationshipPlacementArmed: boolean,
  onRelationshipSelect: (relationshipId: RelationshipId) => void
): RelationshipEdgeDescriptor[] {
  const classesById = new Map(
    classes.flatMap((classView) => {
      const placement = classBoxPlacementState.rectByClassId.get(classView.classId);
      if (!placement) return [];
      return [[classView.classId, placement] as const];
    })
  );

  return relationships.flatMap((rel) => {
    const sourceEntry = classesById.get(rel.sourceClassId);
    const targetEntry = classesById.get(rel.targetClassId);
    if (!sourceEntry || !targetEntry) return [];

    const sourceSide = chooseSourceSide(sourceEntry, targetEntry);
    const targetSide = oppositeSide(sourceSide);

    return [
      {
        id: rel.relationshipId,
        source: rel.sourceClassId,
        target: rel.targetClassId,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        data: {
          view: rel,
          isSelected:
            selectionState.kind === "relationship" &&
            selectionState.relationshipId === rel.relationshipId,
          onRelationshipSelect,
        },
        type: "relationship",
        reconnectable: !isRelationshipPlacementArmed,
        selectable: false,
        focusable: false,
      },
    ];
  });
}

// Framework prop and event adaptation
export function toNoteAttachmentEdgeDescriptors(
  notes: readonly NoteView[],
  classes: readonly ClassView[],
  classBoxPlacementState: ClassBoxPlacementState,
  noteBoxPlacementState: NoteBoxPlacementState,
  noteAttachState: NoteAttachState
): NoteAttachmentEdgeDescriptor[] {
  const classRects = new Map(
    classes.flatMap((classView) => {
      const placement = classBoxPlacementState.rectByClassId.get(classView.classId);
      return placement ? [[classView.classId, placement] as const] : [];
    })
  );
  return notes.flatMap((noteView) => {
    if (!noteView.attachedToClassId) return [];
    const noteRect = noteBoxPlacementState.rectByNoteId.get(noteView.noteId);
    const classRect = classRects.get(noteView.attachedToClassId);
    if (!noteRect || !classRect) return [];
    const sourceSide = chooseSourceSide(noteRect, classRect);
    const targetSide = oppositeSide(sourceSide);
    return [
      {
        id: `${noteView.noteId}->${noteView.attachedToClassId}`,
        source: noteView.noteId,
        target: noteView.attachedToClassId,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        data: {
          isActive:
            noteAttachState.kind === "attaching" && noteAttachState.noteId === noteView.noteId,
        },
        type: "noteAttachment",
        selectable: false,
        focusable: false,
      },
    ];
  });
}

// Framework prop and event adaptation
export function normalizePositionChanges(
  view: Pick<DiagramView, "classes">,
  rfNodes: ClassBoxNodeDescriptor[]
): ReadonlyArray<{ readonly classId: ClassId; readonly x: number; readonly y: number }> {
  const classIds = new Set(view.classes.map((c) => c.classId));
  return rfNodes.flatMap((node) => {
    if (node.type !== "classBox" || !classIds.has(node.data.view.classId)) return [];
    return [{ classId: node.data.view.classId, x: node.position.x, y: node.position.y }];
  });
}

// Framework prop and event adaptation
export function toClassBoxPlacementChanges(
  changes: readonly ReactFlowNodeChange<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>[]
): ClassBoxPlacementChange[] {
  return changes.flatMap((change): ClassBoxPlacementChange[] => {
    switch (change.type) {
      case "position":
        if (change.id.startsWith("note:")) return [];
        return change.position === undefined
          ? []
          : [{ classId: toClassId(change.id), x: change.position.x, y: change.position.y }];
      case "dimensions":
        if (change.id.startsWith("note:")) return [];
        return change.dimensions === undefined
          ? []
          : [
              {
                classId: toClassId(change.id),
                w: change.dimensions.width,
                h: change.dimensions.height,
              },
            ];
      default:
        return [];
    }
  });
}

// Framework prop and event adaptation
export function toNoteBoxPlacementChanges(
  changes: readonly ReactFlowNodeChange<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>[]
): NoteBoxPlacementChange[] {
  return changes.flatMap((change): NoteBoxPlacementChange[] => {
    if (!("id" in change)) return [];
    if (!change.id.startsWith("note:")) return [];
    switch (change.type) {
      case "position":
        return change.position === undefined
          ? []
          : [
              {
                noteId: change.id as NoteView["noteId"],
                x: change.position.x,
                y: change.position.y,
              },
            ];
      case "dimensions":
        return change.dimensions === undefined
          ? []
          : [
              {
                noteId: change.id as NoteView["noteId"],
                w: change.dimensions.width,
                h: change.dimensions.height,
              },
            ];
      default:
        return [];
    }
  });
}

// Private helpers
type BoxSide = "top" | "right" | "bottom" | "left";

function chooseSourceSide(source: Rect, target: Rect): BoxSide {
  const sourceCenterX = source.x + source.w / 2;
  const sourceCenterY = source.y + source.h / 2;
  const targetCenterX = target.x + target.w / 2;
  const targetCenterY = target.y + target.h / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }
  return dy >= 0 ? "bottom" : "top";
}

function oppositeSide(side: BoxSide): BoxSide {
  switch (side) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}
