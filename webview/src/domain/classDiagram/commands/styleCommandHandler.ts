import { formatStyleProperty } from "../source/formatLines";
import type { CommandContext, CommandResult, EditorCommand } from "./commandTypes";

export function handleStyleCommand(
  command: Extract<EditorCommand, { type: "style.setClassProperty" }>,
  context: CommandContext
): CommandResult {
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
    edits: [{ kind: "replaceLine", lineNumber: styleDef.location.startLine, newText }],
  };
}
