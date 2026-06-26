/**
 * @fileoverview Applies View editor command transactions to source edits.
 */

import type {
  EditorCommand,
  EditorCommandOf,
  EditorCommandTransaction,
} from "../../shinyView/commands";
import type { ClassId } from "../../shared/ids";
import type { CommandContext, CommandResult } from "./commandExecution";
import type { SourceEdit } from "./sourceEdit";
import { handleClassAddCommand } from "./workers/handlers/classAddCommandHandler";
import {
  handleClassSpatialMutation,
  type ClassSpatialMutation,
} from "./workers/handlers/classBoxCommandHandler";
import { handleClassContentCommand } from "./workers/handlers/classContentCommandHandler";
import { handleClassDeleteCommands } from "./workers/handlers/classDeleteCommandHandler";
import { handleClassDuplicateCommands } from "./workers/handlers/classDuplicateCommandHandler";
import { handleNamespaceCommand } from "./workers/handlers/namespaceCommandHandler";
import { handleNoteCommand } from "./workers/handlers/noteCommandHandler";
import { handleRelationshipCommand } from "./workers/handlers/relationshipCommandHandler";
import { handleStyleCommand } from "./workers/handlers/styleCommandHandler";
import { planClassStyleMutation } from "./workers/styleMutationPlanning";

type ImplementedClassStyleCommand =
  | EditorCommandOf<"class.style.fillColor.set">
  | EditorCommandOf<"class.style.borderColor.set">
  | EditorCommandOf<"class.style.textColor.set">;

type DeferredCommands = {
  readonly spatialMutations: Map<ClassId, ClassSpatialMutation>;
  readonly deleteClassIds: ClassId[];
  readonly duplicateCommands: EditorCommandOf<"class.duplicate">[];
  readonly styleGroups: Map<
    string,
    {
      readonly classIds: ClassId[];
      readonly property: "fill" | "stroke" | "color";
      readonly value: string;
    }
  >;
};

/**
 * Executes one editor command transaction against the current source-derived snapshot.
 */
export function applyCommand(
  transaction: EditorCommandTransaction,
  context: CommandContext
): CommandResult {
  const edits: SourceEdit[] = [];
  const deferred: DeferredCommands = {
    spatialMutations: new Map(),
    deleteClassIds: [],
    duplicateCommands: [],
    styleGroups: new Map(),
  };

  for (const command of transaction) {
    const result = applyEditorCommand(command, context, deferred);
    if (!result.ok) return result;
    edits.push(...result.edits);
  }

  const deferredResult = applyDeferredCommands(deferred, context);
  if (!deferredResult.ok) return deferredResult;

  return { ok: true, edits: [...edits, ...deferredResult.edits] };
}

function applyEditorCommand(
  command: EditorCommand,
  context: CommandContext,
  deferred: DeferredCommands
): CommandResult {
  switch (command.type) {
    case "class.create":
      return handleClassAddCommand(command, context);

    case "class.position.set":
      deferClassSpatialMutation(deferred, {
        classId: command.classId,
        position: command.position,
      });
      return { ok: true, edits: [] };

    case "class.size.set":
      deferClassSpatialMutation(deferred, { classId: command.classId, size: command.size });
      return { ok: true, edits: [] };

    case "class.duplicate":
      deferred.duplicateCommands.push(command);
      return { ok: true, edits: [] };

    case "class.delete":
      deferred.deleteClassIds.push(command.classId);
      return { ok: true, edits: [] };

    case "class.style.fillColor.set":
    case "class.style.borderColor.set":
    case "class.style.textColor.set":
      deferClassStyleCommand(deferred, command);
      return { ok: true, edits: [] };

    case "class.style.borderWidth.set":
    case "class.style.borderDashPattern.set":
      return handleStyleCommand(command, context);

    case "class.label.set":
    case "class.member.text.set":
    case "class.member.prefix.set":
      return handleClassContentCommand(command, context);

    case "namespace.style.fillColor.set":
    case "namespace.style.borderColor.set":
    case "namespace.style.textColor.set":
    case "namespace.style.borderWidth.set":
    case "namespace.style.borderDashPattern.set":
      return handleNamespaceCommand(command, context);

    case "relationship.create":
    case "relationship.type.set":
    case "relationship.multiplicity.set":
    case "relationship.label.set":
      return handleRelationshipCommand(command, context);

    case "note.position.set":
    case "note.size.set":
    case "note.text.set":
      return handleNoteCommand(command, context);
  }
}

function applyDeferredCommands(deferred: DeferredCommands, context: CommandContext): CommandResult {
  const edits: SourceEdit[] = [];

  const duplicateResult = handleClassDuplicateCommands(deferred.duplicateCommands, context);
  if (!duplicateResult.ok) return duplicateResult;
  edits.push(...duplicateResult.edits);

  const deleteResult = handleClassDeleteCommands(deferred.deleteClassIds, context);
  if (!deleteResult.ok) return deleteResult;
  edits.push(...deleteResult.edits);

  for (const styleGroup of deferred.styleGroups.values()) {
    const result = planClassStyleMutation(styleGroup, context);
    if (!result.ok) return result;
    edits.push(...result.edits);
  }

  for (const mutation of deferred.spatialMutations.values()) {
    const result = handleClassSpatialMutation(mutation, context);
    if (!result.ok) return result;
    edits.push(...result.edits);
  }

  return { ok: true, edits };
}

function deferClassSpatialMutation(
  deferred: DeferredCommands,
  mutation: ClassSpatialMutation
): void {
  const existing = deferred.spatialMutations.get(mutation.classId);
  deferred.spatialMutations.set(mutation.classId, {
    classId: mutation.classId,
    position: mutation.position ?? existing?.position,
    size: mutation.size ?? existing?.size,
  });
}

function deferClassStyleCommand(
  deferred: DeferredCommands,
  command: ImplementedClassStyleCommand
): void {
  const request = toClassStyleRequest(command);
  const key = `${request.property}:${request.value}`;
  const existing = deferred.styleGroups.get(key);
  if (existing) {
    existing.classIds.push(command.classId);
    return;
  }

  deferred.styleGroups.set(key, {
    classIds: [command.classId],
    property: request.property,
    value: request.value,
  });
}

function toClassStyleRequest(command: ImplementedClassStyleCommand): {
  readonly property: "fill" | "stroke" | "color";
  readonly value: string;
} {
  switch (command.type) {
    case "class.style.fillColor.set":
      return { property: "fill", value: command.fillColor };
    case "class.style.borderColor.set":
      return { property: "stroke", value: command.borderColor };
    case "class.style.textColor.set":
      return { property: "color", value: command.textColor };
  }
}
