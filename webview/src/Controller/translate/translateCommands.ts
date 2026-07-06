/**
 * @fileoverview Translates editor command transactions into logical write intents.
 */

import type { EditorCommand, EditorCommandTransaction } from "../../View/commands";
import type { RelationshipId } from "../../shared/ids";
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
import { translateClassSpatialSet } from "./workers/translateClassSpatialSet";
import { translateRelationshipCreate } from "./workers/translateRelationshipCreate";
import {
  translateRelationshipDelete,
  translateRelationshipLabelSet,
  translateRelationshipLineKindSet,
  translateRelationshipSourceClassSet,
  translateRelationshipSourceEndpointKindSet,
  translateRelationshipSourceMultiplicitySet,
  translateRelationshipTargetClassSet,
  translateRelationshipTargetEndpointKindSet,
  translateRelationshipTargetMultiplicitySet,
  translateRelationshipOperatorPatch,
} from "./workers/translateRelationshipEdit";
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
): WriteIntent[] {
  const context = createTranslateContext(graph);
  const operatorPatchBatch = collectRelationshipOperatorPatches(transaction, graph);

  return transaction.flatMap((command, index) => {
    const batchedIntents = operatorPatchBatch.intentsByIndex.get(index);
    if (batchedIntents) return batchedIntents;
    if (operatorPatchBatch.skippedIndexes.has(index)) return [];
    return translateCommand(command, graph, provenance, sourceText, context);
  });
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
      return translateClassCreate(command, graph, provenance);
    case "class.duplicate":
      return translateClassDuplicate(command, graph, provenance, sourceText, context);
    case "class.delete":
      return translateClassDelete(command, graph, provenance);
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
    case "relationship.create":
      return translateRelationshipCreate(command, graph, provenance);
    case "relationship.delete":
      return translateRelationshipDelete(command);
    case "relationship.source.class.set":
      return translateRelationshipSourceClassSet(command);
    case "relationship.target.class.set":
      return translateRelationshipTargetClassSet(command);
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
