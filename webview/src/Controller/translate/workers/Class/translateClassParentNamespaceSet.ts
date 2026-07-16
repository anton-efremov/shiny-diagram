import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { moveStatementToParentNamespace } from "../../placement/parentNamespacePlacement";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes two writes:
 *
 * 1. class declaration **statement** deleted
 * 2. class declaration **statement** (source block, verbatim), in the **target namespace
 *    body**, or **diagram body** if no target namespace (anchored at first match)
 *    - after the latest class declaration statement
 *    - after the latest statement of any kind
 *    - at block opening
 */
export function translateClassParentNamespaceSet(
  command: EditorCommandOf<"class.parentNamespace.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  return moveStatementToParentNamespace(
    { kind: "class", classId: command.classId },
    "class",
    command.parentNamespaceId,
    graph,
    provenance,
    sourceText
  );
}
