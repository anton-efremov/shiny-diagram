import { describe, expect, it } from "vitest";
import { toClassId, toNamespaceId } from "../../../../../shared/ids";
import type { ClassBoxPlacementState, NamespaceGestureState } from "../../../../state/editorStates";
import type { ClassView, DiagramView, NamespaceView } from "../../../../views/schema";
import { NAMESPACE_MARGIN } from "../../../../config/editorUiConfig";
import {
  toNamespaceDragBoundsState,
  toNamespaceDragClassBoxPlacementState,
  toNamespaceGeometry,
} from "./frameworkAdapters";

describe("toNamespaceGeometry", () => {
  it("derives recursive namespace hulls with compounded margins", () => {
    const namespaceGeometry = toNamespaceGeometry(
      {
        classes: [classView("User", "Root.Child")],
        namespaces: [rootNamespace(), childNamespace()],
      },
      placementState(),
      noGesture()
    );

    const child = namespaceGeometry.boundsByNamespaceId.get(toNamespaceId("Root.Child"));
    const root = namespaceGeometry.boundsByNamespaceId.get(toNamespaceId("Root"));

    expect(child).toBeDefined();
    expect(root).toBeDefined();
    if (!child || !root) return;

    expect(child).toEqual({
      x: 100 - NAMESPACE_MARGIN,
      y: 120 - NAMESPACE_MARGIN,
      w: 80 + NAMESPACE_MARGIN * 2,
      h: 40 + NAMESPACE_MARGIN * 2,
    });
    expect(root).toEqual({
      x: child.x - NAMESPACE_MARGIN,
      y: child.y - NAMESPACE_MARGIN,
      w: child.w + NAMESPACE_MARGIN * 2,
      h: child.h + NAMESPACE_MARGIN * 2,
    });
  });

  it("marks parentless overlapped classes as pending members", () => {
    const namespaceGeometry = toNamespaceGeometry(
      { classes: [classView("User", null), classView("ChildUser", "Root.Child")], namespaces: [] },
      placementState(),
      { kind: "creating", rect: { x: 90, y: 100, w: 120, h: 100 } }
    );

    expect([...namespaceGeometry.pendingClassIds]).toEqual([toClassId("User")]);
  });

  it("adds a canvas-background halo for a captured parentless class", () => {
    const view: Pick<DiagramView, "classes" | "namespaces"> = {
      classes: [classView("User", "Root"), classView("Captured", null)],
      namespaces: [
        {
          namespaceId: toNamespaceId("Root"),
          label: "Root",
          parentNamespaceId: null,
          memberClassIds: [toClassId("User")],
          childNamespaceIds: [],
        },
      ],
    };
    const namespaceGeometry = toNamespaceGeometry(view, placementState(), noGesture());

    expect(namespaceGeometry.haloColorByClassId.get(toClassId("Captured"))).toBe(
      "var(--shiny-page-bg)"
    );
  });

  it("feeds namespace drag deltas into member positions before deriving hulls", () => {
    const view = {
      classes: [classView("User", "Root.Child"), classView("Captured", null)],
      namespaces: [rootNamespace(), childNamespace()],
    };
    const effectivePlacementState = toNamespaceDragClassBoxPlacementState(view, placementState(), {
      namespaceId: toNamespaceId("Root.Child"),
      delta: { x: 25, y: -10 },
    });
    const namespaceGeometry = toNamespaceGeometry(view, effectivePlacementState, noGesture());

    expect(effectivePlacementState.rectByClassId.get(toClassId("User"))).toMatchObject({
      x: 125,
      y: 110,
    });
    expect(effectivePlacementState.rectByClassId.get(toClassId("Captured"))).toMatchObject({
      x: 110,
      y: 130,
    });
    expect(namespaceGeometry.boundsByNamespaceId.get(toNamespaceId("Root.Child"))).toMatchObject({
      x: 125 - NAMESPACE_MARGIN,
      y: 110 - NAMESPACE_MARGIN,
    });
    expect(namespaceGeometry.boundsByNamespaceId.get(toNamespaceId("Root"))).toMatchObject({
      x: 125 - NAMESPACE_MARGIN * 2,
      y: 110 - NAMESPACE_MARGIN * 2,
    });
  });

  it("freezes ancestor hulls while translating the dragged namespace subtree", () => {
    const view = {
      classes: [classView("User", "Root.Child")],
      namespaces: [rootNamespace(), childNamespace()],
    };
    const startGeometry = toNamespaceGeometry(view, placementState(), noGesture());
    const movedBounds = toNamespaceDragBoundsState(
      startGeometry.boundsByNamespaceId,
      view.namespaces,
      {
        namespaceId: toNamespaceId("Root.Child"),
        delta: { x: 80, y: 30 },
      }
    );
    const startRoot = startGeometry.boundsByNamespaceId.get(toNamespaceId("Root"));
    const startChild = startGeometry.boundsByNamespaceId.get(toNamespaceId("Root.Child"));
    const movedRoot = movedBounds.get(toNamespaceId("Root"));
    const movedChild = movedBounds.get(toNamespaceId("Root.Child"));

    expect(startRoot).toBeDefined();
    expect(startChild).toBeDefined();
    if (!startRoot || !startChild) return;

    expect(movedRoot).toEqual(startRoot);
    expect(movedChild).toEqual({
      ...startChild,
      x: startChild.x + 80,
      y: startChild.y + 30,
    });
  });
});

function classView(name: string, parentNamespaceId: string | null): ClassView {
  return {
    classId: toClassId(name),
    parentNamespaceId: parentNamespaceId ? toNamespaceId(parentNamespaceId) : null,
    bounds: { x: 0, y: 0, w: 0, h: 0 },
    header: { name, label: name },
    members: [],
  };
}

function rootNamespace(): NamespaceView {
  return {
    namespaceId: toNamespaceId("Root"),
    label: "Root",
    parentNamespaceId: null,
    memberClassIds: [],
    childNamespaceIds: [toNamespaceId("Root.Child")],
  };
}

function childNamespace(): NamespaceView {
  return {
    namespaceId: toNamespaceId("Root.Child"),
    label: "Child",
    parentNamespaceId: toNamespaceId("Root"),
    memberClassIds: [toClassId("User")],
    childNamespaceIds: [],
  };
}

function placementState(): ClassBoxPlacementState {
  return {
    rectByClassId: new Map([
      [toClassId("User"), { x: 100, y: 120, w: 80, h: 40 }],
      [toClassId("ChildUser"), { x: 100, y: 120, w: 80, h: 40 }],
      [toClassId("Captured"), { x: 110, y: 130, w: 60, h: 30 }],
    ]),
  };
}

function noGesture(): NamespaceGestureState {
  return { kind: "none" };
}
