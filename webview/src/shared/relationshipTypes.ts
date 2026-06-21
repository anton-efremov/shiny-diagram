/**
 * @fileoverview Relationship value vocabulary shared by Controller and View.
 */

export type RelationshipType =
  | "association"
  | "solidLink"
  | "dashedLink"
  | "inheritance"
  | "composition"
  | "aggregation"
  | "dependency"
  | "realization"
  | "twoWay"
  | "lollipop";
