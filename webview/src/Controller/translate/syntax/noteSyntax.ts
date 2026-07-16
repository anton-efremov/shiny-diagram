/**
 * @fileoverview Spells Mermaid note statements and Shiny @note annotations.
 */

import type { SpatialAttachment } from "../../../shared/geometry";
import type { ClassId } from "../../../shared/ids";
import { spellIdentity } from "../../model/identitySpelling";

export type NoteStatementPayload = {
  readonly text: string;
  readonly attachedToClassId: ClassId | null;
};

export function composeNoteStatement(payload: NoteStatementPayload): string {
  const target = payload.attachedToClassId
    ? `for ${spellIdentity(payload.attachedToClassId)} `
    : "";
  return `note ${target}"${composeNoteText(payload.text)}"`;
}

export function composeNoteText(text: string): string {
  return text.replace(/\r\n?|\n/g, String.raw`\n`);
}

export function composeNoteAnnotation(spatial: SpatialAttachment): string {
  const x = Math.round(spatial.position.x);
  const y = Math.round(spatial.position.y);
  return `%% @note: x=${x} y=${y} w=${spatial.size.width} h=${spatial.size.height}`;
}
