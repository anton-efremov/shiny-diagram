/**
 * @fileoverview
 * `ConstructSpan` — sub-line addressing, for surgical field patches.
 *
 * A `SourceConstruct` addresses a whole line or block; the finest edit it can
 * express is "replace this entire line". `ConstructSpan` addresses a **span
 * inside** a line so writeback can patch one field without regenerating the
 * rest — e.g. change the `fill` value in `style User fill:#f9f,stroke:#333`
 * while leaving `stroke` and its formatting untouched.
 *
 * Logical, not character-based (deliberately): a span names the *field*
 * (`the fill value of User's style`), and the **resolve** layer locates its
 * exact byte range via sub-line entries in `ProvenanceIndex`. Character
 * offsets never appear in the translate layer — that keeps position math on
 * the formatting side of the layer boundary.
 *
 * Consumed by the `within` variant of `WriteLocation`. The coarse counterpart
 * is `over` a whole-line construct (regenerates the line, normalizes spacing);
 * `within` is the surgical path (patches one field, preserves everything else).
 * The translate layer chooses per command.
 *
 * Provenance obligation: every field addressable here must have its value/token
 * range recorded at parse time (per style property, per spatial coordinate,
 * per identifier occurrence).
 */

import type { ClassId, NamespaceId, StyleDefId } from "../../shared/ids";
import type { StylePropertyName } from "../../shared/style";
import type { SourceConstruct } from "./sourceConstruct";

// ============================================================================
// Identifier roles — the identifier occurrences a rename cascade rewrites
// ============================================================================

/**
 * Which identifier occurrence within a construct a span addresses. A rename
 * (`*.name.set`) fans out into one `within(identifier ...)` patch per
 * occurrence that references the renamed node.
 */
export type IdentifierRole =
  | "declaredName" // `User` in `class User`, `Domain` in `namespace Domain`
  | "spatialTarget" // `User` in `%% @spatial:User ...`
  | "relationshipSourceEndpoint" // left side of `A --> B`
  | "relationshipTargetEndpoint" // right side of `A --> B`
  | "styleApplicationTarget" // `User` in `class User:::Important`
  | "namespacePathSegment"; // one segment of a `Root.Child` dotted path

// ============================================================================
// Span variants
// ============================================================================

/** One property's *value* within a class direct-style line.
 *  Span covers `#f9f` in `... fill:#f9f ...`. */
export type StyleValueSpan = {
  readonly kind: "styleValue";
  readonly classId: ClassId;
  readonly property: StylePropertyName;
};

/** One property's *value* within a style-definition line.
 *  Span covers `#f9f` in `classDef Important fill:#f9f`. */
export type StyleDefValueSpan = {
  readonly kind: "styleDefValue";
  readonly styleDefId: StyleDefId;
  readonly property: StylePropertyName;
};

/** One coordinate within a spatial annotation line.
 *  Span covers the number after `x=` / `y=` / `w=` / `h=`. */
export type SpatialFieldSpan = {
  readonly kind: "spatialField";
  readonly targetId: ClassId | NamespaceId;
  readonly field: "x" | "y" | "w" | "h";
};

/** One identifier occurrence within a construct, for rename cascades.
 *  `of` is the construct the occurrence lives on; `role` picks which token. */
export type IdentifierSpan = {
  readonly kind: "identifier";
  readonly of: SourceConstruct;
  readonly role: IdentifierRole;
};

// ============================================================================
// Union
// ============================================================================

/** An addressable span inside a construct's line. Resolves to a sub-line
 *  `SourceLocation` via `ProvenanceIndex`. */
export type ConstructSpan =
  | StyleValueSpan
  | StyleDefValueSpan
  | SpatialFieldSpan
  | IdentifierSpan;
