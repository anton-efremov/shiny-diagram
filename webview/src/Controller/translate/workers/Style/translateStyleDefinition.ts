/**
 * @fileoverview Translates style definition lifecycle, rename, and property edits.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import { toStyleDefId, type ClassId, type StyleDefId } from "../../../../shared/ids";
import type { StyleProperties } from "../../../../shared/style";
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
import type { TranslateContext } from "../../translateContext";

/**
 * Makes two groups of writes:
 *
 * 1. style definition **statement**, in **diagram body** (anchored at first match)
 *    - after the latest style definition statement
 *    - after the latest direct style or style application statement
 *    - after the latest statement of any kind except spatial annotation statements
 *    - at block opening
 * 2. style application **statement**, in **diagram body**, for every requested target class
 *    (anchored at first match)
 *    - after the latest style application statement
 *    - after the latest style definition or direct style statement
 *    - after the latest statement of any kind except spatial annotation statements
 *    - at block opening
 *
 * `sourceKind` is currently ignored; a classDef statement is always written.
 */
export function translateStyleDefinitionCreate(
  command: EditorCommandOf<"style.definition.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  assertNamedStyleName(command.name);
  const styleDefId = toStyleDefId(command.name);
  context.recordStyleCreated(styleDefId);
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

/**
 * Makes two groups of writes — each group only where the statement exists:
 *
 * 1. style definition **statement** deleted
 * 2. style application **statement** deleted, for every application naming the style
 *    definition
 */
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

/**
 * Makes two groups of writes:
 *
 * 1. style definition name **value**
 *    - in place
 * 2. style application name **value**, for every style application statement naming the style
 *    definition
 *    - in place
 */
export function translateStyleDefinitionNameSet(
  command: EditorCommandOf<"style.definition.name.set">,
  graph: DiagramGraph,
  context: TranslateContext
): WriteIntent[] {
  assertNamedStyleName(command.name);
  context.recordStyleRenamed(command.styleDefId, toStyleDefId(command.name));
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

function assertNamedStyleName(name: string): void {
  if (name === "default") {
    throw new Error('The Mermaid "default" pseudo-style is foreign and cannot be emitted.');
  }
}

/**
 * Makes one of three write options:
 *
 * a. style property entry already written and new value non-null → style property **value**
 *    - in place
 * b. style property entry absent and new value non-null → style property **entry** (anchored
 *    at first match)
 *    - after the latest style property entry
 *    - at list opening
 * c. otherwise → style property **entry** deleted
 *
 * No-op when the style definition statement is missing, or when the style property entry is
 * absent and the new value is null.
 */
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
  return `class ${spellIdentity(classId)}:::${styleDefId}`;
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
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial")
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
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial")
      )
    ) ??
    anchorBlockOpening(diagramScope)
  );
}
