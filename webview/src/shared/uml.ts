/**
 * @fileoverview UML class-diagram notation: member, visibility, and relationship vocabulary shared by Controller and View.
 */

export type MemberKind = "field" | "method";

export type MemberPrefix = "+" | "-" | "#" | "~";

export type RelationshipEndpoint = "source" | "target";

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
