import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { moveStatementToParentNamespace } from "../../placement/parentNamespacePlacement";
import type { WriteIntent } from "../../writeIntent";

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
