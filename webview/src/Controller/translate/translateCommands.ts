/**
 * @fileoverview Translates editor command transactions into logical write intents.
 */

import type { EditorCommand, EditorCommandTransaction } from "../../View/commands";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { WriteIntent } from "./writeIntent";
import { translateCreate, translateDuplicate } from "./workers/translateCreate";
import { translateDelete } from "./workers/translateDelete";
import { translateDirectStyleSet, translateSpatialSet } from "./workers/translateSet";

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
      return translateCreate(command, graph, provenance);
    case "class.duplicate":
      return translateDuplicate(command, graph);
    case "class.delete":
      return translateDelete(command, graph, provenance);
    case "class.spatial.set":
      return translateSpatialSet(command, provenance);
    case "class.directStyle.property.set":
      return translateDirectStyleSet(command, provenance);
    default:
      throw new Error(`Command ${command.type} is not supported by translate`);
  }
}
