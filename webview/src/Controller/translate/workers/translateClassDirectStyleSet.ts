/**
 * @fileoverview Translates full class direct-style replacement and clearing.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { ClassId } from "../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../shared/style";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import { anchorEntry } from "../anchors/entryAnchors";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { composeStyleEntries, composeStyleEntry } from "../syntax/styleSyntax";
import { spellIdentity } from "../../model/identitySpelling";

export function translateClassDirectStyleSet(
  command: EditorCommandOf<"class.directStyle.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.classDirectStyles.get(command.classId);
  if (!record) {
    const payload = composeClassDirectStyle(command.classId, command.properties);
    return payload === null
      ? []
      : [{ kind: "insertStatement", payload, anchor: toClassDirectStyleAnchor(graph, provenance) }];
  }

  return STYLE_PROPERTIES.flatMap(({ name }): WriteIntent[] => {
    const existing = record.fields.properties[name];
    const value = command.properties[name];
    if (value === null) {
      return existing
        ? [
            {
              kind: "deleteEntry",
              target: { kind: "directStyleProperty", classId: command.classId, property: name },
            },
          ]
        : [];
    }
    if (existing) {
      return [
        {
          kind: "replaceValue",
          target: { kind: "directStylePropertyValue", classId: command.classId, property: name },
          payload: value,
        },
      ];
    }
    return [
      {
        kind: "insertEntry",
        payload: composeStyleEntry(name, value),
        anchor: anchorEntry(provenance, { kind: "directStyle", classId: command.classId }),
      },
    ];
  });
}

export function translateClassDirectStyleClear(
  command: EditorCommandOf<"class.directStyle.clear">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return provenance.classDirectStyles.has(command.classId)
    ? [{ kind: "deleteStatement", target: { kind: "classDirectStyle", classId: command.classId } }]
    : [];
}

function composeClassDirectStyle(classId: ClassId, properties: StyleProperties): string | null {
  const entries = composeStyleEntries(properties);
  return entries === "" ? null : `style ${spellIdentity(classId)} ${entries}`;
}

function toClassDirectStyleAnchor(
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["classDirectStyle"])) ??
    asDifferentKind(anchorAfterKindList(graph, provenance, diagramScope, ["styleApplication"])) ??
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
