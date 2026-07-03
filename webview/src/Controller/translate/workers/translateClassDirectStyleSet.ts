/**
 * @fileoverview Translates class.directStyle.property.set: replace an existing value, insert an entry into an existing style line, insert a new style line, or delete an entry.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { StylePropertyName } from "../../../shared/style";
import type { ClassId } from "../../../shared/ids";
import type { WriteIntent } from "../writeIntent";
import { anchorEntry } from "../anchors/anchorEntry";
import { anchorStatement } from "../anchors/anchorStatement";
import { composeStyleEntry } from "../syntax/styleSyntax";

export function translateClassDirectStyleSet(
  command: EditorCommandOf<"class.directStyle.property.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.classDirectStyles.get(command.classId);
  const property = record?.fields.properties[command.property];

  if (command.value !== null) {
    if (property) {
      return [
        {
          kind: "replaceValue",
          target: {
            kind: "directStylePropertyValue",
            classId: command.classId,
            property: command.property,
          },
          payload: command.value,
        },
      ];
    }

    if (record) {
      return [
        {
          kind: "insertEntry",
          payload: composeStyleEntry(command.property, command.value),
          anchor: anchorEntry(provenance, { kind: "directStyle", classId: command.classId }),
        },
      ];
    }

    return [
      {
        kind: "insertStatement",
        payload: composeClassDirectStyle(command.classId, command.property, command.value),
        anchor: anchorStatement(graph, provenance, { kind: "diagram" }, ["classDirectStyle"]),
      },
    ];
  }

  return property
    ? [
        {
          kind: "deleteEntry",
          target: {
            kind: "directStyleProperty",
            classId: command.classId,
            property: command.property,
          },
        },
      ]
    : [];
}

function composeClassDirectStyle(
  classId: ClassId,
  property: StylePropertyName,
  value: string
): string {
  return `style ${classId} ${composeStyleEntry(property, value)}`;
}
