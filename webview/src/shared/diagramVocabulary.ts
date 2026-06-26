/**
 * @fileoverview Diagram value vocabulary shared across Controller and View contracts.
 */

export type { RelationshipType } from "./relationshipTypes";

export type MemberPrefix = "+" | "-" | "#" | "~";

export type RelationshipEndpoint = "source" | "target";

export type ClassStyleProperties = {
  readonly fill?: string;
  readonly stroke?: string;
  readonly color?: string;
};
