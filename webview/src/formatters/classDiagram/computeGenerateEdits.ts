/**
 * @fileoverview Computes source edits for generated class spatial annotations.
 */

import type { DiagramTree, SourceLocation } from "../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../models/classDiagram/primitives";
import type { ApplyEditsMessage } from "../../protocol";

const DEFAULT_W = 200;
const DEFAULT_H = 150;
const MARGIN = 40;

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
): ApplyEditsMessage["edits"] {
  let maxBottom = 0;
  const existingSpatial = [...model.classes.values()].flatMap((node) =>
    node.spatial ? [node.spatial] : []
  );

  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  const startY = maxBottom > 0 ? maxBottom + MARGIN : MARGIN;

  const edits: { lineNumber: number; newText: string }[] = [];
  const toAppend: string[] = [];

  missingIds.forEach((classId, idx) => {
    const x = MARGIN + idx * (DEFAULT_W + MARGIN);
    const spatialLine = `%% @spatial:${classId} x=${x} y=${startY} w=${DEFAULT_W} h=${DEFAULT_H}`;
    const malformed = malformedAnnotations.get(classId);
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
