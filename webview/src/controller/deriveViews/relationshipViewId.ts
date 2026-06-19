/**
 * Temporary derived relationship identity.
 *
 * RelationshipViewId is currently derived from relationship source/target/index
 * for ReactFlow rendering and relationship command targeting.
 *
 * This is intentionally kept isolated because it is not a true parsed-model
 * identity yet. A later refactor should replace it with a model-owned
 * RelationshipId.
 */
export type RelationshipViewId = string & { readonly __brand: "RelationshipViewId" };

export const toRelationshipViewId = (s: string): RelationshipViewId => s as RelationshipViewId;
