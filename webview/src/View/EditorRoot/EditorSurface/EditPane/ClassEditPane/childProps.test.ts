import { describe, expect, it } from "vitest";
import { toClassId, toNamespaceId, toStyleDefId } from "../../../../../shared/ids";
import type { StyleView } from "../../../../views/schema";
import { toDocumentColors, toStrokeSelectUIProps } from "./childProps";

describe("toDocumentColors", () => {
  it("deduplicates normalized colors while preserving first authored spelling", () => {
    const styles: readonly StyleView[] = [
      {
        kind: "declared",
        styleDefId: toStyleDefId("Accent"),
        name: "Accent",
        properties: properties("#FFF", "#123", null),
      },
      {
        kind: "direct",
        classId: toClassId("User"),
        properties: properties("#ffffff", "#456", "#ABC"),
      },
      {
        kind: "namespace",
        namespaceId: toNamespaceId("Domain"),
        properties: properties("#abc", null, "#789"),
      },
    ];

    expect(toDocumentColors(styles)).toEqual(["#FFF", "#123", "#456", "#ABC", "#789"]);
  });

  it("derives the default value and only off-catalog document stroke values", () => {
    const styles: readonly StyleView[] = [
      {
        kind: "declared",
        styleDefId: toStyleDefId("default"),
        name: "default",
        properties: { ...properties(null, null, null), strokeWidth: "3.5" },
      },
      {
        kind: "direct",
        classId: toClassId("User"),
        properties: { ...properties(null, null, null), strokeWidth: "1px" },
      },
      {
        kind: "namespace",
        namespaceId: toNamespaceId("Domain"),
        properties: { ...properties(null, null, null), strokeWidth: "3.50" },
      },
    ];

    expect(toStrokeSelectUIProps(styles, "strokeWidth", "1px")).toEqual({
      defaultValue: "3.5",
      documentValues: ["3.5", "1px"],
    });
  });

  it("normalizes solid dash values and removes values already in Standard", () => {
    const styles: readonly StyleView[] = [
      {
        kind: "direct",
        classId: toClassId("User"),
        properties: { ...properties(null, null, null), strokeDasharray: "none" },
      },
      {
        kind: "namespace",
        namespaceId: toNamespaceId("Domain"),
        properties: { ...properties(null, null, null), strokeDasharray: "5  5" },
      },
    ];

    expect(toStrokeSelectUIProps(styles, "strokeDasharray", "0")).toEqual({
      defaultValue: "0",
      documentValues: ["0", "5  5"],
    });
  });
});

function properties(fill: string | null, stroke: string | null, color: string | null) {
  return { fill, stroke, strokeWidth: null, strokeDasharray: null, color };
}
