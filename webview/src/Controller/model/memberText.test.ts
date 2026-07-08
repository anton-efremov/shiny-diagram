import { describe, expect, it } from "vitest";
import { parseGenericTypes, toDisplayMemberText, toSourceMemberText } from "./memberText";

describe("memberText", () => {
  it("keeps visibility-like leading characters as text", () => {
    expect(toDisplayMemberText("? strange", "field")).toEqual({
      text: "? strange",
      isStatic: false,
      isAbstract: false,
    });
  });

  it("extracts static and abstract classifiers from attributes", () => {
    expect(toDisplayMemberText("+String id$*", "field")).toEqual({
      text: "+String id",
      isStatic: true,
      isAbstract: true,
    });
  });

  it("converts method return type to display colon syntax", () => {
    expect(toDisplayMemberText("+lookup(id) Result$", "method")).toEqual({
      text: "+lookup(id) : Result",
      isStatic: true,
      isAbstract: false,
    });
  });

  it("uses the last closing parenthesis for method return insertion", () => {
    expect(toDisplayMemberText("+build(a) b) Return*", "method")).toEqual({
      text: "+build(a) b) : Return",
      isStatic: false,
      isAbstract: true,
    });
  });

  it("mirrors Mermaid generic tilde pairing", () => {
    expect(parseGenericTypes("List~List~T~~")).toBe("List<List<T>>");
    expect(parseGenericTypes("~notGeneric")).toBe("~notGeneric");
    expect(parseGenericTypes("Map~K~, List~V~")).toBe("Map<K>, List<V>");
  });

  it("round trips display text back to source spelling", () => {
    expect(
      toSourceMemberText(
        { text: "+find(List<T> items) : Result<T>", isStatic: true, isAbstract: true },
        "method"
      )
    ).toBe("+find(List~T~ items) Result~T~$*");
  });
});
