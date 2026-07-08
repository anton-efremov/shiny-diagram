/**
 * @fileoverview Translates `class.directStyle.property.set`.
 *
 * Emits one logical write intent for changing one direct style property of a class.
 *
 * a. ReplaceValueIntent if entry for requested property exists
 *
 * b. InsertEntryIntent if entry for requested property is missing
 * in direct style declaration statement
 * - Written after the latest property entry in that direct style statement.
 *
 * c. InsertStatementIntent with requested entry if direct style statement is missing
 * - Written after the latest direct style statement in the class's scope.
 * - if no direct style statements - after style assignement statement
 * - Otherwise, after the latest non-spatial-annotation statement
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { StylePropertyName } from "../../../shared/style";
import type { ClassId } from "../../../shared/ids";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import { anchorEntry } from "../anchors/entryAnchors";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { composeStyleEntry } from "../syntax/styleSyntax";
import { spellIdentity } from "../../model/identitySpelling";

export function translateClassDirectStyleSet(
  command: EditorCommandOf<"class.directStyle.property.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.classDirectStyles.get(command.classId);
  const property = record?.fields.properties[command.property];
  const diagramScope: BlockRef = { kind: "diagram" };

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

    const anchor: StatementAnchor =
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
      anchorBlockOpening(diagramScope);
    const insertDirectStyleIntent: WriteIntent = {
      kind: "insertStatement",
      payload: composeClassDirectStyle(command.classId, command.property, command.value),
      anchor,
    };

    return [insertDirectStyleIntent];
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
  return `style ${spellIdentity(classId)} ${composeStyleEntry(property, value)}`;
}
