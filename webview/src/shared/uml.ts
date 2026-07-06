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
  | "aggregation"
  | "lollipop";

export type RelationshipLineKind = "solid" | "dashed";

export type RelationshipEndpoint = {
  readonly classId: ClassId;
  readonly multiplicity: string | null;
  readonly endpointKind: RelationshipEndpointKind;
};

/**
 * Authoring-preset vocabulary for UI relationship creation.
 *
 * RelationshipType is not a stored graph, provenance, view, or command type.
 * Stored relationships use decomposed endpoint and line kinds.
 * Members mirror the ToolPane preset list 1:1; adding a preset means adding a
 * member here and nowhere else.
 */
export type RelationshipType =
  | "association" // A -- B
  | "directedAssociation" // A --> B
  | "bidirectionalAssociation" // A <--> B
  | "dependency" // A ..> B
  | "inheritance" // Child --|> Parent
  | "realization" // Impl ..|> Interface
  | "aggregation" // Whole o-- Part
  | "composition"; // Whole *-- Part
