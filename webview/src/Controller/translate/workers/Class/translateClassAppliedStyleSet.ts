/**
 * @fileoverview Translates class-keyed named-style application replacement.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { ClassId, StyleDefId } from "../../../../shared/ids";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../../writeIntent";
import { spellIdentity } from "../../../model/identitySpelling";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../../anchors/statementAnchors";

/**
 * Makes one of three write options:
 *
 * a. style application statement exists and new style definition is null → style
 *    application **statement** deleted
 * b. style application statement exists and new style definition is non-null → style
 *    application name **value**
 *    - in place
 * c. otherwise → style application **statement**, in **diagram body** (anchored at first
 *    match)
 *    - after the latest style application statement
 *    - after the latest direct style or style definition statement
 *    - after the latest statement of any kind except spatial annotation statements
 *    - at block opening
 *
 * No-op when no style application statement exists and the new style definition is null,
 * or when the written style application name is unchanged.
 */
export function translateClassAppliedStyleSet(
  command: EditorCommandOf<"class.appliedStyle.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const existing = [...graph.styleApplications.values()].find(
    (styleApplication) => styleApplication.targetId === command.classId
  );

  if (command.styleDefId === null) {
    return existing
      ? [
          {
            kind: "deleteStatement",
            target: { kind: "styleApplication", styleApplicationId: existing.id },
          },
        ]
      : [];
  }

  if (existing) {
    return existing.styleDefId === command.styleDefId
      ? []
      : [
          {
            kind: "replaceValue",
            target: { kind: "styleApplicationName", styleApplicationId: existing.id },
            payload: command.styleDefId,
          },
        ];
  }

  return [
    {
      kind: "insertStatement",
      payload: composeClassStyleApplication(command.classId, command.styleDefId),
      anchor: toStyleApplicationAnchor(graph, provenance),
    },
  ];
}

function composeClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${spellIdentity(classId)}:::${styleDefId}`;
}

function toStyleApplicationAnchor(
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["styleApplication"])) ??
    asDifferentKind(
      anchorAfterKindList(graph, provenance, diagramScope, ["classDirectStyle", "styleDefinition"])
    ) ??
    asDifferentKind(
      anchorAfterKindList(
        graph,
        provenance,
        diagramScope,
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial")
      )
    ) ??
    anchorBlockOpening(diagramScope)
  );
}
