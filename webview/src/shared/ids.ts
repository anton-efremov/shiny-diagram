/**
 * @fileoverview Branded diagram identities and their brand constructors, shared across the webview pipeline.
 */

export type ClassId = string & { readonly __brand: "ClassId" };
export type StyleDefId = string & { readonly __brand: "StyleDefId" };
export type NamespaceId = string & { readonly __brand: "NamespaceId" };
export type NoteId = string & { readonly __brand: "NoteId" };
export type MemberId = string & { readonly __brand: "MemberId" };
export type AttributeId = string & { readonly __brand: "AttributeId" };
export type MethodId = string & { readonly __brand: "MethodId" };
export type LollipopInterfaceId = string & { readonly __brand: "LollipopInterfaceId" };
export type StyleApplicationId = string & { readonly __brand: "StyleApplicationId" };
export type DiagramId = string & { readonly __brand: "DiagramId" };
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
 * Brands a parsed class attribute identifier.
 */
export function toAttributeId(value: string): AttributeId {
  return value as AttributeId;
}

/**
 * Brands a parsed class method identifier.
 */
export function toMethodId(value: string): MethodId {
  return value as MethodId;
}

/**
 * Brands a parsed lollipop interface identifier.
 */
export function toLollipopInterfaceId(value: string): LollipopInterfaceId {
  return value as LollipopInterfaceId;
}

/**
 * Brands a parsed style application identifier.
 */
export function toStyleApplicationId(value: string): StyleApplicationId {
  return value as StyleApplicationId;
}

/**
 * Brands a parsed diagram identifier.
 */
export function toDiagramId(value: string): DiagramId {
  return value as DiagramId;
}

/**
 * Brands a parsed relationship identifier.
 */
export function toRelationshipId(value: string): RelationshipId {
  return value as RelationshipId;
}
