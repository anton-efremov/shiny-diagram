/**
 * @fileoverview Public render contract of the View layer.
 * Flattens component-owned view definitions for Controller consumers.
 */

export type { EditorHeaderState } from "../AppHeader/views";
export type { ElementViews } from "../EditorView/views";
export type { ClassBoxView } from "../EditorView/ClassDiagram/ClassBox/views";
export type { ClassBoxMemberView } from "../EditorView/ClassDiagram/ClassBox/MemberTable/views";
export type { NamespaceBoxView, RelationshipView } from "../EditorView/ClassDiagram/views";
