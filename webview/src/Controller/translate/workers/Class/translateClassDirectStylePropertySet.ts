import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { StylePropertyName } from "../../../../shared/style";
import type { ClassId } from "../../../../shared/ids";
import type { BlockRef, StatementAnchor, WriteIntent } from "../../writeIntent";
import { anchorEntry } from "../../anchors/entryAnchors";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../../anchors/statementAnchors";
import { composeStyleEntry } from "../../syntax/styleSyntax";
import { spellIdentity } from "../../../model/identitySpelling";

/**
 * Makes one of three write options:
 *
 * a. property entry already written → style property **value**
 *    - in place
 * b. direct style statement exists → style property **entry**
 *    - after the latest entry in that statement
 * c. otherwise → direct style **statement** carrying the entry, in **diagram body**
 *    (anchored at first match)
 *    - after the latest direct style statement
 *    - after the latest style application statement
 *    - after the latest statement of any kind except spatial annotation statements
 *    - at block opening
 *
 * Deletes the entry when value is null; no-op if it was never written.
 */
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
