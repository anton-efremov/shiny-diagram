/**
 * @fileoverview Handles View relationship editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type RelationshipCommand =
  | EditorCommandOf<"relationship.create">
  | EditorCommandOf<"relationship.delete">
  | EditorCommandOf<"relationship.source.class.set">
  | EditorCommandOf<"relationship.target.class.set">
  | EditorCommandOf<"relationship.source.multiplicity.set">
  | EditorCommandOf<"relationship.target.multiplicity.set">
  | EditorCommandOf<"relationship.source.endpointKind.set">
  | EditorCommandOf<"relationship.target.endpointKind.set">
  | EditorCommandOf<"relationship.lineKind.set">
  | EditorCommandOf<"relationship.label.set">;

/**
 * Handles relationship commands that are not implemented yet.
 */
export function handleRelationshipCommand(
  command: RelationshipCommand,
  context: CommandContext
): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
