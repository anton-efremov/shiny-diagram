import { describe, expect, it } from "vitest";
import { toClassId, toNamespaceId } from "../../../../../shared/ids";
import type { ClassBoxPlacementState } from "../../../../state/editorStates";
import type { ClassView, DiagramView, NamespaceView } from "../../../../views/schema";
import { toNamespaceMoveTransaction, toTransitiveMemberClassIds } from "./transactions";

describe("namespace move transactions", () => {
  it("collects transitive member classes through nested namespaces", () => {
    expect(toTransitiveMemberClassIds(toNamespaceId("Root"), view())).toEqual([
      toClassId("User"),
      toClassId("Order"),
    ]);
  });

  it("rounds translated positions once when building spatial set commands", () => {
    expect(
      toNamespaceMoveTransaction(
        toNamespaceId("Root"),
        { x: 10.4, y: -5.6 },
        view(),
        placementState()
      )
    ).toEqual([
      {
        type: "class.spatial.set",
        classId: toClassId("User"),
        spatial: {
          position: { x: 110, y: 114 },
          size: { width: 80, height: 40 },
        },
      },
      {
        type: "class.spatial.set",
        classId: toClassId("Order"),
        spatial: {
          position: { x: 210, y: 134 },
          size: { width: 90, height: 50 },
        },
      },
    ]);
  });
});

function view(): Pick<DiagramView, "classes" | "namespaces"> {
  return {
    classes: [classView("User", "Root"), classView("Order", "Root.Child")],
    namespaces: [rootNamespace(), childNamespace()],
  };
}

function classView(name: string, parentNamespaceId: string): ClassView {
  return {
    classId: toClassId(name),
    parentNamespaceId: toNamespaceId(parentNamespaceId),
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
    memberClassIds: [toClassId("User")],
    childNamespaceIds: [toNamespaceId("Root.Child")],
  };
}

function childNamespace(): NamespaceView {
  return {
    namespaceId: toNamespaceId("Root.Child"),
    label: "Child",
    parentNamespaceId: toNamespaceId("Root"),
    memberClassIds: [toClassId("Order")],
    childNamespaceIds: [],
  };
}

function placementState(): ClassBoxPlacementState {
  return {
    rectByClassId: new Map([
      [toClassId("User"), { x: 100, y: 120, w: 80, h: 40 }],
      [toClassId("Order"), { x: 200, y: 140, w: 90, h: 50 }],
    ]),
  };
}
