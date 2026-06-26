/**
 * @fileoverview EditorView direct-child view derivation.
 */

import type { CanvasViewModel } from "./CanvasView/views";
import type { ErrorViewModel } from "./ErrorView/views";
import type { MissingAnnotationsViewModel } from "./MissingAnnotationsView/views";
import type {
  EditorClassView,
  EditorRelationshipView,
  EditorNamespaceView,
  EditorViewModel,
} from "./views";

// @job logic:child:view
export function toCanvasView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "ready" }>;
}): CanvasViewModel {
  return {
    elements: {
      classes: view.elements.classes.map(toCanvasClassView),
      namespaces: view.elements.namespaces.map(toCanvasNamespaceView),
      relationships: view.elements.relationships.map(toCanvasRelationshipView),
    },
  };
}

// @job logic:child:view
export function toErrorView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "invalidSyntax" }>;
}): ErrorViewModel {
  return {
    message: view.message,
  };
}

// @job logic:child:view
export function toMissingAnnotationsView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "missingAnnotations" }>;
}): MissingAnnotationsViewModel {
  return {
    missingIds: view.missingIds,
    classes: view.elements.classes.map((classView) => ({
      classId: classView.classId,
      x: classView.x,
      y: classView.y,
      h: classView.h,
    })),
  };
}

function toCanvasClassView(
  classView: EditorClassView
): CanvasViewModel["elements"]["classes"][number] {
  return {
    classId: classView.classId,
    x: classView.x,
    y: classView.y,
    w: classView.w,
    h: classView.h,
    header: classView.header,
    members: classView.members,
    style: classView.style,
  };
}

function toCanvasNamespaceView(
  namespaceView: EditorNamespaceView
): CanvasViewModel["elements"]["namespaces"][number] {
  return {
    namespaceId: namespaceView.namespaceId,
    bounds: namespaceView.bounds,
    label: namespaceView.label,
    style: namespaceView.style,
  };
}

function toCanvasRelationshipView(
  relationshipView: EditorRelationshipView
): CanvasViewModel["elements"]["relationships"][number] {
  return {
    relationshipId: relationshipView.relationshipId,
    sourceClassId: relationshipView.sourceClassId,
    targetClassId: relationshipView.targetClassId,
    relationType: relationshipView.relationType,
    sourceMultiplicity: relationshipView.sourceMultiplicity,
    targetMultiplicity: relationshipView.targetMultiplicity,
    label: relationshipView.label,
  };
}
