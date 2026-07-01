/**
 * @fileoverview UML class-diagram notation: member, visibility, and relationship vocabulary shared by Controller and View.
 */

import type { ClassId } from "./ids";

export type MemberKind = "field" | "method";

export type MemberPrefix = "+" | "-" | "#" | "~";

export type Visibility = MemberPrefix;

export type ClassAnnotation = string;

export type DiagramDirection = "TB" | "BT" | "RL" | "LR";

export type RelationshipEndpointKind =
  | "none"
  | "arrow"
  | "triangle"
  | "composition"
  | "aggregation";

export type RelationshipLineKind = "solid" | "dashed";

export type RelationshipEndpoint = {
  readonly classId: ClassId;
  readonly multiplicity: string | null;
  readonly endpointKind: RelationshipEndpointKind;
};

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
