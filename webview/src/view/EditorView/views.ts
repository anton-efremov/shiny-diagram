/**
 * @fileoverview Aggregate render contract consumed by the visual editor.
 */

import type { ClassBoxView } from "./ClassDiagram/ClassBox/views";
import type { NamespaceBoxView, RelationshipView } from "./ClassDiagram/views";

export type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
};
