/**
 * @fileoverview Translates editor command transactions into logical write intents
 * and the transaction's identity outcome.
 */

import type {
  EditorCommand,
  EditorCommandTransaction,
  TransactionOutcome,
} from "../../View/commands";
import type { ClassId, RelationshipId } from "../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../shared/uml";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import { createTranslateContext } from "./translateContext";
import type { TranslateContext } from "./translateContext";
import type { WriteIntent } from "./writeIntent";
import { translateClassCreate } from "./workers/translateClassCreate";
import { translateClassAppliedStyleSet } from "./workers/translateClassAppliedStyleSet";
import { translateClassDelete } from "./workers/translateClassDelete";
import { translateClassDirectStyleSet } from "./workers/translateClassDirectStylePropertySet";
import {
  translateClassDirectStyleClear,
  translateClassDirectStyleSet as translateClassFullDirectStyleSet,
} from "./workers/translateClassDirectStyleSet";
import { translateClassDuplicate } from "./workers/translateClassDuplicate";
import {
  translateClassAnnotationSet,
  translateClassLabelSet,
  translateClassNameSet,
} from "./workers/translateClassHeader";
import {
  translateClassAttributeCreate,
  translateClassAttributeDelete,
  translateClassAttributeMove,
  translateClassAttributeSet,
  translateClassMethodCreate,
  translateClassMethodDelete,
  translateClassMethodMove,
  translateClassMethodSet,
} from "./workers/translateClassMember";
import { translateClassSpatialSet } from "./workers/translateClassSpatialSet";
import { translateRelationshipCreate } from "./workers/translateRelationshipCreate";
import { translateRelationshipDelete } from "./workers/translateRelationshipDelete";
import { translateRelationshipEndpointsPatch } from "./workers/translateRelationshipEndpointsPatch";
import { translateRelationshipLabelSet } from "./workers/translateRelationshipLabelSet";
import { translateRelationshipLineKindSet } from "./workers/translateRelationshipLineKindSet";
import { translateRelationshipOperatorPatch } from "./workers/translateRelationshipOperatorPatch";
import { translateRelationshipSourceClassSet } from "./workers/translateRelationshipSourceClassSet";
import { translateRelationshipSourceEndpointKindSet } from "./workers/translateRelationshipSourceEndpointKindSet";
import { translateRelationshipSourceMultiplicitySet } from "./workers/translateRelationshipSourceMultiplicitySet";
import { translateRelationshipTargetClassSet } from "./workers/translateRelationshipTargetClassSet";
import { translateRelationshipTargetEndpointKindSet } from "./workers/translateRelationshipTargetEndpointKindSet";
import { translateRelationshipTargetMultiplicitySet } from "./workers/translateRelationshipTargetMultiplicitySet";
import { translateNoteAttachmentSet } from "./workers/translateNoteAttachmentSet";
import { translateNoteCreate } from "./workers/translateNoteCreate";
import { translateNoteDelete } from "./workers/translateNoteDelete";
import { translateNoteDuplicate } from "./workers/translateNoteDuplicate";
import { translateNoteSpatialSet } from "./workers/translateNoteSpatialSet";
import { translateNoteTextSet } from "./workers/translateNoteTextSet";
import {
  translateStyleDefinitionCreate,
  translateStyleDefinitionDelete,
  translateStyleDefinitionNameSet,
  translateStyleDefinitionPropertySet,
} from "./workers/translateStyleDefinition";

export function translateCommands(
  transaction: EditorCommandTransaction,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): { readonly intents: WriteIntent[]; readonly outcome: TransactionOutcome } {
  const context = createTranslateContext(graph);
  const operatorPatchBatch = collectRelationshipOperatorPatches(transaction, graph);
  const endpointsPatchBatch = collectRelationshipEndpointsPatches(transaction);

  const intents = transaction.flatMap((command, index) => {
    const batchedIntents = operatorPatchBatch.intentsByIndex.get(index);
    if (batchedIntents) return batchedIntents;
    if (operatorPatchBatch.skippedIndexes.has(index)) return [];
    const endpointsPatch = endpointsPatchBatch.patchesByIndex.get(index);
    if (endpointsPatch) {
      return translateRelationshipEndpointsPatch(
        endpointsPatch.relationshipId,
        graph,
        endpointsPatch,
        context
      );
    }
    if (endpointsPatchBatch.skippedIndexes.has(index)) return [];
    return translateCommand(command, graph, provenance, sourceText, context);
  });

  return { intents, outcome: context.toTransactionOutcome() };
}

function translateCommand(
  command: EditorCommand,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string,
  context: TranslateContext
): WriteIntent[] {
  switch (command.type) {
    case "class.create":
      return translateClassCreate(command, graph, provenance, context);
    case "class.duplicate":
      return translateClassDuplicate(command, graph, provenance, sourceText, context);
    case "class.delete":
      return translateClassDelete(command, graph, provenance);
    case "class.name.set":
      return translateClassNameSet(command, graph, provenance, context);
    case "class.label.set":
      return translateClassLabelSet(command, graph, provenance);
    case "class.annotation.set":
      return translateClassAnnotationSet(command, provenance, sourceText);
    case "class.spatial.set":
      return translateClassSpatialSet(command, graph, provenance);
    case "class.directStyle.property.set":
      return translateClassDirectStyleSet(command, graph, provenance);
    case "class.directStyle.set":
      return translateClassFullDirectStyleSet(command, graph, provenance);
    case "class.directStyle.clear":
      return translateClassDirectStyleClear(command, provenance);
    case "class.appliedStyle.set":
      return translateClassAppliedStyleSet(command, graph, provenance);
    case "class.attribute.create":
      return translateClassAttributeCreate(command, graph, provenance, sourceText);
    case "class.attribute.set":
      return translateClassAttributeSet(command);
    case "class.attribute.delete":
      return translateClassAttributeDelete(command, provenance);
    case "class.attribute.move":
      return translateClassAttributeMove(command, graph, provenance, sourceText);
    case "class.method.create":
      return translateClassMethodCreate(command, graph, provenance, sourceText);
    case "class.method.set":
      return translateClassMethodSet(command);
    case "class.method.delete":
      return translateClassMethodDelete(command, provenance);
    case "class.method.move":
      return translateClassMethodMove(command, graph, provenance, sourceText);
    case "relationship.create":
      return translateRelationshipCreate(command, graph, provenance, context);
    case "relationship.delete":
      return translateRelationshipDelete(command);
    case "relationship.source.class.set":
      return translateRelationshipSourceClassSet(command, graph, context);
    case "relationship.target.class.set":
      return translateRelationshipTargetClassSet(command, graph, context);
    case "relationship.source.endpointKind.set":
      return translateRelationshipSourceEndpointKindSet(command, graph);
    case "relationship.target.endpointKind.set":
      return translateRelationshipTargetEndpointKindSet(command, graph);
    case "relationship.lineKind.set":
      return translateRelationshipLineKindSet(command, graph);
    case "relationship.source.multiplicity.set":
      return translateRelationshipSourceMultiplicitySet(command, graph, provenance);
    case "relationship.target.multiplicity.set":
      return translateRelationshipTargetMultiplicitySet(command, graph, provenance);
    case "relationship.label.set":
      return translateRelationshipLabelSet(command, graph, provenance);
    case "note.create":
      return translateNoteCreate(command, graph, provenance, context);
    case "note.delete":
      return translateNoteDelete(command, provenance);
    case "note.text.set":
      return translateNoteTextSet(command);
    case "note.spatial.set":
      return translateNoteSpatialSet(command);
    case "note.attachment.set":
      return translateNoteAttachmentSet(command, graph, provenance);
    case "note.duplicate":
      return translateNoteDuplicate(command, graph, provenance, context);
    case "style.definition.create":
      return translateStyleDefinitionCreate(command, graph, provenance);
    case "style.definition.delete":
      return translateStyleDefinitionDelete(command, graph, provenance);
    case "style.definition.name.set":
      return translateStyleDefinitionNameSet(command, graph);
    case "style.definition.property.set":
      return translateStyleDefinitionPropertySet(command, provenance);
    default:
      throw new Error(`Command ${command.type} is not supported by translate`);
  }
}

type RelationshipOperatorPatch = {
  readonly firstIndex: number;
  readonly relationshipId: RelationshipId;
  readonly sourceEndpointKind?: RelationshipEndpointKind;
  readonly targetEndpointKind?: RelationshipEndpointKind;
  readonly lineKind?: RelationshipLineKind;
};

type RelationshipOperatorPatchBatch = {
  readonly intentsByIndex: ReadonlyMap<number, WriteIntent[]>;
  readonly skippedIndexes: ReadonlySet<number>;
};

function collectRelationshipOperatorPatches(
  transaction: EditorCommandTransaction,
  graph: DiagramGraph
): RelationshipOperatorPatchBatch {
  const patches = new Map<RelationshipId, RelationshipOperatorPatch>();
  const operatorCommandIndexes = new Set<number>();

  transaction.forEach((command, index) => {
    const patch = toRelationshipOperatorPatch(command, index);
    if (!patch) return;

    operatorCommandIndexes.add(index);
    const existing = patches.get(patch.relationshipId);
    patches.set(patch.relationshipId, {
      ...existing,
      ...patch,
      firstIndex: existing?.firstIndex ?? patch.firstIndex,
      relationshipId: patch.relationshipId,
    });
  });

  const intentsByIndex = new Map<number, WriteIntent[]>();
  for (const patch of patches.values()) {
    intentsByIndex.set(
      patch.firstIndex,
      translateRelationshipOperatorPatch(patch.relationshipId, graph, patch)
    );
    operatorCommandIndexes.delete(patch.firstIndex);
  }

  return { intentsByIndex, skippedIndexes: operatorCommandIndexes };
}

function toRelationshipOperatorPatch(
  command: EditorCommand,
  firstIndex: number
): RelationshipOperatorPatch | null {
  switch (command.type) {
    case "relationship.source.endpointKind.set":
      return {
        firstIndex,
        relationshipId: command.relationshipId,
        sourceEndpointKind: command.endpointKind,
      };
    case "relationship.target.endpointKind.set":
      return {
        firstIndex,
        relationshipId: command.relationshipId,
        targetEndpointKind: command.endpointKind,
      };
    case "relationship.lineKind.set":
      return {
        firstIndex,
        relationshipId: command.relationshipId,
        lineKind: command.lineKind,
      };
    default:
      return null;
  }
}

type RelationshipEndpointsPatch = {
  readonly firstIndex: number;
  readonly relationshipId: RelationshipId;
  readonly sourceClassId?: ClassId;
  readonly targetClassId?: ClassId;
};

type RelationshipEndpointsPatchBatch = {
  readonly patchesByIndex: ReadonlyMap<
    number,
    RelationshipEndpointsPatch & {
      readonly sourceClassId: ClassId;
      readonly targetClassId: ClassId;
    }
  >;
  readonly skippedIndexes: ReadonlySet<number>;
};

/**
 * Batches endpoint class rewrites of one relationship (the reverse journey) so
 * the identity rename is recorded once with both endpoints applied. Commands
 * setting only one endpoint of a relationship (the reconnect journey) are left
 * to their per-command workers.
 */
function collectRelationshipEndpointsPatches(
  transaction: EditorCommandTransaction
): RelationshipEndpointsPatchBatch {
  const patches = new Map<RelationshipId, RelationshipEndpointsPatch>();
  const indexesByRelationship = new Map<RelationshipId, number[]>();

  transaction.forEach((command, index) => {
    const patch = toRelationshipEndpointsPatch(command, index);
    if (!patch) return;

    indexesByRelationship.set(patch.relationshipId, [
      ...(indexesByRelationship.get(patch.relationshipId) ?? []),
      index,
    ]);
    const existing = patches.get(patch.relationshipId);
    patches.set(patch.relationshipId, {
      ...existing,
      ...patch,
      firstIndex: existing?.firstIndex ?? patch.firstIndex,
      relationshipId: patch.relationshipId,
    });
  });

  const patchesByIndex = new Map<
    number,
    RelationshipEndpointsPatch & {
      readonly sourceClassId: ClassId;
      readonly targetClassId: ClassId;
    }
  >();
  const skippedIndexes = new Set<number>();
  for (const patch of patches.values()) {
    const { sourceClassId, targetClassId } = patch;
    if (sourceClassId === undefined || targetClassId === undefined) continue;

    patchesByIndex.set(patch.firstIndex, { ...patch, sourceClassId, targetClassId });
    for (const index of indexesByRelationship.get(patch.relationshipId) ?? []) {
      if (index !== patch.firstIndex) skippedIndexes.add(index);
    }
  }

  return { patchesByIndex, skippedIndexes };
}

function toRelationshipEndpointsPatch(
  command: EditorCommand,
  firstIndex: number
): RelationshipEndpointsPatch | null {
  switch (command.type) {
    case "relationship.source.class.set":
      return {
        firstIndex,
        relationshipId: command.relationshipId,
        sourceClassId: command.classId,
      };
    case "relationship.target.class.set":
      return {
        firstIndex,
        relationshipId: command.relationshipId,
        targetClassId: command.classId,
      };
    default:
      return null;
  }
}
