// Branded IDs and SourceLocation — shared across all APIs
export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};

export type ClassId = string & { readonly __brand: "ClassId" };
export type StyleDefId = string & { readonly __brand: "StyleDefId" };
export type NamespaceId = string & { readonly __brand: "NamespaceId" };
export type NoteId = string & { readonly __brand: "NoteId" };

/**
 * Branded member identity within a class body.
 * Synthesized as `${classId}:${startLine}` by the Derivator.
 * Positional and provisional — to be revisited when member editing becomes real.
 */
export type MemberId = string & { readonly __brand: "MemberId" };

export type TreeNodeId = ClassId | StyleDefId | NamespaceId;

export const toClassId = (s: string): ClassId => s as ClassId;
export const toStyleDefId = (s: string): StyleDefId => s as StyleDefId;
export const toNamespaceId = (s: string): NamespaceId => s as NamespaceId;
export const toNoteId = (s: string): NoteId => s as NoteId;
export const toMemberId = (s: string): MemberId => s as MemberId;

// Shared geometry types (used by both derive and commands APIs)
export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type Point = { readonly x: number; readonly y: number };

// Diagram tree model — the parsed representation of a classDiagram source file
export type Visibility = "+" | "-" | "#" | "~";

export type ClassField = {
  readonly kind: "field";
  readonly visibility: Visibility;
  readonly name: string;
  readonly fieldType?: string;
  readonly location: SourceLocation;
};

export type ClassMethod = {
  readonly kind: "method";
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
  readonly property: "fill" | "stroke" | "color" | "strokeWidth" | "strokeDasharray";
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

export type RelationshipEdge = {
  readonly kind: "relationship";
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

/**
 * Flag: "syntaxError" is not in the spec's four-kind union but is required
 * to carry the parse error message for invalidSyntax status through diagnostics.
 */
export type EditorDiagnostic = {
  readonly kind:
    | "orphanedAnnotation"
    | "duplicateAnnotation"
    | "missingAnnotation"
    | "malformedAnnotation"
    | "syntaxError";
  readonly message: string;
  readonly elementId?: string;
};
