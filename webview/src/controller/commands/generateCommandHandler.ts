import { formatSpatialAnnotation } from "./formatters/formatLines";
import { computeMalformedBoxLayout } from "./layoutAlgorithm/computeMalformedBoxLayout";
import { computeNewBoxLayout } from "./layoutAlgorithm/computeNewBoxLayout";
import { computeStartY } from "./layoutAlgorithm/gridPlacement";
import type { CommandContext, CommandResult } from ".";
import type { SourceEdit } from "../../primitives";

export function handleGenerateCommand(context: CommandContext): CommandResult {
  const existingSpatial = [...context.model.classes.values()].flatMap((node) =>
    node.spatial ? [node.spatial] : []
  );

  const missingIds = [...context.model.classes.values()]
    .filter((node) => !node.spatial)
    .map((node) => node.id);

  if (missingIds.length === 0) {
    return { ok: true, edits: [] };
  }

  const malformedAnnotations = context.malformedAnnotations ?? new Map();
  const startY = computeStartY(existingSpatial);

  const edits: SourceEdit[] = [];
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
      edits.push({ kind: "replaceLine", lineNumber: malformed.startLine, newText: spatialLine });
    } else {
      toAppend.push(spatialLine);
    }
  });

  if (toAppend.length > 0) {
    const sourceLines = context.sourceText.split("\n");
    let anchorLine: number;

    if (existingSpatial.length > 0) {
      anchorLine = Math.max(...existingSpatial.map((s) => s.location.startLine));
    } else {
      anchorLine = sourceLines.length - 1;
      while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
        anchorLine--;
      }
    }

    const anchorRaw = sourceLines[anchorLine] ?? "";
    /**
     * Uses replaceRange (startLine === endLine) to express a single-line replacement
     * with multi-line content. This preserves the existing host protocol — the host
     * receives one line replacement whose newText contains embedded newlines.
     * insertLine is in the SourceEdit union but not yet routed through this handler
     * pending a host protocol upgrade.
     */
    edits.push({
      kind: "replaceRange",
      startLine: anchorLine,
      endLine: anchorLine,
      newText: [anchorRaw, ...toAppend].join("\n"),
    });
  }

  return { ok: true, edits };
}
