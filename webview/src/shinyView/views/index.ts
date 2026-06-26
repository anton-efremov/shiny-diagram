/**
 * @fileoverview Public render contract of the View layer.
 * Flattens component-owned view definitions for Controller consumers.
 */

export type { EditorViewModel, ElementViews } from "../EditorView/views";
export type {
  EditorClassView,
  EditorClassMemberView,
  EditorNamespaceView,
  EditorRelationshipView,
} from "../EditorView/views";
