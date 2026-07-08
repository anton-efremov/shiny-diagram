import { describe, expect, it } from "vitest";
import type { EditorCommandTransaction } from "../../View/commands";
import { toAttributeId, toClassId, toDiagramId, toMethodId } from "../../shared/ids";
import type { ClassMember, ClassNode, DiagramGraph, NoteNode } from "../model/diagramGraph";
import { validateTransaction } from "./validateTransaction";

describe("validateTransaction", () => {
  it("accepts typed method parameters that round-trip through source syntax", () => {
    const graph = graphWithClasses([
      classNode("User", [], [{ id: toMethodId("User:2"), text: "+m(f:(), g: int) : bool" }]),
    ]);

    const transaction: EditorCommandTransaction = [
      {
        type: "class.method.set",
        methodId: toMethodId("User:2"),
        text: "+m(f:(), g: int) : bool",
        classifier: null,
      },
    ];

    expect(validateTransaction(transaction, graph)).toEqual([]);
  });

  it("rejects a member display text that Mermaid would reinterpret as a classifier", () => {
    const graph = graphWithClasses([
      classNode("User", [{ id: toAttributeId("User:2"), text: "+id" }], []),
    ]);

    const errors = validateTransaction(
      [
        {
          type: "class.attribute.set",
          attributeId: toAttributeId("User:2"),
          text: "+id$",
          classifier: null,
        },
      ],
      graph
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('would be reinterpreted as "+id"');
    expect(errors[0]?.commandIndex).toBe(0);
  });

  it("rejects the whole transaction with command-indexed errors", () => {
    const graph = graphWithClasses([
      classNode("User", [{ id: toAttributeId("User:2"), text: "+id" }], []),
    ]);

    const errors = validateTransaction(
      [
        {
          type: "class.attribute.set",
          attributeId: toAttributeId("User:2"),
          text: "+id",
          classifier: null,
        },
        {
          type: "class.method.create",
          classId: toClassId("User"),
          text: "+notMethod",
          classifier: null,
          beforeMethodId: null,
        },
      ],
      graph
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]?.commandIndex).toBe(1);
  });

  it("rejects class rename collisions", () => {
    const graph = graphWithClasses([classNode("User", [], []), classNode("Account", [], [])]);

    const errors = validateTransaction(
      [{ type: "class.name.set", classId: toClassId("User"), name: "Account" }],
      graph
    );

    expect(errors).toEqual([{ commandIndex: 0, message: 'Class "Account" already exists' }]);
  });

  it("rejects empty note text", () => {
    const errors = validateTransaction(
      [
        {
          type: "note.create",
          text: "",
          spatial: { position: { x: 0, y: 0 }, size: { width: 100, height: 60 } },
          attachedToClassId: null,
        },
      ],
      graphWithClasses([])
    );

    expect(errors).toEqual([{ commandIndex: 0, message: "Note text must not be empty" }]);
  });

  it("rejects note text that Mermaid would reinterpret at a double quote", () => {
    const errors = validateTransaction(
      [
        {
          type: "note.text.set",
          noteId: "note:0" as NoteNode["id"],
          text: 'quoted " text',
        },
      ],
      graphWithClasses([])
    );

    expect(errors).toEqual([
      {
        commandIndex: 0,
        message:
          'Note text "quoted " text" would be reinterpreted by Mermaid because double quotes end note strings',
      },
    ]);
  });

  it("rejects note text with literal newlines", () => {
    const errors = validateTransaction(
      [
        {
          type: "note.text.set",
          noteId: "note:0" as NoteNode["id"],
          text: "line one\nline two",
        },
      ],
      graphWithClasses([])
    );

    expect(errors).toEqual([
      {
        commandIndex: 0,
        message:
          'Note text "line one\nline two" would be reinterpreted by Mermaid because literal newlines cannot be represented inside note strings',
      },
    ]);
  });

  it("accepts backslashes as literal note text", () => {
    const errors = validateTransaction(
      [
        {
          type: "note.text.set",
          noteId: "note:0" as NoteNode["id"],
          text: String.raw`line \n stays literal`,
        },
      ],
      graphWithClasses([])
    );

    expect(errors).toEqual([]);
  });

  it("rejects note attachment targets that do not exist", () => {
    const errors = validateTransaction(
      [
        {
          type: "note.attachment.set",
          noteId: "note:0" as NoteNode["id"],
          attachedToClassId: toClassId("Missing"),
        },
      ],
      graphWithClasses([classNode("User", [], [])])
    );

    expect(errors).toEqual([{ commandIndex: 0, message: 'Class "Missing" does not exist' }]);
  });
});

function graphWithClasses(classes: readonly ClassNode[]): DiagramGraph {
  return {
    diagram: {
      kind: "classDiagram",
      id: toDiagramId("classDiagram"),
      direction: null,
      config: { hideEmptyMembersBox: null, hierarchicalNamespaces: null },
    },
    classes: new Map(classes.map((node) => [node.id, node])),
    namespaces: new Map(),
    relationships: new Map(),
    notes: new Map(),
    styleDefinitions: new Map(),
    styleApplications: new Map(),
  };
}

function classNode(
  name: string,
  attributes: readonly MemberFixture[],
  methods: readonly MemberFixture[]
): ClassNode {
  const id = toClassId(name);
  return {
    kind: "class",
    id,
    name,
    label: name,
    genericType: null,
    annotation: null,
    parentNamespaceId: null,
    spatial: null,
    attributes: attributes.map(toMember),
    methods: methods.map(toMember),
    lollipopInterfaces: [],
    directStyle: null,
    interaction: null,
  };
}

type MemberFixture = Pick<ClassMember, "id" | "text">;

function toMember(member: MemberFixture): ClassMember {
  return { ...member, classifier: null };
}
