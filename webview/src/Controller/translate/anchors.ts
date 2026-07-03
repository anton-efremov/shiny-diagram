/**
 * @fileoverview Placement invariants: anchor a new sibling after the last existing sibling, else after the container opening.
 */

import type {
  ClassDirectStyleRecord,
  ProvenanceIndex,
  SourceLocation,
  StyleDefRecord,
} from "../model/provenanceIndex";
import type {
  BlockRef,
  EntryAnchor,
  StatementAnchor,
  StatementRef,
  StyleListRef,
} from "./writeIntent";

type StatementCandidate = {
  readonly ref: StatementRef;
  readonly location: SourceLocation;
};

type StyleEntryRecord =
  | {
      readonly list: Extract<StyleListRef, { readonly kind: "directStyle" }>;
      readonly record: ClassDirectStyleRecord;
    }
  | {
      readonly list: Extract<StyleListRef, { readonly kind: "styleDef" }>;
      readonly record: StyleDefRecord;
    };

export function anchorAfterLastStatement(
  provenance: ProvenanceIndex,
  container: BlockRef
): StatementAnchor {
  const last = collectStatements(provenance).sort(compareByLocation).at(-1);
  return last
    ? { kind: "afterStatement", statement: last.ref }
    : { kind: "afterBlockOpening", block: container };
}

export function anchorAfterLastEntry(style: StyleEntryRecord): EntryAnchor {
  const last = Object.entries(style.record.fields.properties)
    .filter(
      (
        entry
      ): entry is [keyof typeof style.record.fields.properties, NonNullable<(typeof entry)[1]>] =>
        Boolean(entry[1])
    )
    .sort((left, right) => compareLocations(left[1].entry, right[1].entry))
    .at(-1);

  return last
    ? {
        kind: "afterEntry",
        entry:
          style.list.kind === "directStyle"
            ? {
                kind: "directStyleProperty",
                classId: style.list.classId,
                property: last[0],
              }
            : {
                kind: "styleDefProperty",
                styleDefId: style.list.styleDefId,
                property: last[0],
              },
      }
    : { kind: "afterListOpening", list: style.list };
}

function collectStatements(provenance: ProvenanceIndex): StatementCandidate[] {
  return [
    ...[...provenance.classes.entries()].map(([classId, record]) => ({
      ref: { kind: "class" as const, classId },
      location: record.self,
    })),
    ...[...provenance.namespaces.entries()].map(([namespaceId, record]) => ({
      ref: { kind: "namespace" as const, namespaceId },
      location: record.self,
    })),
    ...[...provenance.members.entries()].map(([memberId, record]) => ({
      ref: { kind: "member" as const, memberId },
      location: record.self,
    })),
    ...[...provenance.relationships.entries()].map(([relationshipId, record]) => ({
      ref: { kind: "relationship" as const, relationshipId },
      location: record.self,
    })),
    ...[...provenance.styleDefinitions.entries()].map(([styleDefId, record]) => ({
      ref: { kind: "styleDefinition" as const, styleDefId },
      location: record.self,
    })),
    ...[...provenance.classDirectStyles.entries()].map(([classId, record]) => ({
      ref: { kind: "classDirectStyle" as const, classId },
      location: record.self,
    })),
    ...[...provenance.styleApplications.entries()].map(([styleApplicationId, record]) => ({
      ref: { kind: "styleApplication" as const, styleApplicationId },
      location: record.self,
    })),
    ...[...provenance.classSpatial.entries()].map(([classId, record]) => ({
      ref: { kind: "classSpatial" as const, classId },
      location: record.self,
    })),
    ...[...provenance.namespaceSpatial.entries()].map(([namespaceId, record]) => ({
      ref: { kind: "namespaceSpatial" as const, namespaceId },
      location: record.self,
    })),
    ...[...provenance.notes.entries()].map(([noteId, record]) => ({
      ref: { kind: "note" as const, noteId },
      location: record.self,
    })),
  ];
}

function compareByLocation(left: StatementCandidate, right: StatementCandidate): number {
  return compareLocations(left.location, right.location);
}

function compareLocations(left: SourceLocation, right: SourceLocation): number {
  return left.startLine - right.startLine || left.startChar - right.startChar;
}
