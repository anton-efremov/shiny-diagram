import { describe, expect, it } from "vitest";
import { validateClassGenericType } from "./className";

describe("validateClassGenericType", () => {
  it("rejects comma-containing generic type text", () => {
    expect(validateClassGenericType("K, V", "Map")).toEqual([
      {
        ok: false,
        message: 'Class "Map" generic type must not contain a comma: K, V',
        verificationStatus: "unverified",
      },
    ]);
  });
});
