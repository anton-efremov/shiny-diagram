/**
 * @fileoverview Translates set-style and set-spatial commands.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { EntryAnchor, StatementAnchor, WriteIntent } from "../writeIntent";
import {
  composeClassDirectStyle,
  composeSpatialAnnotation,
  composeStyleEntry,
  composeStyleValue,
} from "../composeFragment";

export function translateSpatialSet(
  command: EditorCommandOf<"class.spatial.set">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  if (command.spatial) {
    if (provenance.classSpatial.has(command.classId)) {
      return [
        { coord: "x" as const, value: Math.round(command.spatial.position.x) },
        { coord: "y" as const, value: Math.round(command.spatial.position.y) },
        { coord: "w" as const, value: command.spatial.size.width },
        { coord: "h" as const, value: command.spatial.size.height },
      ].map(({ coord, value }) => ({
        kind: "replaceValue",
        target: {
          kind: "spatialCoord",
          target: { kind: "class", classId: command.classId },
          coord,
        },
        payload: composeStyleValue(value),
      }));
    }

    return [
      {
        kind: "insertStatement",
        payload: composeSpatialAnnotation(command.classId, command.spatial),
        anchor: chooseSpatialInsertAnchor(provenance),
      },
    ];
  }

  return provenance.classSpatial.has(command.classId)
    ? [{ kind: "deleteStatement", target: { kind: "classSpatial", classId: command.classId } }]
    : [];
}

export function translateDirectStyleSet(
  command: EditorCommandOf<"class.directStyle.property.set">,
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
          payload: composeStyleValue(command.value),
        },
      ];
    }

    if (record) {
      return [
        {
          kind: "insertEntry",
          payload: composeStyleEntry(command.property, command.value),
          anchor: chooseStyleEntryAnchor(command, record),
        },
      ];
    }

    return [
      {
        kind: "insertStatement",
        payload: composeClassDirectStyle(command.classId, command.property, command.value),
        anchor: chooseSpatialInsertAnchor(provenance),
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

function chooseStyleEntryAnchor(
  command: EditorCommandOf<"class.directStyle.property.set">,
  record: NonNullable<ReturnType<ProvenanceIndex["classDirectStyles"]["get"]>>
): EntryAnchor {
  const last = Object.entries(record.fields.properties)
    .filter((entry): entry is [typeof command.property, NonNullable<(typeof entry)[1]>] =>
      Boolean(entry[1])
    )
    .sort((left, right) => left[1].entry.startChar - right[1].entry.startChar)
    .at(-1);

  return last
    ? {
        kind: "afterEntry",
        entry: { kind: "directStyleProperty", classId: command.classId, property: last[0] },
      }
    : { kind: "afterListOpening", list: { kind: "directStyle", classId: command.classId } };
}

function chooseSpatialInsertAnchor(provenance: ProvenanceIndex): StatementAnchor {
  const lastSpatial = [...provenance.classSpatial.entries()]
    .sort((left, right) => left[1].self.startLine - right[1].self.startLine)
    .at(-1);
  if (lastSpatial) {
    return { kind: "afterStatement", statement: { kind: "classSpatial", classId: lastSpatial[0] } };
  }
  return { kind: "afterBlockOpening", block: { kind: "diagram" } };
}
