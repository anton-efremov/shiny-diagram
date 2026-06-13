/**
 * @fileoverview Foundational primitives for the class diagram model.
 *
 * Contains types shared across all class diagram files — source location,
 * branded id types, and their casters. These are building blocks that
 * diagramTreeModel.ts and the parser/component layers are built on.
 *
 * Branded id types prevent accidental substitution of one id kind for another
 * at compile time. Use the caster functions (toClassId, toStyleDefId,
 * toNamespaceId) at parse time when constructing ids from raw strings.
 * Everywhere else, ids flow as their branded type and TypeScript enforces correctness.
 *
 * SourceLocation lives here for now. If a second diagram type is added,
 * it moves to a shared models/sourceLocation.ts and is imported by each
 * diagram's primitives.ts.
 */

// ---------------------------------------------------------------------------
// Source location
// ---------------------------------------------------------------------------

/**
 * Points to an exact character range in the source file.
 * Used by the diff patcher to locate and replace any construct — whether a
 * full line, a multi-line block, or a single property value within a line.
 * All positions are 0-indexed.
 */
export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  /** Original raw text of the range, retained for diff computation. */
  readonly raw: string;
};

// ---------------------------------------------------------------------------
// Branded id types
// ---------------------------------------------------------------------------

/** Stable identity of a ClassNode. Derived from the class name in source. */
export type ClassId = string & { readonly __brand: "ClassId" };

/** Stable identity of a StyleDefNode. Derived from the classDef name in source. */
export type StyleDefId = string & { readonly __brand: "StyleDefId" };

/** Stable identity of a NamespaceNode. Derived from the namespace name in source. */
export type NamespaceId = string & { readonly __brand: "NamespaceId" };

/** Union of all tree node id types. */
export type TreeNodeId = ClassId | StyleDefId | NamespaceId;

// ---------------------------------------------------------------------------
// Casters — use only at parse time when constructing ids from raw strings
// ---------------------------------------------------------------------------

export const toClassId = (s: string): ClassId => s as ClassId;
export const toStyleDefId = (s: string): StyleDefId => s as StyleDefId;
export const toNamespaceId = (s: string): NamespaceId => s as NamespaceId;
