import { describe, expect, it } from "vitest";
import { toAttributeId, toClassId, toMethodId } from "../../shared/ids";
import { parseDiagram } from "./parseDiagram";

describe("parseDiagram member text blocks", () => {
  it("parses permissive valid members into display text and classifier flags", () => {
    const result = parseDiagram(`classDiagram
class User {
  ? strange visibility
  +List~T~ items$*
  +find(List~T~ input) Result~T~$
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
        isStatic: false,
        isAbstract: false,
      },
      {
        id: "User:3",
        text: "+List<T> items",
        isStatic: true,
        isAbstract: true,
      },
    ]);
    expect(user?.methods).toEqual([
      {
        id: "User:4",
        text: "+find(List<T> input) : Result<T>",
        isStatic: true,
        isAbstract: false,
      },
      {
        id: "User:6",
        text: "+shortMethod() : void",
        isStatic: false,
        isAbstract: true,
      },
    ]);

    expect(result.provenance.blockMembers.get(toAttributeId("User:3"))?.fields.text).toEqual({
      start: { line: 3, character: 2 },
      end: { line: 3, character: 18 },
    });
    expect(result.provenance.shortMembers.get(toMethodId("User:6"))?.fields.text).toEqual({
      start: { line: 6, character: 7 },
      end: { line: 6, character: 27 },
    });
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
