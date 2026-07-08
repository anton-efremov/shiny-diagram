import { describe, expect, it } from "vitest";
import { toAttributeId, toClassId, toDiagramId, toMethodId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import { deriveClassBoxViews } from "./deriveClassBoxViews";

describe("deriveClassBoxViews", () => {
  it("passes class member text and classifier flags through to the View model", () => {
    const classId = toClassId("User");
    const graph: DiagramGraph = {
      diagram: {
        kind: "classDiagram",
        id: toDiagramId("classDiagram"),
        direction: null,
        config: { hideEmptyMembersBox: null, hierarchicalNamespaces: null },
      },
      classes: new Map([
        [
          classId,
          {
            kind: "class",
            id: classId,
            name: "User",
            label: "User",
            genericType: null,
            annotation: null,
            parentNamespaceId: null,
            spatial: {
              position: { x: 10, y: 20 },
              size: { width: 200, height: 120 },
            },
            attributes: [
              {
                id: toAttributeId("User:2"),
                text: "+List<T> items",
                isStatic: true,
                isAbstract: true,
              },
            ],
            methods: [
              {
                id: toMethodId("User:3"),
                text: "+find() : Result<T>",
                isStatic: false,
                isAbstract: true,
              },
            ],
            lollipopInterfaces: [],
            directStyle: null,
            interaction: null,
          },
        ],
      ]),
      namespaces: new Map(),
      relationships: new Map(),
      notes: new Map(),
      styleDefinitions: new Map(),
      styleApplications: new Map(),
    };

    expect(deriveClassBoxViews(graph)[0].members).toEqual([
      {
        memberId: "User:2",
        kind: "field",
        text: "+List<T> items",
        isStatic: true,
        isAbstract: true,
      },
      {
        memberId: "User:3",
        kind: "method",
        text: "+find() : Result<T>",
        isStatic: false,
        isAbstract: true,
      },
    ]);
  });
});
