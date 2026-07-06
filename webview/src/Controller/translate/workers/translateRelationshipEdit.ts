/**
 * @fileoverview Translates relationship edits and deletion into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { RelationshipId } from "../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../shared/uml";
import type { RelationshipEdge } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { StatementAnchor, StatementRef, WriteIntent } from "../writeIntent";
import { anchorBlockOpening } from "../anchors/statementAnchors";
import { composeRelationshipOperator, composeRelationshipStatement } from "./relationshipSyntax";

export function translateRelationshipDelete(
  command: EditorCommandOf<"relationship.delete">
): WriteIntent[] {
  return [
    {
      kind: "deleteStatement",
      target: { kind: "relationship", relationshipId: command.relationshipId },
    },
  ];
}

export function translateRelationshipSourceClassSet(
  command: EditorCommandOf<"relationship.source.class.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: {
        kind: "relationshipEndpoint",
        relationshipId: command.relationshipId,
        side: "source",
      },
      payload: command.classId,
    },
  ];
}

export function translateRelationshipTargetClassSet(
  command: EditorCommandOf<"relationship.target.class.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: {
        kind: "relationshipEndpoint",
        relationshipId: command.relationshipId,
        side: "target",
      },
      payload: command.classId,
    },
  ];
}

export function translateRelationshipSourceEndpointKindSet(
  command: EditorCommandOf<"relationship.source.endpointKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  return replaceOperator(command.relationshipId, relationship, {
    sourceEndpointKind: command.endpointKind,
  });
}

export function translateRelationshipTargetEndpointKindSet(
  command: EditorCommandOf<"relationship.target.endpointKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  return replaceOperator(command.relationshipId, relationship, {
    targetEndpointKind: command.endpointKind,
  });
}

export function translateRelationshipLineKindSet(
  command: EditorCommandOf<"relationship.lineKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  return replaceOperator(command.relationshipId, relationship, { lineKind: command.lineKind });
}

export function translateRelationshipOperatorPatch(
  relationshipId: RelationshipId,
  graph: DiagramGraph,
  patch: Partial<{
    readonly sourceEndpointKind: RelationshipEndpointKind;
    readonly targetEndpointKind: RelationshipEndpointKind;
    readonly lineKind: RelationshipLineKind;
  }>
): WriteIntent[] {
  const relationship = graph.relationships.get(relationshipId);
  if (!relationship) return [];
  return replaceOperator(relationshipId, relationship, patch);
}

export function translateRelationshipSourceMultiplicitySet(
  command: EditorCommandOf<"relationship.source.multiplicity.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.source.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceMultiplicity(command.relationshipId, "source", command.multiplicity);
  }
  return rewriteRelationship(command.relationshipId, graph, provenance, {
    sourceMultiplicity: command.multiplicity,
  });
}

export function translateRelationshipTargetMultiplicitySet(
  command: EditorCommandOf<"relationship.target.multiplicity.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.target.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceMultiplicity(command.relationshipId, "target", command.multiplicity);
  }
  return rewriteRelationship(command.relationshipId, graph, provenance, {
    targetMultiplicity: command.multiplicity,
  });
}

export function translateRelationshipLabelSet(
  command: EditorCommandOf<"relationship.label.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  if (relationship.label === command.label) return [];
  if (relationship.label !== null && command.label !== null) {
    return [
      {
        kind: "replaceValue",
        target: { kind: "relationshipLabel", relationshipId: command.relationshipId },
        payload: command.label,
      },
    ];
  }
  return rewriteRelationship(command.relationshipId, graph, provenance, { label: command.label });
}

function replaceOperator(
  relationshipId: RelationshipId,
  relationship: RelationshipEdge,
  patch: Partial<{
    readonly sourceEndpointKind: RelationshipEndpointKind;
    readonly targetEndpointKind: RelationshipEndpointKind;
    readonly lineKind: RelationshipLineKind;
  }>
): WriteIntent[] {
  const operator = composeRelationshipOperator({
    sourceEndpointKind: patch.sourceEndpointKind ?? relationship.source.endpointKind,
    targetEndpointKind: patch.targetEndpointKind ?? relationship.target.endpointKind,
    lineKind: patch.lineKind ?? relationship.lineKind,
  });
  return [
    {
      kind: "replaceValue",
      target: { kind: "relationshipOperator", relationshipId },
      payload: operator,
    },
  ];
}

function replaceMultiplicity(
  relationshipId: RelationshipId,
  side: "source" | "target",
  multiplicity: string
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "relationshipMultiplicity", relationshipId, side },
      payload: `"${multiplicity}"`,
    },
  ];
}

type RelationshipRewritePatch = Partial<{
  readonly sourceMultiplicity: string | null;
  readonly targetMultiplicity: string | null;
  readonly label: string | null;
}>;

function rewriteRelationship(
  relationshipId: RelationshipId,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  patch: RelationshipRewritePatch
): WriteIntent[] {
  const relationship = graph.relationships.get(relationshipId);
  if (!relationship) return [];
  return [
    {
      kind: "insertStatement",
      payload: composeRelationshipStatement({
        sourceClassId: relationship.source.classId,
        targetClassId: relationship.target.classId,
        sourceEndpointKind: relationship.source.endpointKind,
        targetEndpointKind: relationship.target.endpointKind,
        lineKind: relationship.lineKind,
        sourceMultiplicity: patchedValue(
          patch,
          "sourceMultiplicity",
          relationship.source.multiplicity
        ),
        targetMultiplicity: patchedValue(
          patch,
          "targetMultiplicity",
          relationship.target.multiplicity
        ),
        label: patchedValue(patch, "label", relationship.label),
      }),
      anchor: anchorBeforeRelationship(relationshipId, provenance),
    },
    {
      kind: "deleteStatement",
      target: { kind: "relationship", relationshipId },
    },
  ];
}

function hasPatch<Prop extends string>(patch: Partial<Record<Prop, unknown>>, prop: Prop): boolean {
  return Object.prototype.hasOwnProperty.call(patch, prop);
}

function patchedValue(
  patch: RelationshipRewritePatch,
  prop: keyof RelationshipRewritePatch,
  fallback: string | null
): string | null {
  return hasPatch(patch, prop) ? (patch[prop] ?? null) : fallback;
}

function anchorBeforeRelationship(
  relationshipId: RelationshipId,
  provenance: ProvenanceIndex
): StatementAnchor {
  const target = provenance.relationships.get(relationshipId);
  if (!target) return anchorBlockOpening({ kind: "diagram" });

  let previous: { readonly ref: StatementRef; readonly location: SourceSpan } | null = null;
  for (const candidate of statementCandidates(provenance)) {
    if (sameStart(candidate.location, target.self)) continue;
    if (compareLocations(candidate.location, target.self) >= 0) continue;
    if (previous === null || compareLocations(candidate.location, previous.location) > 0) {
      previous = candidate;
    }
  }

  return previous === null
    ? anchorBlockOpening({ kind: "diagram" })
    : {
        kind: previous.ref.kind === "relationship" ? "afterSameKind" : "afterDifferentKind",
        statement: previous.ref,
      };
}

function statementCandidates(
  provenance: ProvenanceIndex
): Array<{ readonly ref: StatementRef; readonly location: SourceSpan }> {
  return [
    ...[...provenance.classes.entries()].map(([classId, record]) => ({
      ref: { kind: "class" as const, classId },
      location: record.self,
    })),
    ...[...provenance.namespaces.entries()].map(([namespaceId, record]) => ({
      ref: { kind: "namespace" as const, namespaceId },
      location: record.self,
    })),
    ...[...provenance.blockMembers.entries()].map(([memberId, record]) => ({
      ref: { kind: "blockMember" as const, memberId },
      location: record.self,
    })),
    ...[...provenance.shortMembers.entries()].map(([memberId, record]) => ({
      ref: { kind: "shortMember" as const, memberId },
      location: record.self,
    })),
    ...[...provenance.relationships.entries()].map(([candidateRelationshipId, record]) => ({
      ref: { kind: "relationship" as const, relationshipId: candidateRelationshipId },
      location: record.self,
    })),
    ...[...provenance.lollipopInterfaces.entries()].map(([lollipopInterfaceId, record]) => ({
      ref: { kind: "lollipopInterface" as const, lollipopInterfaceId },
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

function sameStart(left: SourceSpan, right: SourceSpan): boolean {
  return left.start.line === right.start.line && left.start.character === right.start.character;
}

function compareLocations(left: SourceSpan, right: SourceSpan): number {
  return (
    left.start.line - right.start.line ||
    left.start.character - right.start.character ||
    left.end.line - right.end.line ||
    left.end.character - right.end.character
  );
}
