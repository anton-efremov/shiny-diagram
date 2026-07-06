/**
 * @fileoverview Translates editor command transactions into logical write intents.
 */

import type { EditorCommand, EditorCommandTransaction } from "../../View/commands";
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

  return transaction.flatMap((command) =>
    translateCommand(command, graph, provenance, sourceText, context)
  );
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
