/**
 * @fileoverview Translates full class direct-style replacement and clearing.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { ClassId } from "../../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../../shared/style";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../../writeIntent";
import { anchorEntry } from "../../anchors/entryAnchors";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../../anchors/statementAnchors";
import { composeStyleEntries, composeStyleEntry } from "../../syntax/styleSyntax";
import { spellIdentity } from "../../../model/identitySpelling";

/**
 * Makes four groups of writes — each group only under its stated source and value
 * conditions:
 *
 * 1. direct style **statement**, in **diagram body**, when no direct style statement exists
 *    and at least one new property value is non-null (anchored at first match)
 *    - after the latest direct style statement
 *    - after the latest style application statement
 *    - after the latest statement of any kind except spatial annotation statements
 *    - at block opening
 * 2. style property **entry** deleted, for every written property whose new value is null
 * 3. style property **value**, for every written property whose new value is non-null
 *    - in place
 * 4. style property **entry**, for every unwritten property whose new value is non-null
 *    (anchored at first match)
 *    - after the latest style property entry
 *    - at list opening
 *
 * No-op when no direct style statement exists and every new property value is null.
 */
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

/**
 * Makes one group of writes — only where the direct style statement exists:
 *
 * 1. direct style **statement** deleted
 */
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
