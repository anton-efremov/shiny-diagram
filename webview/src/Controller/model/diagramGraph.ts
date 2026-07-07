/**
 * @fileoverview
 * `DiagramGraph` — the semantic representation of a Mermaid class diagram after parsing.
 *
 * `DiagramGraph` describes *what exists* in the diagram: classes, namespaces,
 * relationships, notes, styles, interactions, and Shiny spatial attachments.
 * It does *not* describe where those facts were written in source. Source
 * locations, indentation, and insertion anchors live in `ProvenanceIndex`,
 * keyed by these same ids, for addressable graph objects and addressable
 * fields / attachments.
 *
 * Data flow — Source → View:
 *   1. The source document is parsed into `DiagramGraph` + `ProvenanceIndex`.
 *   2. `DiagramGraph` is projected into the editor `ViewModel` as `view` props
 *      to the React tree.
 *   3. `view` is rendered.
 *
 * Data flow — View → Source:
 *   1. User actions emit **command** transactions.
 *   2. Each command is converted into source edits by reading the affected
 *      graph nodes and using their ids to look up source/provenance facts in
 *      `ProvenanceIndex`. IMPORTANT: each command MUST preserve a consistent
 *      state of diagramGraph, when source is parsed after edits applied
 *   3. Edits are written to the source.
 *
 * Modeling principles:
 *   - **nodes** — semantic entities with their own lifecycle that the editor
 *     treats as standalone objects: classes, namespaces, style definitions, notes.
 *   - **edges** — semantic relationships between nodes that can themselves be
 *     edited, deleted, retargeted, or carry their own properties: class
 *     relationships, style applications.
 *   - **owned collections** — child entities edited directly but existing only
 *     as part of one parent, usually with meaningful order: class attributes,
 *     class methods, lollipop interfaces.
 *   - **fields / attachments** — editable state belonging to exactly one node,
 *     never retargeted as an independent relationship: parent namespace, direct
 *     style, spatial placement, note placement/attachment, interaction.
 *
 * **identity** — is derived from Mermaid identifiers.
 *   - ClassId is the current Mermaid class name.
 *   - NamespaceId is the current Mermaid namespace identity/name path.
 *   - StyleDefId is the current style definition name.
 *   - Rename changes identity.
 *
 * Shape rule: no optional (`?`) fields. Absent singular values are `null`;
 * absent collections / relations are empty arrays / maps.
 */

import type {
  AttributeId,
  ClassId,
  DiagramId,
  LollipopInterfaceId,
  MethodId,
  NamespaceId,
  NoteId,
  RelationshipId,
  StyleApplicationId,
  StyleDefId,
} from "../../shared/ids";
import type { AttachmentSide, SpatialAttachment } from "../../shared/geometry";
import type { InteractionAttachment } from "../../shared/interaction";
import type { NoteSpatial } from "../../shared/notes";
import type { StyleProperties } from "../../shared/style";
import type {
  ClassAnnotation,
  DiagramDirection,
  RelationshipEndpoint,
  RelationshipLineKind,
  Visibility,
} from "../../shared/uml";

// ============================================================================
// Graph root
// ============================================================================

export type DiagramGraph = {
  readonly diagram: DiagramNode;
  readonly classes: ReadonlyMap<ClassId, ClassNode>;
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceNode>;
  readonly relationships: ReadonlyMap<RelationshipId, RelationshipEdge>;
  readonly notes: ReadonlyMap<NoteId, NoteNode>;
  readonly styleDefinitions: ReadonlyMap<StyleDefId, StyleDefNode>;
  readonly styleApplications: ReadonlyMap<StyleApplicationId, StyleApplicationEdge>;
};

// ============================================================================
// Nodes
// ============================================================================

// Mermaid: `classDiagram`
export type DiagramNode = {
  readonly kind: "classDiagram";
  readonly id: DiagramId;
  readonly direction: DiagramDirection | null; // Mermaid: `direction LR`
  readonly config: DiagramConfig;
};

export type DiagramConfig = {
  // Mermaid: `%%{init: {"class": {"hideEmptyMembersBox": true}}}%%`
  readonly hideEmptyMembersBox: boolean | null;
  // Mermaid: `%%{init: {"class": {"hierarchicalNamespaces": false}}}%%`
  readonly hierarchicalNamespaces: boolean | null;
};

// Mermaid: `class User` OR `Vehicle <|-- Car` (implicit declaration)
export type ClassNode = {
  readonly kind: "class";
  readonly id: ClassId;
  readonly name: string; // Mermaid: `class User`
  readonly label: string; // Mermaid: `class User["Human User"]` (equals name when no label provided)
  readonly genericType: string | null; // Mermaid: `class Box~T~`
  readonly annotation: ClassAnnotation | null; // Mermaid: `class User { <<Interface>> }` OR `<<Interface>> User`
  readonly parentNamespaceId: NamespaceId | null; // Mermaid: `namespace Domain { class User }` OR `namespace Domain.Users { class User }`

  // Shiny: `%% @spatial:User x=... y=... w=... h=...`
  readonly spatial: SpatialAttachment | null;

  readonly attributes: readonly ClassAttribute[];
  readonly methods: readonly ClassMethod[];
  readonly lollipopInterfaces: readonly LollipopInterface[];

  // Mermaid: `style User fill:#f9f,stroke:#333,stroke-width:4px,font-size:12pt`
  readonly directStyle: StyleProperties | null;

  // Mermaid: `link User "https://example.com" "Open user docs"` OR `callback User "onUserClick" "Open user panel"`
  readonly interaction: InteractionAttachment | null;
};

// Owned collection of `ClassNode`.
// Mermaid: `class User { +string name$ }` OR `User : +string name$`
export type ClassAttribute = {
  readonly id: AttributeId;
  readonly name: string;
  readonly visibility: Visibility | null;
  readonly attributeType: string | null;
  readonly isStatic: boolean;
};

// Owned collection of `ClassNode`.
// Mermaid: `class User { +login(email) bool$ }` OR `User : +login(email) bool*`
export type ClassMethod = {
  readonly id: MethodId;
  readonly name: string;
  readonly visibility: Visibility | null;
  readonly parameters: string;
  readonly returnType: string | null;
  readonly isStatic: boolean;
  readonly isAbstract: boolean;
};

// Owned collection of `ClassNode`.
// Mermaid: `Api ()-- User` OR `User --() Api`
export type LollipopInterface = {
  readonly id: LollipopInterfaceId;
  readonly label: string;
  readonly side: AttachmentSide; // Shiny: attachment side; Mermaid only defines class + interface label
};

// Mermaid: `namespace Domain { ... }` OR `namespace Domain["Domain Layer"] { ... }`
export type NamespaceNode = {
  readonly kind: "namespace";
  readonly id: NamespaceId;
  readonly name: string; // Mermaid: `namespace Domain`
  readonly label: string; // Mermaid: `namespace Domain["Domain Layer"]` (equals name when no label provided)
  readonly parentNamespaceId: NamespaceId | null; // Mermaid: `namespace Root { namespace Child { ... } }` OR `namespace Root.Child { ... }`

  // Shiny: `%% @spatial:Domain x=... y=... w=... h=...`
  readonly spatial: SpatialAttachment | null;
};

// Mermaid: `note "Standalone note"` OR `note for User "Attached note"`
export type NoteNode = {
  readonly kind: "note";
  readonly id: NoteId;
  readonly text: string; // Mermaid: note body text
  readonly spatial: NoteSpatial | null;
};

// Mermaid: `classDef Important fill:#f9f,stroke:#333,stroke-width:4px,font-size:12pt`
export type StyleDefNode = {
  readonly kind: "styleDef";
  readonly id: StyleDefId;
  readonly name: string; // Mermaid: `Important` in `classDef Important fill:#f9f`
  readonly sourceKind: "classDef" | "externalCssClass"; // Mermaid: `classDef Important ...` OR external CSS class `.Important`
  readonly properties: StyleProperties;
};

/** Union of the addressable, standalone-lifecycle node kinds. */
export type GraphNode = ClassNode | NamespaceNode | StyleDefNode | NoteNode;

// ============================================================================
// Edges
// ============================================================================

// Mermaid: `User "1" --> "*" Session : owns` OR `A <|--|> B`
export type RelationshipEdge = {
  readonly kind: "relationship";
  readonly id: RelationshipId;
  readonly ordinal: number; // the relationship statement's index in document order (a global counter), not a per-pair position
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
  readonly lineKind: RelationshipLineKind; // Mermaid: `--` or `..`
  readonly label: string | null; // Mermaid: `: owns` in `User --> Session : owns`
};

// Mermaid: `class User:::Important` OR `cssClass "User" Important`
export type StyleApplicationEdge = {
  readonly kind: "styleApplication";
  readonly id: StyleApplicationId;
  readonly targetId: ClassId;
  readonly styleDefId: StyleDefId;
};

/** Union of the addressable, retargetable edge kinds. */
export type GraphEdge = RelationshipEdge | StyleApplicationEdge;
