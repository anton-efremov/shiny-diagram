/**
 * @fileoverview Branded diagram identities and their brand constructors, shared across the webview pipeline.
 */

export type ClassId = string & { readonly __brand: "ClassId" };
export type StyleDefId = string & { readonly __brand: "StyleDefId" };
export type NamespaceId = string & { readonly __brand: "NamespaceId" };
export type NoteId = string & { readonly __brand: "NoteId" };
export type MemberId = string & { readonly __brand: "MemberId" };
export type RelationshipId = string & { readonly __brand: "RelationshipId" };

/**
 * Brands a parsed class identifier.
 */
export function toClassId(value: string): ClassId {
  return value as ClassId;
}

/**
 * Brands a parsed style definition identifier.
 */
export function toStyleDefId(value: string): StyleDefId {
  return value as StyleDefId;
}

/**
 * Brands a parsed namespace identifier.
 */
export function toNamespaceId(value: string): NamespaceId {
  return value as NamespaceId;
}

/**
 * Brands a parsed note identifier.
 */
export function toNoteId(value: string): NoteId {
  return value as NoteId;
}

/**
 * Brands a parsed class member identifier.
 */
export function toMemberId(value: string): MemberId {
  return value as MemberId;
}

/**
 * Brands a parsed relationship identifier.
 */
export function toRelationshipId(value: string): RelationshipId {
  return value as RelationshipId;
}
