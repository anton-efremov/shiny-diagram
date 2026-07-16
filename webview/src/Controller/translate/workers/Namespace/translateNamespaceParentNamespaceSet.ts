import type { EditorCommandOf } from "../../../../View/commands";
import { toNamespaceId } from "../../../../shared/ids";
import type { DiagramGraph } from "../../../model/diagramGraph";
import { spellNamespaceIdentity } from "../../../model/identitySpelling";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { toNamespaceRenamePairs } from "../../namespaceRenameCascade";
import type { NamespaceRenamePair } from "../../namespaceRenameCascade";
import { moveStatementToParentNamespace } from "../../placement/parentNamespacePlacement";
import type { TranslateContext } from "../../translateContext";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes three writes:
 *
 * 1. namespace declaration **statement** deleted
 * 2. namespace declaration **statement** (source block, verbatim), in the **target body**
 *    (anchored at first match)
 *    - after the latest namespace declaration statement, excluding old ancestors this
 *      move may empty out
 *    - after the latest statement of any kind
 *    - at block opening
 * 3. namespace style target **value**, in place, for every renamed descendant namespace
 *    with a namespace style annotation statement
 */
export function translateNamespaceParentNamespaceSet(
  command: EditorCommandOf<"namespace.parentNamespace.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string,
  context: TranslateContext
): WriteIntent[] {
  const renamed = toNamespaceReparentRenamePairs(command, graph);
  for (const pair of renamed) {
    context.recordNamespaceRenamed(pair.from, pair.to);
  }
  return [
    ...moveStatementToParentNamespace(
      { kind: "namespace", namespaceId: command.namespaceId },
      "namespace",
      command.parentNamespaceId,
      graph,
      provenance,
      sourceText
    ),
    ...renamed.flatMap((pair) => toNamespaceStyleTargetRenameIntent(pair, provenance)),
  ];
}

function toNamespaceReparentRenamePairs(
  command: EditorCommandOf<"namespace.parentNamespace.set">,
  graph: DiagramGraph
): readonly NamespaceRenamePair[] {
  const current = graph.namespaces.get(command.namespaceId);
  if (!current) return [];
  const nextSegment = command.namespaceId.slice(command.namespaceId.lastIndexOf(".") + 1);
  const nextId = toNamespaceId(
    command.parentNamespaceId ? `${command.parentNamespaceId}.${nextSegment}` : nextSegment
  );
  return toNamespaceRenamePairs(command.namespaceId, nextId, graph);
}

function toNamespaceStyleTargetRenameIntent(
  pair: NamespaceRenamePair,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return provenance.namespaceStyles.has(pair.from)
    ? [
        {
          kind: "replaceValue",
          target: { kind: "namespaceStyleTarget", namespaceId: pair.from },
          payload: spellNamespaceIdentity(pair.to),
        },
      ]
    : [];
}
