import { describe, expect, it } from "vitest";
import { parseGenericTypes, toDisplayMemberText, toSourceMemberText } from "./memberText";

describe("memberText", () => {
  it("keeps visibility-like leading characters as text", () => {
    expect(toDisplayMemberText("? strange", "field")).toEqual({
      text: "? strange",
      classifier: null,
    });
  });

  it("extracts one classifier from attributes using Mermaid field rules", () => {
    expect(toDisplayMemberText("+String id$*", "field")).toEqual({
      text: "+String id$",
      classifier: "abstract",
    });
  });

  it("converts method return type to display colon syntax", () => {
    expect(toDisplayMemberText("+lookup(id) Result$", "method")).toEqual({
      text: "+lookup(id) : Result",
      classifier: "static",
    });
  });

  it("uses the last closing parenthesis for method return insertion", () => {
    expect(toDisplayMemberText("+build(a) b) Return*", "method")).toEqual({
      text: "+build(a) b) : Return",
      classifier: "abstract",
    });
  });

  it("uses the last closing parenthesis when parameters contain an empty function type", () => {
    const display = toDisplayMemberText("+m(f: (), g: int) bool", "method");

    expect(display).toEqual({
      text: "+m(f:(), g: int) : bool",
      classifier: null,
    });
    expect(toSourceMemberText(display, "method")).toBe("+m(f:(), g: int) bool");
  });

  it("treats a colon before the last closing parenthesis as parameter text", () => {
    const display = toDisplayMemberText("+get() : Result)", "method");

    expect(display).toEqual({
      text: "+get() : Result)",
      classifier: null,
    });
    expect(toSourceMemberText(display, "method")).toBe("+get() : Result)");
  });

  it("pins Mermaid method classifier precedence for adjacent classifiers", () => {
    expect(toDisplayMemberText("+count()$*", "method")).toEqual({
      text: "+count() : *",
      classifier: "static",
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
        { text: "+find(List<T> items) : Result<T>", classifier: "abstract" },
        "method"
      )
    ).toBe("+find(List~T~ items) Result~T~*");
  });
});
