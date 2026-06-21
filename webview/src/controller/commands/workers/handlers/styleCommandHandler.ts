/**
 * @fileoverview Handles source edits for View class style commands.
 */

import type { StyleCommand } from "../../../../view/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { formatStyleProperty } from "../sourceFormatting";

/**
 * Handles class style property source edits.
 */
export function handleStyleCommand(command: StyleCommand, context: CommandContext): CommandResult {
  const styleEdge = context.model.appliesStyleEdges.find((e) => e.source === command.classId);
  if (!styleEdge) {
    return { ok: false, problem: `No style applied to class ${command.classId}` };
  }

  const styleDef = context.model.styleDefs.get(styleEdge.target);
  if (!styleDef) {
    return { ok: false, problem: `StyleDef ${styleEdge.target} not found` };
  }

  const newText = formatStyleProperty(styleDef, command.property, command.value);

  return {
    ok: true,
    edits: [
      {
        start: {
          line: styleDef.location.startLine,
          character: styleDef.location.startChar,
        },
        end: {
          line: styleDef.location.endLine,
          character: styleDef.location.endChar,
        },
        replacementText: newText,
      },
    ],
  };
}
