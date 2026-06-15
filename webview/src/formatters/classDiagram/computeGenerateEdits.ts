/**
 * @fileoverview Computes source edits for generated class spatial annotations.
 * Orchestrates layout/ for positions and formatSpatialAnnotation for line text.
 */

import type { DiagramTree, SourceLocation } from "../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../models/classDiagram/primitives";
import type { LineEdit } from "../../extensionBridge/protocol";
import { formatSpatialAnnotation } from "./formatLines";
import { readClassBoxMetrics } from "./layoutAlgorithm/classBoxMetrics";
import { computeMalformedBoxLayout } from "./layoutAlgorithm/computeMalformedBoxLayout";
import { computeNewBoxLayout } from "./layoutAlgorithm/computeNewBoxLayout";
import { computeStartY } from "./layoutAlgorithm/gridPlacement";

/**
 * Computes LineEdits that generate @spatial annotations for all missing class IDs.
 * Classes with a malformed (incomplete) annotation get a replace edit at that line.
 * Truly absent classes are batched into a single append edit after the last existing
 * annotation (or the last non-empty line), avoiding line-number drift from sequential inserts.
 */
export function computeGenerateEdits(
  model: DiagramTree,
  missingIds: readonly ClassId[],
  malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>,
  sourceText: string
): readonly LineEdit[] {
  const existingSpatial = [...model.classes.values()].flatMap((node) =>
    node.spatial ? [node.spatial] : []
  );
  const metrics = readClassBoxMetrics();
  const startY = computeStartY(existingSpatial, metrics.margin);

  const edits: LineEdit[] = [];
  const toAppend: string[] = [];

  missingIds.forEach((classId, idx) => {
    const malformed = malformedAnnotations.get(classId);
    const position = malformed
      ? computeMalformedBoxLayout(idx, startY)
      : computeNewBoxLayout(idx, startY);
    const spatialLine = formatSpatialAnnotation(
      classId,
      position.x,
      position.y,
      position.width,
      position.height
    );

    if (malformed) {
      // Replace the malformed line in-place — no duplicate will be left behind.
      edits.push({ lineNumber: malformed.startLine, newText: spatialLine });
    } else {
      toAppend.push(spatialLine);
    }
  });

  if (toAppend.length > 0) {
    const sourceLines = sourceText.split("\n");
    // Anchor: after the last existing valid @spatial line, or the last non-empty line.
    let anchorLine: number;
    if (existingSpatial.length > 0) {
      anchorLine = Math.max(...existingSpatial.map((spatial) => spatial.location.startLine));
    } else {
      anchorLine = sourceLines.length - 1;
      while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
        anchorLine--;
      }
    }
    const anchorRaw = sourceLines[anchorLine] ?? "";
    edits.push({ lineNumber: anchorLine, newText: [anchorRaw, ...toAppend].join("\n") });
  }

  return edits;
}
