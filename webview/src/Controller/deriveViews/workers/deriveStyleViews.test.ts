import { describe, expect, it } from "vitest";
import type { DiagramGraph } from "../../model/diagramGraph";
import { toStyleDefId } from "../../../shared/ids";
import { deriveBaseStyleView } from "./deriveStyleViews";

describe("deriveBaseStyleView", () => {
  it("returns an empty customization when base is absent", () => {
    expect(deriveBaseStyleView(graphWithOccurrences([]))).toEqual({});
  });

  it("hoists base declarations and resolves later declarations per property", () => {
    expect(
      deriveBaseStyleView(
        graphWithOccurrences([
          declared("default", { fill: "#111", stroke: "#222" }),
          declared("Named", { fill: "#fff" }),
          declared("default", { stroke: "#333", color: "#eee" }),
        ])
      )
    ).toEqual({ fill: "#111", stroke: "#333", color: "#eee" });
  });
});

function graphWithOccurrences(styleOccurrences: DiagramGraph["styleOccurrences"]): DiagramGraph {
  return { styleOccurrences } as DiagramGraph;
}

function declared(
  name: string,
  values: Partial<{ fill: string; stroke: string; color: string }>
): DiagramGraph["styleOccurrences"][number] {
  return {
    kind: "declared",
    styleDefId: toStyleDefId(name),
    name,
    properties: {
      fill: values.fill ?? null,
      stroke: values.stroke ?? null,
      strokeWidth: null,
      strokeDasharray: null,
      color: values.color ?? null,
    },
  };
}
