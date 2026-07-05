/**
 * @fileoverview Translates style definition lifecycle, rename, and property edits.
 */

import type { EditorCommandOf } from "../../../View/commands";
import { toStyleDefId, type ClassId, type StyleDefId } from "../../../shared/ids";
import type { StyleProperties } from "../../../shared/style";
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

export function translateStyleDefinitionCreate(
  command: EditorCommandOf<"style.definition.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const styleDefId = toStyleDefId(command.name);
  const classDef = composeStyleDefinition(styleDefId, command.properties);
  return [
    {
      kind: "insertStatement",
      payload: classDef,
      anchor: toStyleDefinitionAnchor(graph, provenance),
    },
    ...command.applyToClassIds.map(
      (classId): WriteIntent => ({
        kind: "insertStatement",
        payload: composeClassStyleApplication(classId, styleDefId),
        anchor: toStyleApplicationAnchor(graph, provenance),
      })
    ),
  ];
}

export function translateStyleDefinitionDelete(
  command: EditorCommandOf<"style.definition.delete">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return [
    ...(provenance.styleDefinitions.has(command.styleDefId)
      ? [
          {
            kind: "deleteStatement" as const,
            target: { kind: "styleDefinition" as const, styleDefId: command.styleDefId },
          },
        ]
      : []),
    ...[...graph.styleApplications.values()].flatMap((styleApplication): WriteIntent[] =>
      styleApplication.styleDefId === command.styleDefId
        ? [
            {
              kind: "deleteStatement",
              target: { kind: "styleApplication", styleApplicationId: styleApplication.id },
            },
          ]
        : []
    ),
  ];
}

export function translateStyleDefinitionNameSet(
  command: EditorCommandOf<"style.definition.name.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "styleDefName", styleDefId: command.styleDefId },
      payload: command.name,
    },
    ...[...graph.styleApplications.values()].flatMap((styleApplication): WriteIntent[] =>
      styleApplication.styleDefId === command.styleDefId
        ? [
            {
              kind: "replaceValue",
              target: { kind: "styleApplicationName", styleApplicationId: styleApplication.id },
              payload: command.name,
            },
          ]
        : []
    ),
  ];
}

export function translateStyleDefinitionPropertySet(
  command: EditorCommandOf<"style.definition.property.set">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.styleDefinitions.get(command.styleDefId);
  const property = record?.fields.properties[command.property];
  if (!record) return [];

  if (command.value !== null) {
    if (property) {
      return [
        {
          kind: "replaceValue",
          target: {
            kind: "styleDefPropertyValue",
            styleDefId: command.styleDefId,
            property: command.property,
          },
          payload: command.value,
        },
      ];
    }
    return [
      {
        kind: "insertEntry",
        payload: composeStyleEntry(command.property, command.value),
        anchor: anchorEntry(provenance, { kind: "styleDef", styleDefId: command.styleDefId }),
      },
    ];
  }

  return property
    ? [
        {
          kind: "deleteEntry",
          target: {
            kind: "styleDefProperty",
            styleDefId: command.styleDefId,
            property: command.property,
          },
        },
      ]
    : [];
}

function composeStyleDefinition(styleDefId: StyleDefId, properties: StyleProperties): string {
  return `classDef ${styleDefId} ${composeStyleEntries(properties)}`;
}

function composeClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${classId}:::${styleDefId}`;
}

function toStyleDefinitionAnchor(
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["styleDefinition"])) ??
    asDifferentKind(
      anchorAfterKindList(graph, provenance, diagramScope, ["classDirectStyle", "styleApplication"])
    ) ??
    asDifferentKind(
      anchorAfterKindList(
        graph,
        provenance,
        diagramScope,
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial" && kind !== "namespaceSpatial")
      )
    ) ??
    anchorBlockOpening(diagramScope)
  );
}

function toStyleApplicationAnchor(
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["styleApplication"])) ??
    asDifferentKind(
      anchorAfterKindList(graph, provenance, diagramScope, ["styleDefinition", "classDirectStyle"])
    ) ??
    asDifferentKind(
      anchorAfterKindList(
        graph,
        provenance,
        diagramScope,
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial" && kind !== "namespaceSpatial")
      )
    ) ??
    anchorBlockOpening(diagramScope)
  );
}
