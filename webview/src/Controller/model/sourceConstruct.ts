/**
 * @fileoverview
 * `SourceConstruct` — the addressing vocabulary for writeback.
 *
 * A `SourceConstruct` is a **pointer** to a syntactic span that currently
 * exists in the source: a `kind` plus the id of the graph fact it belongs to.
 * It carries no text and no values — it is a *question* asked of the
 * `ProvenanceIndex`, whose entry is the *answer* (location, form, indent).
 *
 * Role in the pipeline (View → Source):
 *   - The **translate** layer names constructs to say *where* a write lands
 *     (`WriteLocation`) and *what* existing span to move or delete.
 *   - The **resolve** layer turns each construct into a concrete
 *     `SourceLocation` via `ProvenanceIndex`, then into a `SourceEdit`.
 *
 * Constructs never appear in write *content*. Content is always text
 * (rendered from the graph, or lifted verbatim from provenance `.raw`).
 * Constructs are strictly for **addressing**.
 *
 * Design notes:
 *   - **header vs definition** — a class/namespace id is ambiguous between the
 *     header line (`class User`) and the whole extent (`class User { ... }`).
 *     The two are distinct constructs because writeback targets them
 *     differently: replace a header to normalize a body; move/delete a
 *     definition to relocate or remove the whole thing.
 *   - **body containers** — the *interior* of a block is addressable so a
 *     first child can anchor to it (`atStartOf`) when no sibling exists. These
 *     replace the earlier separate "scope" concept: a scope is just a body
 *     construct.
 *   - **memberLine is one kind** — a member occupies one source line whichever
 *     form it takes (`class User { +name }` vs `User : +name`). Which form is
 *     recorded in the provenance entry, not in the construct.
 */

import type {
  AttributeId,
  ClassId,
  MethodId,
  NamespaceId,
  NoteId,
  RelationshipId,
  StyleApplicationId,
  StyleDefId,
} from "../../shared/ids";

// ============================================================================
// Line constructs — a single source line each
// ============================================================================

/** A class attribute or method line. Form (short/block) lives in provenance.
 *  Mermaid: `+string name` (block) OR `User : +string name` (short). */
export type MemberLineConstruct = {
  readonly kind: "memberLine";
  readonly memberId: AttributeId | MethodId;
};

/** A relationship line. Mermaid: `User --> Session : owns`. */
export type RelationshipLineConstruct = {
  readonly kind: "relationshipLine";
  readonly relationshipId: RelationshipId;
};

/** A class direct-style line. Mermaid: `style User fill:#f9f,stroke:#333`. */
export type StyleLineConstruct = {
  readonly kind: "styleLine";
  readonly classId: ClassId;
};

/** A style-definition line. Mermaid: `classDef Important fill:#f9f`. */
export type StyleDefLineConstruct = {
  readonly kind: "styleDefLine";
  readonly styleDefId: StyleDefId;
};

/** A style-application line. Mermaid: `class User:::Important` OR `cssClass "User" Important`. */
export type StyleApplicationLineConstruct = {
  readonly kind: "styleApplicationLine";
  readonly styleApplicationId: StyleApplicationId;
};

/** A Shiny spatial annotation line. Shiny: `%% @spatial:User x=... y=... w=... h=...`.
 *  Targets either a class or a namespace, hence the widened id. */
export type SpatialLineConstruct = {
  readonly kind: "spatialLine";
  readonly targetId: ClassId | NamespaceId;
};

/** A note line/block. Mermaid: `note for User "text"`. */
export type NoteLineConstruct = {
  readonly kind: "noteLine";
  readonly noteId: NoteId;
};

// ============================================================================
// Class / namespace — header line vs whole definition
// ============================================================================

/** The class header line only. Mermaid: `class User` OR the `class User {` opener.
 *  Target of a header→block replace (body normalization). */
export type ClassHeaderConstruct = {
  readonly kind: "classHeader";
  readonly classId: ClassId;
};

/** The whole class: a single declaration line, or the full brace block
 *  (`class User { ... }`) through its closing brace. Target of move/delete. */
export type ClassDefinitionConstruct = {
  readonly kind: "classDefinition";
  readonly classId: ClassId;
};

/** The namespace header line only. Mermaid: `namespace Domain {`. */
export type NamespaceHeaderConstruct = {
  readonly kind: "namespaceHeader";
  readonly namespaceId: NamespaceId;
};

/** The whole namespace block through its closing brace. Target of move/delete/unwrap. */
export type NamespaceDefinitionConstruct = {
  readonly kind: "namespaceDefinition";
  readonly namespaceId: NamespaceId;
};

// ============================================================================
// Body containers — the interior of a block, for first-child anchoring
// ============================================================================

/** The diagram interior (after `classDiagram`). Anchors a new top-level construct
 *  when the diagram is otherwise empty. */
export type DiagramBodyConstruct = {
  readonly kind: "diagramBody";
};

/** The interior of a class block. Anchors a first member into an empty body. */
export type ClassBodyConstruct = {
  readonly kind: "classBody";
  readonly classId: ClassId;
};

/** The interior of a namespace block. Anchors a first member into an empty namespace. */
export type NamespaceBodyConstruct = {
  readonly kind: "namespaceBody";
  readonly namespaceId: NamespaceId;
};

// ============================================================================
// Union
// ============================================================================

/** Any addressable syntactic span in the source. Pure pointer — resolves
 *  against `ProvenanceIndex` to a `SourceLocation` (+ form + indent). */
export type SourceConstruct =
  | MemberLineConstruct
  | RelationshipLineConstruct
  | StyleLineConstruct
  | StyleDefLineConstruct
  | StyleApplicationLineConstruct
  | SpatialLineConstruct
  | NoteLineConstruct
  | ClassHeaderConstruct
  | ClassDefinitionConstruct
  | NamespaceHeaderConstruct
  | NamespaceDefinitionConstruct
  | DiagramBodyConstruct
  | ClassBodyConstruct
  | NamespaceBodyConstruct;

/** Construct kinds addressing a block interior — the only kinds valid as an
 *  `atStartOf` anchor. Useful for exhaustiveness checks in resolution. */
export type BodyConstruct =
  | DiagramBodyConstruct
  | ClassBodyConstruct
  | NamespaceBodyConstruct;
