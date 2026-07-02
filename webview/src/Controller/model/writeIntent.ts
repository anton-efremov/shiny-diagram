/**
 * @fileoverview
 * `WriteIntent` — the contract between the **translate** and **resolve** layers.
 *
 * A `WriteIntent` pairs two orthogonal facts:
 *   - `payload` — WHAT text goes in (or `null` to delete). Always **zero-indent**,
 *     `\n`-joined, with syntactic form already decided (short vs block). The
 *     payload is either rendered from the graph or lifted verbatim from
 *     provenance `.raw` (a move) — the resolve layer cannot tell which, and
 *     does not need to.
 *   - `location` — WHERE it lands, expressed relative to an existing
 *     `SourceConstruct` (or a sub-line `ConstructSpan`). Never a position.
 *
 * Layer boundary:
 *   - **translate** produces `WriteIntent[]`: reads graph (for content) and the
 *     anchor's provenance entry (for syntactic form), emits zero-indent payloads
 *     against logical locations. No positions, no indentation strings, no EOL.
 *   - **resolve** consumes `WriteIntent[]`: turns each location into a
 *     `SourceLocation`, derives base indent from the located construct, applies
 *     the document EOL, and lowers to `SourceEdit[]`.
 *
 * The whole transaction is translated against one snapshot and resolved
 * together; because locations are logical, all positions are captured before
 * any edit applies, so no intent invalidates another's positions. (Creates are
 * fat and the View never allocates identity, so no intent can forward-reference
 * a construct another intent creates — hence no mid-transaction reparse.)
 *
 * Action shapes, expressed as (payload, location) combinations:
 *   - insert  → payload = text,        location = after | atStartOf
 *   - replace → payload = text,        location = over
 *   - delete  → payload = null,        location = over
 *   - move    → payload = raw (lifted), location = after | atStartOf,
 *               PLUS a second intent { payload: null, location: over(source) }
 *   - patch   → payload = text,        location = within (a ConstructSpan)
 *
 * `move` is not a primitive: the translate layer lifts the source construct's
 * raw text into the payload and emits the insert + delete pair. This keeps
 * content uniformly textual and constructs uniformly for addressing.
 */

import type { ConstructSpan } from "./constructSpan";
import type { SourceConstruct } from "./sourceConstruct";

// ============================================================================
// Location
// ============================================================================

/** Position after an existing construct. Base indent = the construct's indent
 *  (a new sibling sits at the same depth). */
export type AfterLocation = {
  readonly kind: "after";
  readonly construct: SourceConstruct;
};

/** First child inside a body construct. Base indent = the body's interior
 *  indent (parent depth + one unit). Used when no sibling exists to anchor to. */
export type AtStartOfLocation = {
  readonly kind: "atStartOf";
  readonly construct: SourceConstruct;
};

/** Occupy a construct's full span. Payload text replaces it; `null` deletes it. */
export type OverLocation = {
  readonly kind: "over";
  readonly construct: SourceConstruct;
};

/** Occupy a sub-line field span. The surgical patch path (single style value,
 *  single spatial coordinate, one identifier occurrence). */
export type WithinLocation = {
  readonly kind: "within";
  readonly span: ConstructSpan;
};

/** Where a payload lands. `kind` is also the rule the resolve layer uses to
 *  derive base indentation. */
export type WriteLocation =
  | AfterLocation
  | AtStartOfLocation
  | OverLocation
  | WithinLocation;

// ============================================================================
// Intent
// ============================================================================

/**
 * A single write. `payload`:
 *   - non-null string → zero-indent source to render at `location`
 *     (rendered from graph, or raw text lifted from provenance for a move);
 *   - `null` → delete the span `location` addresses (`over` / `within` only).
 */
export type WriteIntent = {
  readonly payload: string | null;
  readonly location: WriteLocation;
};
