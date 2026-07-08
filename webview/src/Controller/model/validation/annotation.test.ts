import { describe, expect, it } from "vitest";
import { validateAnnotation } from "./annotation";

describe("validateAnnotation", () => {
  it("rejects whitespace in annotations", () => {
    expect(validateAnnotation("domain model", "User")).toEqual([
      {
        ok: false,
        message: 'Class "User" annotation must not contain whitespace: domain model',
        verificationStatus: "unverified",
      },
    ]);
  });
});
