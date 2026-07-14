import { describe, expect, it } from "vitest";
import type { EditorCommandTransaction } from "../../View/commands";
import { toClassId, toDiagramId, toNoteId, toRelationshipId } from "../../shared/ids";
import type { ClassNode, DiagramGraph, NoteNode } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import { translateCommands } from "./translateCommands";

describe("relationship endpoint writeback guard", () => {
  it("refuses to serialize an internal note identity as a class endpoint", () => {
    const noteId = toNoteId("note:0");
    const graph = graphWithNoteAndPhantomClass(noteId);
    const transaction: EditorCommandTransaction = [
      {
        type: "relationship.target.class.set",
        relationshipId: toRelationshipId("User--Other--0"),
        classId: toClassId(noteId),
      },
    ];

    expect(() => translateCommands(transaction, graph, {} as ProvenanceIndex, "")).toThrow(
      "Relationship endpoint note:0 is not a class identity"
    );
  });
});

function graphWithNoteAndPhantomClass(noteId: NoteNode["id"]): DiagramGraph {
  const phantom = classNode(noteId);
  return {
    diagram: {
      kind: "classDiagram",
      id: toDiagramId("classDiagram"),
      direction: null,
      config: { hideEmptyMembersBox: null, hierarchicalNamespaces: null },
    },
    classes: new Map([[phantom.id, phantom]]),
    namespaces: new Map(),
    relationships: new Map(),
    notes: new Map([
      [noteId, { kind: "note", id: noteId, text: "Note", attachedToClassId: null, spatial: null }],
    ]),
    styleDefinitions: new Map(),
    styleApplications: new Map(),
    styleOccurrences: [],
  };
}

function classNode(name: string): ClassNode {
  return {
    kind: "class",
    id: toClassId(name),
    name,
    label: name,
    genericType: null,
    annotation: null,
    parentNamespaceId: null,
    spatial: null,
    attributes: [],
    methods: [],
    lollipopInterfaces: [],
    directStyle: null,
    interaction: null,
  };
}
