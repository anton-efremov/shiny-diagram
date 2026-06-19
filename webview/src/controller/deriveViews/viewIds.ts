/**
 * @fileoverview Derived identities used by render models and UI interactions.
 */

export type MemberId = string & { readonly __brand: "MemberId" };

export type RelationshipViewId = string & { readonly __brand: "RelationshipViewId" };

/**
 * Brands the derived class member row identity.
 */
export function toMemberId(value: string): MemberId {
  return value as MemberId;
}

/**
 * Brands the derived relationship identity.
 */
export function toRelationshipViewId(value: string): RelationshipViewId {
  return value as RelationshipViewId;
}
