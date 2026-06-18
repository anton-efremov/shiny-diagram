import type { CommandContext, CommandResult, EditorCommand } from ".";

export function handleMemberCommand(
  command: Extract<EditorCommand, { type: "class.header.setLabel" | "class.member.setText" | "class.member.setPrefix" }>,
  _context: CommandContext
): CommandResult {
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
