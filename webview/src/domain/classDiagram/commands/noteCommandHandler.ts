import type { CommandContext, CommandResult, EditorCommand } from "./commandTypes";

export function handleNoteCommand(
  command: Extract<EditorCommand, { type: "note.move" | "note.resize" | "note.setText" }>,
  _context: CommandContext
): CommandResult {
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
