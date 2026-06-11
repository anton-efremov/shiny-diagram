/**
 * @fileoverview The parser-to-component contract for Shiny's class diagram editor.
 *
 * DiagramModel is the output of the parser and the input to all editor components.
 * It is the stable boundary between "understanding Mermaid source" and "rendering
 * the diagram." Both sides evolve independently against this contract.
 *
 * Design principles:
 * - Every construct carries a SourceLocation so the diff patcher can find and
 *   update the exact source line without a second parse pass.
 * - Collections of named constructs use Map (keyed by id/name) for O(1) component
 *   lookup. Ordered collections use Array.
 * - No raw source text in the model except SourceLocation.raw, which is retained
 *   for diff computation only.
 * - All fields are readonly — the model is immutable after parsing. Mutations
 *   go through the diff protocol, not model mutation.
 */

// ---------------------------------------------------------------------------
// Source location
// ---------------------------------------------------------------------------

/**
 * Identifies where a construct appears in the source file.
 * Used by the diff patcher to locate and update the exact line.
 */
export type SourceLocation = {
  /** 0-indexed line number in the source file. */
  readonly line: number;
  /** Original raw line text, retained for diff computation. */
  readonly raw: string;
};

// ---------------------------------------------------------------------------
// Class members
// ---------------------------------------------------------------------------

/** UML visibility prefix on a class member. */
export type Visibility = "+" | "-" | "#" | "~";

/**
 * A single field or method declared inside a class body.
 * Fields and methods are unified here; isMethod distinguishes them.
 */
export type ClassMember = {
  readonly visibility: Visibility;
  readonly name: string;
  /** Return type for methods; field type for fields. */
  readonly type: string;
  readonly isMethod: boolean;
  /** Raw parameter string for methods, e.g. "TextMessage msg, int count". */
  readonly params?: string;
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Class node
// ---------------------------------------------------------------------------

/**
 * A declared Mermaid class — the core diagram entity.
 * Rendered as a ClassBox in the editor canvas.
 *
 * id is the stable identity used as React Flow node id, Map key,
 * and @spatial annotation key. It never changes within a parse.
 */
export type ClassNode = {
  readonly id: string;
  /** Stereotype annotation, e.g. "Interface", "Abstract", "Enumeration". */
  readonly stereotype?: string;
  readonly members: readonly ClassMember[];
  /**
   * Name of the classDef applied to this class via class Foo:::StyleName.
   * Used to look up resolved colors in styleDefinitions.
   */
  readonly styleDefName?: string;
  /** The "class Foo {" or "class Foo" declaration line. */
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

/** All Mermaid class diagram relationship types. */
export type RelationshipType =
  | "association" // A --> B
  | "solidLink" // A -- B
  | "dashedLink" // A .. B
  | "inheritance" // A <|-- B
  | "composition" // A *-- B
  | "aggregation" // A o-- B
  | "dependency" // A ..> B
  | "realization" // A ..|> B
  | "twoWay" // A <|--|> B
  | "lollipop"; // foo --() Interface

/**
 * A directed relationship between two classes.
 * Rendered as a Connection edge in the editor canvas.
 */
export type Relationship = {
  readonly source: string;
  readonly target: string;
  readonly type: RelationshipType;
  /** Optional label after the colon, e.g. A --> B : contains */
  readonly label?: string;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Style definitions
// ---------------------------------------------------------------------------

/**
 * A resolved classDef declaration.
 * Provides the visual properties applied to any class referencing this style.
 *
 * All color values are raw Mermaid values (e.g. "#FF5978", "red").
 * Components apply them directly to CSS.
 */
export type StyleDef = {
  readonly name: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly color?: string;
  readonly strokeWidth?: string;
  readonly strokeDasharray?: string;
  /** The "classDef StyleName ..." line. */
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Spatial annotations
// ---------------------------------------------------------------------------

/**
 * Shiny-specific layout annotation for a class box.
 * Parsed from "%% @spatial:ClassName x=N y=N w=N h=N" comments.
 *
 * x, y, width, height are in React Flow canvas units.
 * location points to the annotation line — used by the diff patcher
 * to update x/y on drag without re-parsing the whole file.
 */
export type SpatialAnnotation = {
  readonly classId: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** The "%% @spatial:..." line. */
  readonly location: SourceLocation;
};

// ---------------------------------------------------------------------------
// Diagram model — the contract
// ---------------------------------------------------------------------------

/**
 * The complete parsed representation of a Mermaid class diagram.
 *
 * This is the output of parseDiagram() and the input to all editor components.
 * Components never read raw source text — they consume DiagramModel only.
 *
 * Maps are keyed by the stable string id of each construct:
 * - classes: class name (e.g. "ConversationThread")
 * - styleDefinitions: classDef name (e.g. "Rose")
 * - spatialAnnotations: class name (same key as classes)
 */
export type DiagramModel = {
  readonly classes: ReadonlyMap<string, ClassNode>;
  readonly relationships: readonly Relationship[];
  readonly styleDefinitions: ReadonlyMap<string, StyleDef>;
  readonly spatialAnnotations: ReadonlyMap<string, SpatialAnnotation>;
};

// ---------------------------------------------------------------------------
// Component input types
// ---------------------------------------------------------------------------

/**
 * Everything a ClassBox component needs to render one class node.
 * Resolved from DiagramModel by EditorMode before passing to the component.
 *
 * ClassBox never reads DiagramModel directly — it receives ClassBoxProps.
 */
export type ClassBoxProps = {
  readonly node: ClassNode;
  readonly spatial: SpatialAnnotation;
  /** Resolved style, if a classDef is applied. Undefined means default token colors. */
  readonly style?: StyleDef;
};
