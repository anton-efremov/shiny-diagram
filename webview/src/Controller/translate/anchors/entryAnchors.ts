/**
 * @fileoverview
 * Generic entry insertion anchor.
 *
 * Simpler than statement anchoring, and for one structural reason: an entry's
 * container is always its own style list, so there is no block-membership rule
 * and no fallback kinds — the candidates are exactly that list's existing
 * properties, read from `ProvenanceIndex`.
 *
 * A new entry is anchored after the latest existing property in the list. If the
 * list has no property yet, it is anchored after the list opening.
 */

import type {
  ProvenanceIndex,
  StylePropertyField,
  StylePropertyFields,
} from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import type { StylePropertyName } from "../../../shared/style";
import type { EntryAnchor, EntryRef, StyleListRef } from "../writeIntent";

type AnchorCandidate = { readonly ref: EntryRef; readonly location: SourceSpan };

export function anchorEntry(provenance: ProvenanceIndex, list: StyleListRef): EntryAnchor {
  const last = anchorCandidatesOfList(list, provenance)
    .sort((left, right) => compareLocations(left.location, right.location))
    .at(-1);

  return last ? { kind: "afterEntry", entry: last.ref } : { kind: "afterListOpening", list };
}

// ============================================================================
// Enumeration — the explicit properties of a list, tagged with their location
// ============================================================================

function anchorCandidatesOfList(
  list: StyleListRef,
  provenance: ProvenanceIndex
): AnchorCandidate[] {
  switch (list.kind) {
    case "directStyle":
      return candidatesFrom(
        provenance.classDirectStyles.get(list.classId)?.fields.properties,
        (property) => ({ kind: "directStyleProperty", classId: list.classId, property })
      );
    case "styleDef":
      return candidatesFrom(
        provenance.styleDefinitions.get(list.styleDefId)?.fields.properties,
        (property) => ({ kind: "styleDefProperty", styleDefId: list.styleDefId, property })
      );
  }
}

/** Wraps a list's present property fields as candidates, pairing each ref with its `entry` location. */
function candidatesFrom(
  properties: StylePropertyFields | undefined,
  toRef: (property: StylePropertyName) => EntryRef
): AnchorCandidate[] {
  return presentProperties(properties).map(([property, field]) => ({
    ref: toRef(property),
    location: field.entry,
  }));
}

/** The `(name, field)` pairs that are actually present, narrowed past the `Partial` optionality. */
function presentProperties(
  properties: StylePropertyFields | undefined
): [StylePropertyName, StylePropertyField][] {
  if (!properties) {
    return [];
  }
  const entries = Object.entries(properties) as [
    StylePropertyName,
    StylePropertyField | undefined,
  ][];
  return entries.filter(
    (entry): entry is [StylePropertyName, StylePropertyField] => entry[1] !== undefined
  );
}

// ============================================================================
// Ordering
// ============================================================================

function compareLocations(left: SourceSpan, right: SourceSpan): number {
  return (
    left.start.line - right.start.line ||
    left.start.character - right.start.character ||
    left.end.line - right.end.line ||
    left.end.character - right.end.character
  );
}
