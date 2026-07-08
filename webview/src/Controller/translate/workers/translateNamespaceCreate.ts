/**
 * @fileoverview Translates `namespace.create` by moving top-level member declarations into a new namespace block.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { NamespaceId } from "../../../shared/ids";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import { spellIdentity } from "../../model/identitySpelling";
import type { StatementRef, WriteIntent } from "../writeIntent";
import { anchorBlockOpening } from "../anchors/statementAnchors";
import { movedStatementPayload } from "../placement/moveStatementSlice";
import type { TranslateContext } from "../translateContext";

export function translateNamespaceCreate(
  command: EditorCommandOf<"namespace.create">,
  provenance: ProvenanceIndex,
  sourceText: string,
  context: TranslateContext
): WriteIntent[] {
  const namespaceId = context.allocateNamespaceId();
  const memberStatements = toMemberStatements(command);
  const deleteIntents = memberStatements.map(
    (target): WriteIntent => ({ kind: "deleteStatement", target })
  );
  const insertIntent: WriteIntent = {
    kind: "insertStatement",
    payload: composeNamespaceBlock(namespaceId, memberStatements, provenance, sourceText),
    anchor: anchorBlockOpening({ kind: "diagram" }),
  };

  return [...deleteIntents, insertIntent];
}

function toMemberStatements(command: EditorCommandOf<"namespace.create">): StatementRef[] {
  return [
    ...command.initialClassIds.map((classId) => ({ kind: "class" as const, classId })),
    ...command.initialNamespaceIds.map((namespaceId) => ({
      kind: "namespace" as const,
      namespaceId,
    })),
  ];
}

function composeNamespaceBlock(
  namespaceId: NamespaceId,
  memberStatements: readonly StatementRef[],
  provenance: ProvenanceIndex,
  sourceText: string
): string {
  const memberLines = memberStatements.map((statement) =>
    movedStatementPayload(statement, provenance, sourceText, 1)
  );
  return [`namespace ${spellIdentity(namespaceId)} {`, ...memberLines, "}"].join("\n");
}
