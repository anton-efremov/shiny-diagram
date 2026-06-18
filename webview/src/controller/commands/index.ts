import { handleClassBoxCommand } from "./classBoxCommandHandler";
import { handleGenerateCommand } from "./generateCommandHandler";
import { handleMemberCommand } from "./memberCommandHandler";
import { handleNamespaceCommand } from "./namespaceCommandHandler";
import { handleNoteCommand } from "./noteCommandHandler";
import { handleRelationshipCommand } from "./relationshipCommandHandler";
import { handleStyleCommand } from "./styleCommandHandler";
import type { CommandContext, CommandResult, EditorCommand } from "./commandTypes";

export function applyCommand(command: EditorCommand, context: CommandContext): CommandResult {
  switch (command.type) {
    case "class.move":
    case "class.resize":
      return handleClassBoxCommand(command, context);

    case "style.setClassProperty":
      return handleStyleCommand(command, context);

    case "generate":
      return handleGenerateCommand(context);

    case "class.header.setLabel":
    case "class.member.setText":
    case "class.member.setPrefix":
      return handleMemberCommand(command, context);

    case "namespace.move":
    case "namespace.setStyle":
      return handleNamespaceCommand(command, context);

    case "relationship.setType":
    case "relationship.setMultiplicity":
    case "relationship.setLabel":
      return handleRelationshipCommand(command, context);

    case "note.move":
    case "note.resize":
    case "note.setText":
      return handleNoteCommand(command, context);
  }
}
