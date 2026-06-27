/**
 * @fileoverview Source-derived diagram model shared by Controller components.
 */

import type { ClassId, MemberId, NamespaceId, RelationshipId, StyleDefId } from "../../shared/ids";
import type { StylePropertyName } from "../../shared/style";
import type { RelationshipType } from "../../shared/uml";
import type { SourceLocation } from "./sourceLocation";

export type Visibility = "+" | "-" | "#" | "~";

export type ClassField = {
  readonly kind: "field";
  readonly id: MemberId;
  readonly visibility: Visibility;
  readonly name: string;
  readonly fieldType?: string;
  readonly location: SourceLocation;
};

export type ClassMethod = {
  readonly kind: "method";
  readonly id: MemberId;
  readonly visibility: Visibility;
  readonly name: string;
  readonly params?: string;
  readonly returnType?: string;
  readonly location: SourceLocation;
};

export type ClassMember = ClassField | ClassMethod;

export type ClassAnnotation = {
  readonly value: string;
  readonly location: SourceLocation;
};

export type SpatialData = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly location: SourceLocation;
};

export type StyleProperty = {
  readonly property: StylePropertyName;
  readonly value: string;
};

export type ClassNode = {
  readonly kind: "class";
  readonly id: ClassId;
  readonly annotation?: ClassAnnotation;
  readonly members: readonly ClassMember[];
  readonly spatial?: SpatialData;
  readonly location: SourceLocation | null;
};

export type StyleDefNode = {
  readonly kind: "styleDef";
  readonly id: StyleDefId;
  readonly properties: readonly StyleProperty[];
  readonly location: SourceLocation;
};

export type NamespaceNode = {
  readonly kind: "namespace";
  readonly id: NamespaceId;
  readonly location: SourceLocation;
};

export type TreeNode = ClassNode | StyleDefNode | NamespaceNode;

export type RelationshipEdge = {
  readonly kind: "relationship";
  readonly id: RelationshipId;
  readonly source: ClassId;
  readonly target: ClassId;
  readonly type: RelationshipType;
  readonly label?: string;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly location: SourceLocation;
};

export type InNamespaceEdge = {
  readonly kind: "inNamespace";
  readonly source: ClassId;
  readonly target: NamespaceId;
  readonly location: SourceLocation;
};

export type AppliesStyleEdge = {
  readonly kind: "appliesStyle";
  readonly source: ClassId;
  readonly target: StyleDefId;
  readonly location: SourceLocation;
};

export type TreeEdge = RelationshipEdge | InNamespaceEdge | AppliesStyleEdge;

export type DiagramTree = {
  readonly classes: ReadonlyMap<ClassId, ClassNode>;
  readonly styleDefs: ReadonlyMap<StyleDefId, StyleDefNode>;
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceNode>;
  readonly relationships: readonly RelationshipEdge[];
  readonly appliesStyleEdges: readonly AppliesStyleEdge[];
  readonly inNamespaceEdges: readonly InNamespaceEdge[];
};
