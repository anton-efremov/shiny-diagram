/**
 * @fileoverview Public render contract of the View layer.
 * Flattens component-owned view definitions for Controller consumers.
 */

export type { EditorHeaderState } from "../App/AppHeader/views";
export type { ElementViews } from "../App/EditorView/views";
export type { ClassBoxView } from "../App/EditorView/ClassDiagram/ClassBox/views";
export type { ClassBoxMemberView } from "../App/EditorView/ClassDiagram/ClassBox/MemberTable/views";
export type { NamespaceBoxView, RelationshipView } from "../App/EditorView/ClassDiagram/views";
