/**
 * @fileoverview Public render contract of the View layer.
 * Flattens component-owned view definitions for Controller consumers.
 */

export type { EditorViewModel, ElementViews } from "../EditorView/views";
export type { ClassBoxView } from "../EditorView/CanvasView/ClassDiagram/ClassBox/views";
export type { ClassBoxMemberView } from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/ReactFlowClassBoxNodeAdapter/ClassBox/MemberTable/views";
export type {
  NamespaceBoxView,
  RelationshipView,
} from "../EditorView/CanvasView/ClassDiagram/views";
