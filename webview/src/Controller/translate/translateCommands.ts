/**
 * @fileoverview Translates editor command transactions into logical write intents.
 */

import type { EditorCommand, EditorCommandTransaction } from "../../View/commands";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { WriteIntent } from "./writeIntent";
import { translateClassCreate } from "./workers/translateClassCreate";
import { translateClassDelete } from "./workers/translateClassDelete";
import { translateClassDirectStyleSet } from "./workers/translateClassDirectStylePropertySet";
import { translateClassDuplicate } from "./workers/translateClassDuplicate";
import { translateClassSpatialSet } from "./workers/translateClassSpatialSet";

export function translateCommands(
  transaction: EditorCommandTransaction,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return transaction.flatMap((command) => translateCommand(command, graph, provenance));
}

function translateCommand(
  command: EditorCommand,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  switch (command.type) {
    case "class.create":
      return translateClassCreate(command, graph, provenance);
    case "class.duplicate":
      return translateClassDuplicate(command, graph);
    case "class.delete":
      return translateClassDelete(command, graph, provenance);
    case "class.spatial.set":
      return translateClassSpatialSet(command, graph, provenance);
    case "class.directStyle.property.set":
      return translateClassDirectStyleSet(command, graph, provenance);
    default:
      throw new Error(`Command ${command.type} is not supported by translate`);
  }
}
