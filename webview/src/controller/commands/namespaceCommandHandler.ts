import type { CommandContext, CommandResult, EditorCommand } from ".";

export function handleNamespaceCommand(
  command: Extract<EditorCommand, { type: "namespace.move" | "namespace.setStyle" }>,
  _context: CommandContext
): CommandResult {
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
