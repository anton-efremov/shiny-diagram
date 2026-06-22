/**
 * @fileoverview Applies View editor intent through command-family handlers.
 */

import type { EditorCommand } from "../../shinyView/commands";
import type { CommandContext, CommandResult } from "./commandExecution";
import { handleClassAddCommand } from "./workers/handlers/classAddCommandHandler";
import { handleClassBoxCommand } from "./workers/handlers/classBoxCommandHandler";
import { handleClassContentCommand } from "./workers/handlers/classContentCommandHandler";
import { handleClassDeleteCommand } from "./workers/handlers/classDeleteCommandHandler";
import { handleClassDuplicateCommand } from "./workers/handlers/classDuplicateCommandHandler";
import { handleGenerateCommand } from "./workers/handlers/generateCommandHandler";
import { handleNamespaceCommand } from "./workers/handlers/namespaceCommandHandler";
import { handleNoteCommand } from "./workers/handlers/noteCommandHandler";
import { handleRelationshipCommand } from "./workers/handlers/relationshipCommandHandler";
import { handleStyleCommand } from "./workers/handlers/styleCommandHandler";

/**
 * Executes an editor command against the current source-derived snapshot.
 */
export function applyCommand(command: EditorCommand, context: CommandContext): CommandResult {
  switch (command.type) {
    case "class.add":
      return handleClassAddCommand(command, context);

    case "class.move":
    case "class.resize":
      return handleClassBoxCommand(command, context);

    case "class.delete":
      return handleClassDeleteCommand(command, context);

    case "class.duplicate":
      return handleClassDuplicateCommand(command, context);

    case "style.setClassProperty":
      return handleStyleCommand(command, context);

    case "generate":
      return handleGenerateCommand(context);

    case "class.header.setLabel":
    case "class.member.setText":
    case "class.member.setPrefix":
      return handleClassContentCommand(command, context);

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
