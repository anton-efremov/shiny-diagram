/**
 * @fileoverview
 * `ProvenanceIndex` — source areas for addressable `DiagramGraph` facts.
 *
 * `DiagramGraph` is the meaning half of parse output; provenance is the source
 * half. Both are keyed by the same ids. A writeback address asks for a parsed
 * syntax area such as "User's class declaration", "User's class body", or
 * "the fill value in User's style line"; a record here answers with
 * `SourceLocation`s.
 *
 * Provenance stores parsed syntax areas, not write anchors. The translate layer
 * reads these records to choose Mermaid syntax and derive logical write
 * locations; the resolve layer turns those locations into concrete `SourceEdit`s
 * by applying source positions, indentation, EOL, and conflict checks.
 *
 * Record convention:
 *   - `self` is the whole source area for a fact, used for move/delete/replace;
 *   - structural areas (`header`, `body`, `propertyList`) are explicit because
 *     braces and inline syntax can vary;
 *   - `fields` contains token/value ranges for surgical patches;
 *   - absence is meaningful: implicit classes, unstyled classes, and missing
 *     style properties have no source area yet, so translation synthesizes one.
 *
 * Records do not store indentation. Resolution derives indentation from the
 * referenced source line.
 *
 * Not yet produced: first-class lollipop interfaces and diagram-config
 * provenance + maybe some element decorator properties are missing
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
import type { StylePropertyName } from "../../shared/style";

// ============================================================================
// Diagram
// ============================================================================

/** The parsed class diagram area. `body` is the top-level diagram interior. */
export type DiagramRecord = {
  readonly self: SourceLocation;
  readonly header: SourceLocation; // `classDiagram`
  readonly body: SourceLocation;
};

// ============================================================================
// Classes
// ============================================================================

/** A class with a declaration in source. Missing map entry means implicit class. */
export type ClassRecord = {
  readonly sourceForm: "simpleDeclaration" | "blockDeclaration";
  readonly self: SourceLocation; // line for simple form, whole brace block for block form
  readonly header: SourceLocation; // declaration/header line
  readonly body: SourceLocation | null; // interior of `{ ... }`, only for block form
  readonly fields: {
    readonly declaredName: SourceLocation; // `User` in `class User`
  };
};

// ============================================================================
// Namespaces
// ============================================================================

/** A namespace declaration block: `namespace Domain { ... }`. */
export type NamespaceRecord = {
  readonly self: SourceLocation;
  readonly header: SourceLocation;
  readonly body: SourceLocation;
  readonly fields: {
    readonly declaredName: SourceLocation;
  };
};

// ============================================================================
// Members (attributes, methods)
// ============================================================================

/** A member inside a class block: `+string name`. */
export type BlockMemberRecord = {
  readonly sourceForm: "blockMember";
  readonly self: SourceLocation;
  readonly fields: {
    readonly name: SourceLocation;
  };
};

/** A member as a short-form line: `User : +string name`. */
export type ShortMemberRecord = {
  readonly sourceForm: "shortMember";
  readonly self: SourceLocation;
  readonly fields: {
    readonly owner: SourceLocation; // `User` in `User : ...`
    readonly name: SourceLocation;
  };
};

export type MemberRecord = BlockMemberRecord | ShortMemberRecord;

// ============================================================================
// Relationships
// ============================================================================

/** A relationship line: `User "1" --> "*" Session : owns`. */
export type RelationshipRecord = {
  readonly self: SourceLocation;
  readonly fields: {
    readonly sourceEndpoint: SourceLocation;
    readonly sourceMultiplicity?: SourceLocation;
    readonly operator: SourceLocation; // `-->`, `<|--`, `*--`, `..>`, etc.
    readonly targetMultiplicity?: SourceLocation;
    readonly targetEndpoint: SourceLocation;
    readonly label?: SourceLocation; // text after `:`, when present
  };
};

// ============================================================================
// Styles
// ============================================================================

export type StylePropertyValueFields = Partial<Record<StylePropertyName, SourceLocation>>;

/** A class direct-style line: `style User fill:#f9f,stroke:#333`. */
export type ClassDirectStyleRecord = {
  readonly self: SourceLocation;
  readonly fields: {
    readonly target: SourceLocation; // `User` in `style User ...`
    readonly properties: StylePropertyValueFields; // value spans only, e.g. `#f9f`
  };
};

/** A style-definition line: `classDef Important fill:#f9f`. */
export type StyleDefRecord = {
  readonly self: SourceLocation;
  readonly fields: {
    readonly declaredName: SourceLocation; // `Important` in `classDef Important ...`
    readonly properties: StylePropertyValueFields; // value spans only, e.g. `#f9f`
  };
};

/** A style-application line: `class User:::Important` / `cssClass "User" Important`. */
export type StyleApplicationRecord = {
  readonly self: SourceLocation;
  readonly fields: {
    readonly target: SourceLocation; // applied-to class token
    readonly styleName: SourceLocation; // applied style token
  };
};

// ============================================================================
// Spatial annotations (Shiny)
// ============================================================================

/** A spatial annotation line: `%% @spatial:User x=.. y=.. w=.. h=..`. */
export type SpatialRecord = {
  readonly self: SourceLocation;
  readonly fields: {
    readonly target: SourceLocation;
    readonly x: SourceLocation;
    readonly y: SourceLocation;
    readonly w: SourceLocation;
    readonly h: SourceLocation;
  };
};

// ============================================================================
// Notes
// ============================================================================

/** A note line/block: `note for User "text"`. */
export type NoteRecord = {
  readonly self: SourceLocation;
};

export type ProvenanceIndex = {
  /** Class diagram header/body/source area. */
  readonly diagram: DiagramRecord;

  /** Explicit class declarations only. Missing class record means implicit class. */
  readonly classes: ReadonlyMap<ClassId, ClassRecord>;

  /** Namespace blocks. */
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceRecord>;

  /** Attribute and method lines. */
  readonly members: ReadonlyMap<AttributeId | MethodId, MemberRecord>;

  /** Relationship lines. */
  readonly relationships: ReadonlyMap<RelationshipId, RelationshipRecord>;

  /** Style lines. */
  readonly classDirectStyles: ReadonlyMap<ClassId, ClassDirectStyleRecord>;
  readonly styleDefinitions: ReadonlyMap<StyleDefId, StyleDefRecord>;
  readonly styleApplications: ReadonlyMap<StyleApplicationId, StyleApplicationRecord>;

  /** Spatial annotation lines. */
  readonly classSpatial: ReadonlyMap<ClassId, SpatialRecord>;
  readonly namespaceSpatial: ReadonlyMap<NamespaceId, SpatialRecord>;

  /** Note lines/blocks. */
  readonly notes: ReadonlyMap<NoteId, NoteRecord>;
};

// ============================================================================
// Shared types
// ============================================================================

/**
 * @fileoverview Source ranges attached to parsed diagram constructs.
 */
export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};
