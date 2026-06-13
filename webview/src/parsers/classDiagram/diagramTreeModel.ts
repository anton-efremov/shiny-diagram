/**
 * @fileoverview Defines the diagram tree: types for tree nodes, tree edges,
 * node attributes, and source locations that together form the parser-to-component
 * contract for Shiny's class diagram editor.
 *
 * ## Diagram tree
 *
 * The in-memory representation of a parsed Mermaid class diagram. Output of
 * parseDiagram(), input to all editor components. Modeled as a graph of tree
 * nodes and tree edges. Components never read raw source text — they consume
 * the diagram tree only.
 *
 * ### Tree node
 * An independently declared diagram entity with a stable string id and a source
 * location. Three kinds exist:
 * - **ClassNode** — a UML class declaration (`class Foo { ... }`)
 * - **StyleDefNode** — a classDef style declaration (`classDef Rose fill:#f00`)
 * - **NamespaceNode** — a namespace block (`namespace Payment { ... }`)
 *
 * ### Tree edge
 * A directed, source-backed connection between two tree nodes. Three kinds exist:
 * - **RelationshipEdge** — a UML relationship between two classes (`A --> B`)
 * - **InNamespaceEdge** — declares a class as a member of a namespace
 * - **AppliesStyleEdge** — declares that a classDef is applied to a class (`class Foo:::Rose`)
 *
 * ### Node attribute
 * Data that belongs exclusively to one tree node and has no independent existence.
 * Attributes are fields or arrays on their parent node. Four kinds exist:
 * - **ClassMember** (ClassField | ClassMethod) — a field or method in a class body
 * - **ClassAnnotation** — a stereotype inside a class body (`<<Service>>`)
 * - **SpatialData** — Shiny layout annotation (`%% @spatial:Foo x=N y=N w=N h=N`)
 * - **StyleProperty** — a single CSS-like property inside a StyleDefNode (`fill:#f00`)
 *
 * ### Source location
 * Every tree node, tree edge, and node attribute carries a SourceLocation
 * pointing to the exact line(s) in the source file where it was declared.
 * This is what enables surgical single-line replacement in the diff patcher
 * without a full re-parse after every edit.
 *
 * All fields are readonly — the diagram tree is immutable after parsing.
 * Mutations go through the diff protocol, not model mutation.
 */

// ---------------------------------------------------------------------------
// Source location
// ---------------------------------------------------------------------------

/**
 * Points to an exact character range in the source file.
 * Used by the diff patcher to locate and replace any construct — whether a
 * full line, a multi-line block, or a single property value within a line.
 * All positions are 0-indexed.
 */
export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  /** Original raw text of the range, retained for diff computation. */
  readonly raw: string;
};

// ---------------------------------------------------------------------------
// Node attributes — ClassNode
// ---------------------------------------------------------------------------

/** UML visibility prefix on a class member: public, private, protected, package. */
export type Visibility = "+" | "-" | "#" | "~";

/** A field declared inside a class body. */
export type ClassField = {
  readonly kind: "field";
  readonly visibility: Visibility;
  readonly name: string;
  readonly fieldType?: string;
  readonly location: SourceLocation;
};

/** A method declared inside a class body. */
export type ClassMethod = {
  readonly kind: "method";
  readonly visibility: Visibility;
  readonly name: string;
  readonly params?: string;
  readonly returnType?: string;
  readonly location: SourceLocation;
};

/** A field or method declared inside a class body. */
export type ClassMember = ClassField | ClassMethod;

/** A stereotype annotation declared inside a class body, e.g. <<Service>>. */
export type ClassAnnotation = {
  readonly value: string;
  readonly location: SourceLocation;
};

/**
 * Shiny-specific spatial layout data for a class box.
 * Parsed from "%% @spatial:ClassName x=N y=N w=N h=N" comments.
 * x, y, width, height are in React Flow canvas units.
 */
export type SpatialData = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Node attributes — StyleDefNode
// ---------------------------------------------------------------------------

/**
 * A single CSS-like property within a classDef declaration.
 * All properties share the parent StyleDefNode's source line —
 * editing any property rebuilds the full classDef line from all siblings.
 */
export type StyleProperty = {
  readonly property: "fill" | "stroke" | "color" | "strokeWidth" | "strokeDasharray";
  readonly value: string;
};

// ---------------------------------------------------------------------------
// Tree nodes
// ---------------------------------------------------------------------------

/**
 * A declared Mermaid class.
 * Rendered as a ClassBox on the editor canvas.
 * id is the stable identity used as React Flow node id and Map key.
 */
export type ClassNode = {
  readonly kind: "class";
  readonly id: string;
  readonly annotation?: ClassAnnotation;
  readonly members: readonly ClassMember[];
  /** Absent means no @spatial annotation exists yet — editor shows Generate prompt. */
  readonly spatial?: SpatialData;
  /** The "class Foo {" or "class Foo" declaration line. */
  readonly location: SourceLocation;
};

/**
 * A classDef style declaration at diagram level.
 * Modeled as a tree node because it is declared independently and can be
 * referenced by many classes via AppliesStyleEdge.
 */
export type StyleDefNode = {
  readonly kind: "styleDef";
  readonly id: string;
  readonly properties: readonly StyleProperty[];
  /** The "classDef StyleName ..." line. */
  readonly location: SourceLocation;
};

/** A namespace block — a visual grouping of classes on the canvas. */
export type NamespaceNode = {
  readonly kind: "namespace";
  readonly id: string;
  /** The "namespace Foo {" line. */
  readonly location: SourceLocation;
};

/** Union of all tree node types. */
export type TreeNode = ClassNode | StyleDefNode | NamespaceNode;

// ---------------------------------------------------------------------------
// Tree edges
// ---------------------------------------------------------------------------

/** All Mermaid class diagram relationship types. */
export type RelationshipType =
  | "association"  // A --> B
  | "solidLink"    // A -- B
  | "dashedLink"   // A .. B
  | "inheritance"  // A <|-- B
  | "composition"  // A *-- B
  | "aggregation"  // A o-- B
  | "dependency"   // A ..> B
  | "realization"  // A ..|> B
  | "twoWay"       // A <|--|> B
  | "lollipop";    // foo --() Interface

/** A UML relationship between two classes. Rendered as an edge on the canvas. */
export type RelationshipEdge = {
  readonly kind: "relationship";
  readonly source: string;
  readonly target: string;
  readonly type: RelationshipType;
  readonly label?: string;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly location: SourceLocation;
};

/** Declares that a class belongs to a namespace. */
export type InNamespaceEdge = {
  readonly kind: "inNamespace";
  readonly source: string;
  readonly target: string;
  readonly location: SourceLocation;
};

/** Declares that a classDef style is applied to a class (`class Foo:::Rose`). */
export type AppliesStyleEdge = {
  readonly kind: "appliesStyle";
  readonly source: string;  // ClassNode id
  readonly target: string;  // StyleDefNode id
  readonly location: SourceLocation;
};

/** Union of all tree edge types. */
export type TreeEdge = RelationshipEdge | InNamespaceEdge | AppliesStyleEdge;

// ---------------------------------------------------------------------------
// Diagram tree — the contract
// ---------------------------------------------------------------------------

/**
 * The complete in-memory representation of a parsed Mermaid class diagram.
 * Output of parseDiagram(), input to all editor components.
 *
 * nodes is keyed by stable string id:
 * - ClassNode:     class name      (e.g. "PaymentService")
 * - StyleDefNode:  classDef name   (e.g. "Rose")
 * - NamespaceNode: namespace name  (e.g. "Payment")
 */
export type DiagramTree = {
  readonly nodes: ReadonlyMap<string, TreeNode>;
  readonly edges: readonly TreeEdge[];
};

