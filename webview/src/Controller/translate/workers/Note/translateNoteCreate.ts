/**
 * @fileoverview Translates `note.create`.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import { composeNoteId } from "../../../model/noteIdentity";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../../anchors/statementAnchors";
import { insertNotePair } from "../../placement/notePairPlacement";
import type { TranslateContext } from "../../translateContext";
import type { BlockRef, StatementAnchor, WriteIntent } from "../../writeIntent";

export function translateNoteCreate(
  command: EditorCommandOf<"note.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  // Appending after the last note makes the created ordinal predictable from
  // current note count. As with relationship creates, mixing note creates and
  // note deletes in one transaction can make the reported created ordinal stale;
  // no current journey produces that mix.
  context.recordNoteCreated(composeNoteId(graph.notes.size + context.noteCreateCount()));
  return insertNotePair(
    { text: command.text, attachedToClassId: command.attachedToClassId },
    command.spatial,
    toNoteCreateAnchor(graph, provenance)
  );
}

function toNoteCreateAnchor(graph: DiagramGraph, provenance: ProvenanceIndex): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["note"])) ??
    asDifferentKind(anchorAfterKindList(graph, provenance, diagramScope, STATEMENT_KINDS)) ??
    anchorBlockOpening(diagramScope)
  );
}
