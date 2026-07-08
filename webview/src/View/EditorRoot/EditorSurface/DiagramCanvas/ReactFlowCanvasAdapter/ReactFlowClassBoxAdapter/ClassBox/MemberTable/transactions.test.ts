import { describe, expect, it } from "vitest";
import { toAttributeId, toClassId, toMethodId } from "../../../../../../../../shared/ids";
import type { ClassMemberView } from "../../../../../../../views/schema";
import { toMemberMoveTransaction } from "./transactions";

describe("toMemberMoveTransaction", () => {
  it("moves an attribute above the first row", () => {
    expect(
      toMemberMoveTransaction(toClassId("User"), "field", attributes, toAttributeId("User:3"), 0)
    ).toEqual([
      {
        type: "class.attribute.move",
        attributeId: toAttributeId("User:3"),
        classId: toClassId("User"),
        beforeAttributeId: toAttributeId("User:1"),
      },
    ]);
  });

  it("moves an attribute between rows", () => {
    expect(
      toMemberMoveTransaction(toClassId("User"), "field", attributes, toAttributeId("User:1"), 1)
    ).toEqual([
      {
        type: "class.attribute.move",
        attributeId: toAttributeId("User:1"),
        classId: toClassId("User"),
        beforeAttributeId: toAttributeId("User:3"),
      },
    ]);
  });

  it("moves an attribute below the last row by appending", () => {
    expect(
      toMemberMoveTransaction(toClassId("User"), "field", attributes, toAttributeId("User:1"), 2)
    ).toEqual([
      {
        type: "class.attribute.move",
        attributeId: toAttributeId("User:1"),
        classId: toClassId("User"),
        beforeAttributeId: null,
      },
    ]);
  });

  it("returns an empty transaction for adjacent no-op drops", () => {
    expect(
      toMemberMoveTransaction(toClassId("User"), "field", attributes, toAttributeId("User:1"), 0)
    ).toEqual([]);
    expect(
      toMemberMoveTransaction(toClassId("User"), "field", attributes, toAttributeId("User:2"), 1)
    ).toEqual([]);
  });

  it("emits method move commands for methods", () => {
    expect(
      toMemberMoveTransaction(toClassId("User"), "method", methods, toMethodId("User:2"), 0)
    ).toEqual([
      {
        type: "class.method.move",
        methodId: toMethodId("User:2"),
        classId: toClassId("User"),
        beforeMethodId: toMethodId("User:1"),
      },
    ]);
  });
});

const attributes: readonly ClassMemberView[] = [
  { memberId: toAttributeId("User:1"), kind: "field", text: "+a", classifier: null },
  { memberId: toAttributeId("User:2"), kind: "field", text: "+b", classifier: null },
  { memberId: toAttributeId("User:3"), kind: "field", text: "+c", classifier: null },
];

const methods: readonly ClassMemberView[] = [
  { memberId: toMethodId("User:1"), kind: "method", text: "+a()", classifier: null },
  { memberId: toMethodId("User:2"), kind: "method", text: "+b()", classifier: null },
];
