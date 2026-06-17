export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};

export type ClassId = string & { readonly __brand: "ClassId" };
export type StyleDefId = string & { readonly __brand: "StyleDefId" };
export type NamespaceId = string & { readonly __brand: "NamespaceId" };
export type NoteId = string & { readonly __brand: "NoteId" };

/**
 * Branded member identity within a class body.
 * Synthesized as `${classId}:${startLine}` by the Derivator.
 * Positional and provisional — to be revisited when member editing becomes real.
 */
export type MemberId = string & { readonly __brand: "MemberId" };

export type TreeNodeId = ClassId | StyleDefId | NamespaceId;

export const toClassId = (s: string): ClassId => s as ClassId;
export const toStyleDefId = (s: string): StyleDefId => s as StyleDefId;
export const toNamespaceId = (s: string): NamespaceId => s as NamespaceId;
export const toNoteId = (s: string): NoteId => s as NoteId;
export const toMemberId = (s: string): MemberId => s as MemberId;
