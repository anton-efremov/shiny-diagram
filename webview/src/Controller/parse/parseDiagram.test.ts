import { describe, expect, it } from "vitest";
import { toAttributeId, toClassId, toMethodId } from "../../shared/ids";
import { parseDiagram } from "./parseDiagram";

describe("parseDiagram member text blocks", () => {
  it("parses permissive valid members into display text and classifier flags", () => {
    const result = parseDiagram(`classDiagram
class User {
  ? strange visibility
  +List~T~ items*
  +find(List~T~ input) Result~T~$
  +compare(a: int, b: List~T~) bool
  +m(f: (), g: int) bool
}
User : +shortMethod() void*
%% @spatial:User x=10 y=20 w=220 h=160
`);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    const user = result.graph.classes.get(toClassId("User"));
    expect(user?.attributes).toEqual([
      {
        id: "User:2",
        text: "? strange visibility",
        classifier: null,
      },
      {
        id: "User:3",
        text: "+List<T> items",
        classifier: "abstract",
      },
    ]);
    expect(user?.methods).toEqual([
      {
        id: "User:4",
        text: "+find(List<T> input) : Result<T>",
        classifier: "static",
      },
      {
        id: "User:5",
        text: "+compare(a: int, b: List<T>) : bool",
        classifier: null,
      },
      {
        id: "User:6",
        text: "+m(f:(), g: int) : bool",
        classifier: null,
      },
      {
        id: "User:8",
        text: "+shortMethod() : void",
        classifier: "abstract",
      },
    ]);

    expect(result.provenance.blockMembers.get(toAttributeId("User:3"))?.fields.text).toEqual({
      start: { line: 3, character: 2 },
      end: { line: 3, character: 17 },
    });
    expect(result.provenance.shortMembers.get(toMethodId("User:8"))?.fields.text).toEqual({
      start: { line: 8, character: 7 },
      end: { line: 8, character: 27 },
    });
  });

  it("parses quoted identities in classes, relationships, short members, and spatial annotations", () => {
    const result = parseDiagram(`classDiagram
class \`Animal Class!\`
class \`Car Class\`
\`Animal Class!\` --> \`Car Class\`
\`Animal Class!\` : +nickname String
%% @spatial:\`Animal Class!\` x=10 y=20 w=220 h=160
%% @spatial:\`Car Class\` x=260 y=20 w=220 h=160
`);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    expect([...result.graph.classes.keys()]).toEqual([
      toClassId("Animal Class!"),
      toClassId("Car Class"),
    ]);
    expect([...result.graph.relationships.values()]).toHaveLength(1);
    const animal = result.graph.classes.get(toClassId("Animal Class!"));
    expect(animal?.attributes[0]).toEqual({
      id: "Animal Class!:4",
      text: "+nickname String",
      classifier: null,
    });
    expect(animal?.spatial?.position).toEqual({ x: 10, y: 20 });
    expect(result.provenance.classSpatial.get(toClassId("Animal Class!"))?.fields.target).toEqual({
      start: { line: 5, character: 12 },
      end: { line: 5, character: 27 },
    });
  });

  it("parses class labels for plain and quoted identities", () => {
    const result = parseDiagram(`classDiagram
class User["Human User"]
class \`A B\`~T~["Label AB"]
%% @spatial:User x=10 y=20 w=220 h=160
%% @spatial:\`A B\` x=260 y=20 w=220 h=160
`);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    expect(result.graph.classes.get(toClassId("User"))?.label).toBe("Human User");
    expect(result.graph.classes.get(toClassId("A B"))?.label).toBe("Label AB");
    expect(result.graph.classes.get(toClassId("A B"))?.genericType).toBe("T");
    expect(result.provenance.classes.get(toClassId("User"))?.fields.label).toEqual({
      start: { line: 1, character: 12 },
      end: { line: 1, character: 22 },
    });
  });

  it("keeps valid known-ignored Mermaid statements from invalidating the read path", () => {
    const result = parseDiagram(`classDiagram
class User
click User href "https://example.com"
note for User "Read-only note"
cssClass User Important
accTitle: Accessible title
direction LR
%% @spatial:User x=10 y=20 w=220 h=160
`);

    expect(result.status).toBe("ready");
  });

  it("returns one diagnostic for each unrecognized statement", () => {
    const result = parseDiagram(`classDiagram
class User
this is garbage
also garbage
%% @spatial:User x=10 y=20 w=220 h=160
`);

    expect(result.status).toBe("invalidSyntax");
    if (result.status !== "invalidSyntax") return;

    expect(result.diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      "Unrecognized statement at line 3: this is garbage",
      "Unrecognized statement at line 4: also garbage",
    ]);
  });

  it("returns invalidSyntax with every text-block validation failure", () => {
    const result = parseDiagram(`classDiagram
class Map~K, V~ {
  <<domain model>>
  +validMethod() Result
}
%% @spatial:Map x=10 y=20 w=220 h=160
`);

    expect(result.status).toBe("invalidSyntax");
    if (result.status !== "invalidSyntax") return;

    expect(result.diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      'Class "Map" generic type must not contain a comma: K, V',
      'Class "Map" annotation must not contain whitespace: domain model',
    ]);
  });
});
