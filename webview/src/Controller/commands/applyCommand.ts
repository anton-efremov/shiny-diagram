/**
 * @fileoverview Applies View editor command transactions to source edits.
 */

import type { EditorCommand, EditorCommandOf, EditorCommandTransaction } from "../../View/commands";
import type { ClassId } from "../../shared/ids";
import type { StylePropertyName } from "../../shared/style";
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

type ImplementedClassStyleCommand = EditorCommandOf<"class.directStyle.property.set">;

type DeferredCommands = {
  readonly spatialMutations: Map<ClassId, ClassSpatialMutation>;
  readonly deleteClassIds: ClassId[];
  readonly duplicateCommands: EditorCommandOf<"class.duplicate">[];
  readonly styleGroups: Map<
    string,
    {
      readonly classIds: ClassId[];
      readonly property: StylePropertyName;
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

    case "class.spatial.set":
      if (command.spatial) {
        deferClassSpatialMutation(deferred, {
          classId: command.classId,
          position: command.spatial.position,
          size: command.spatial.size,
        });
      }
      return { ok: true, edits: [] };

    case "class.duplicate":
      deferred.duplicateCommands.push(command);
      return { ok: true, edits: [] };

    case "class.delete":
      deferred.deleteClassIds.push(command.classId);
      return { ok: true, edits: [] };

    case "class.directStyle.property.set":
      if (command.value === null || command.property === "fontSize") {
        // TODO(writeback-step): no old direct-style clear/font-size handler exists yet.
        return { ok: true, edits: [] };
      }
      deferClassStyleCommand(deferred, command);
      return { ok: true, edits: [] };

    case "class.directStyle.clear":
      return handleStyleCommand(command, context);

    case "class.label.set":
    case "class.name.set":
    case "class.genericType.set":
    case "class.annotation.set":
    case "class.parentNamespace.set":
    case "class.interaction.set":
    case "class.attribute.create":
    case "class.attribute.delete":
    case "class.attribute.move":
    case "class.attribute.name.set":
    case "class.attribute.visibility.set":
    case "class.attribute.type.set":
    case "class.attribute.static.set":
    case "class.method.create":
    case "class.method.delete":
    case "class.method.move":
    case "class.method.name.set":
    case "class.method.visibility.set":
    case "class.method.parameters.set":
    case "class.method.returnType.set":
    case "class.method.static.set":
    case "class.method.abstract.set":
    case "class.lollipopInterface.create":
    case "class.lollipopInterface.delete":
    case "class.lollipopInterface.move":
    case "class.lollipopInterface.label.set":
    case "class.lollipopInterface.side.set":
      return handleClassContentCommand(command, context);

    case "namespace.create":
    case "namespace.delete":
    case "namespace.name.set":
    case "namespace.label.set":
    case "namespace.parentNamespace.set":
    case "namespace.spatial.set":
      return handleNamespaceCommand(command, context);

    case "relationship.create":
    case "relationship.delete":
    case "relationship.source.class.set":
    case "relationship.target.class.set":
    case "relationship.source.multiplicity.set":
    case "relationship.target.multiplicity.set":
    case "relationship.source.endpointKind.set":
    case "relationship.target.endpointKind.set":
    case "relationship.lineKind.set":
    case "relationship.label.set":
      return handleRelationshipCommand(command, context);

    case "note.create":
    case "note.delete":
    case "note.text.set":
    case "note.spatial.set":
      return handleNoteCommand(command, context);

    case "diagram.direction.set":
    case "diagram.config.hideEmptyMembersBox.set":
    case "diagram.config.hierarchicalNamespaces.set":
    case "style.definition.create":
    case "style.definition.delete":
    case "style.definition.name.set":
    case "style.definition.sourceKind.set":
    case "style.definition.property.set":
    case "style.definition.clear":
    case "style.application.create":
    case "style.application.delete":
    case "style.application.target.set":
    case "style.application.styleDefinition.set":
      return { ok: false, problem: `Command ${command.type} is not yet implemented` };
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
  readonly property: StylePropertyName;
  readonly value: string;
} {
  return { property: command.property, value: command.value ?? "" };
}
