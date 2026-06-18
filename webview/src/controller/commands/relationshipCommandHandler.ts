import type { CommandContext, CommandResult, EditorCommand } from ".";

export function handleRelationshipCommand(
  command: Extract<EditorCommand, { type: "relationship.setType" | "relationship.setMultiplicity" | "relationship.setLabel" }>,
  _context: CommandContext
): CommandResult {
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
