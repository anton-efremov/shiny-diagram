import { describe, expect, it } from "vitest";
import { validateMemberText } from "./memberText";

describe("validateMemberText", () => {
  it("accepts ordinary field and method text", () => {
    expect(validateMemberText("+id", "field", "User").every((verdict) => verdict.ok)).toBe(true);
    expect(
      validateMemberText("+get() : User", "method", "User").every((verdict) => verdict.ok)
    ).toBe(true);
  });

  it("accepts colons inside method parameters", () => {
    expect(
      validateMemberText("+compare(a: int, b: int) : bool", "method", "User").every(
        (verdict) => verdict.ok
      )
    ).toBe(true);
    expect(
      validateMemberText("+compare(items: List<T>) : bool", "method", "User").every(
        (verdict) => verdict.ok
      )
    ).toBe(true);
    expect(
      validateMemberText("+compare(a: List<T>, b: Map<K,V>) : bool", "method", "User").every(
        (verdict) => verdict.ok
      )
    ).toBe(true);
  });

  it("rejects display method text with a closing parenthesis after the return colon", () => {
    expect(validateMemberText("+get() : Result)", "method", "User")).toEqual([
      {
        ok: false,
        message:
          'Method member in class "User" must not contain ")" after the return-type colon: +get() : Result)',
        verificationStatus: "unverified",
      },
    ]);
  });
});
