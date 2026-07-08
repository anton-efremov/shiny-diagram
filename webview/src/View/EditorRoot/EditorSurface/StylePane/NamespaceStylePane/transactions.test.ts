import { describe, expect, it } from "vitest";
import { toNamespaceId } from "../../../../../shared/ids";
import type { NamespaceView } from "../../../../views/schema";
import {
  toNamespaceDeleteTransaction,
  toNamespaceNameCommitTransaction,
  toNamespaceStylePropertySetTransaction,
  toNamespaceStyleResetTransaction,
} from "./transactions";

describe("NamespaceStylePane transactions", () => {
  it("builds namespace rename, reset, and delete transactions", () => {
    const namespaceId = toNamespaceId("Root");

    expect(toNamespaceNameCommitTransaction(namespaceId, "Core")).toEqual([
      { type: "namespace.name.set", namespaceId, name: "Core" },
    ]);
    expect(toNamespaceStyleResetTransaction(namespaceId)).toEqual([
      { type: "namespace.style.set", namespaceId, style: null },
    ]);
    expect(toNamespaceDeleteTransaction(namespaceId)).toEqual([
      { type: "namespace.delete", namespaceId },
    ]);
  });

  it("commits full namespace style objects for property changes", () => {
    expect(toNamespaceStylePropertySetTransaction(namespaceView(), "stroke", "#48f")).toEqual([
      {
        type: "namespace.style.set",
        namespaceId: toNamespaceId("Root"),
        style: {
          fill: "#eef",
          stroke: "#48f",
          strokeWidth: null,
          strokeDasharray: null,
          color: null,
        },
      },
    ]);
  });
});

function namespaceView(): NamespaceView {
  return {
    namespaceId: toNamespaceId("Root"),
    label: "Root",
    parentNamespaceId: null,
    memberClassIds: [],
    childNamespaceIds: [],
    style: {
      fill: "#eef",
      stroke: null,
      strokeWidth: null,
      strokeDasharray: null,
      color: null,
    },
  };
}
