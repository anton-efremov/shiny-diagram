/**
 * @fileoverview Aggregate render contract consumed by the visual editor.
 */

import type {
  ClassBoxView,
  NamespaceBoxView,
  RelationshipView,
} from "./CanvasView/ClassDiagram/views";
import type { ClassId } from "../../shared/ids";

export type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
};

export type EditorViewModel =
  | {
      readonly status: "invalidSyntax";
      readonly message: string;
    }
  | {
      readonly status: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
      readonly elements: ElementViews;
    }
  | {
      readonly status: "ready";
      readonly elements: ElementViews;
    };
