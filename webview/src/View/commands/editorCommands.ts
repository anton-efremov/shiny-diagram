/**
@fileoverview Canonical registry of View-to-Controller editor commands.

A command is an atomic semantic writeback request against the current `DiagramGraph`. It is not source edit, and not an in-memory graph reducer, and not a user action, although its shape is defined by ability to encode user actions. A user action may emit a transaction of commands; each command is converted into source edits, and those edits **must** create a consistent Mermaid diagram which reparse into a consistent `DiagramGraph`.

Command rules:
- View does not allocate opaque IDs. Source-derived IDs are determined by Mermaid identifiers after parse. Create commands are ID-less requests; Controller writes source, reparses, and returns a new `view` containing the created object IDs.
- Commands that target existing objects use IDs from the current `view`.
- Create commands include only fields needed to write the initial source representation for that user action. 
- Command signatures list exactly the accepted arguments. Omitted fields are not implicit `null`. `null` is sent only for arguments typed as `T | null`, meaning absent/cleared in source.
- Object properties are changed with `.set`; lifecycle removal uses `.delete`. Full attachment removal may use `.clear` where it is clearer than setting many nullable fields.
- `*.name.set` command triggers change of Node Id in a diagram graph. So when the new `view` comes back from source parsing, an element with changed name/id gets rerendered by React. Some renamings can lead to **cascade changes**, e.g. changing of `parentNamespace` but it is in scope of writeback / parsing rules and not covered by this document.

Transaction limitations:
- A transaction must not create an object and then target that newly-created object by ID in a later command. If a user action needs initial parent, placement, style, or other owned state, that state must be carried by the create command itself.
- After an ID-changing command, the same transaction must not target that object by its old ID; follow-up edits must wait for the reparsed view or be folded into the same command.

Naming rules:
- `*.create` and `*.delete` are used for nodes, edges, and owned collection entries with lifecycle.
- `*.set` is used for changing fields and attachments.
- Owned collection commands are namespaced by the owner, e.g. `class.attribute.*`, `class.method.*`, `class.lollipopInterface.*`.
- Ordered insertion uses `beforeXId: XId | null`; `null` means append as the last item. 
*/

import type {
  AttributeId,
  ClassId,
  LollipopInterfaceId,
  MethodId,
  NamespaceId,
  NoteId,
  RelationshipId,
  StyleApplicationId,
  StyleDefId,
} from "../../shared/ids";
import type { AttachmentSide, Point, SpatialAttachment } from "../../shared/geometry";
import type { InteractionAttachment } from "../../shared/interaction";
import type { StyleProperties, StylePropertyName } from "../../shared/style";
import type {
  ClassAnnotation,
  DiagramDirection,
  MemberClassifier,
  RelationshipEndpoint,
  RelationshipEndpointKind,
  RelationshipLineKind,
} from "../../shared/uml";
import type { TransactionOutcome } from "./transactionOutcome";

/** One View-to-Controller editor transaction. */
export type EditorCommandTransaction = readonly EditorCommand[];

export type TransactionError = {
  readonly message: string;
  readonly commandIndex: number;
};

export type TransactionResult =
  | { readonly status: "committed"; readonly outcome: TransactionOutcome }
  | { readonly status: "rejected"; readonly errors: readonly TransactionError[] };

export type EditorDispatch = (transaction: EditorCommandTransaction) => TransactionResult;

export type EditorCommand =
  // ==========================================================================
  // Diagram
  // ==========================================================================
  | {
      readonly type: "diagram.direction.set";
      readonly direction: DiagramDirection | null;
    }
  | {
      readonly type: "diagram.config.hideEmptyMembersBox.set";
      readonly value: boolean | null;
    }
  | {
      readonly type: "diagram.config.hierarchicalNamespaces.set";
      readonly value: boolean | null;
    }

  // ==========================================================================
  // Class
  // ==========================================================================
  | {
      readonly type: "class.create";
      readonly parentNamespaceId: NamespaceId | null;
      readonly spatial: SpatialAttachment;
    }
  | {
      readonly type: "class.delete";
      readonly classId: ClassId;
    }
  | {
      readonly type: "class.name.set";
      readonly classId: ClassId;
      readonly name: string;
    }
  | {
      readonly type: "class.label.set";
      readonly classId: ClassId;
      readonly label: string | null;
    }
  | {
      readonly type: "class.annotation.set";
      readonly classId: ClassId;
      readonly annotation: ClassAnnotation | null;
    }
  | {
      readonly type: "class.parentNamespace.set";
      readonly classId: ClassId;
      readonly parentNamespaceId: NamespaceId | null;
    }
  | {
      readonly type: "class.spatial.set";
      readonly classId: ClassId;
      readonly spatial: SpatialAttachment | null;
    }
  | {
      readonly type: "class.duplicate";
      readonly sourceClassId: ClassId;
      readonly position: Point;
    }
  | {
      readonly type: "class.directStyle.property.set";
      readonly classId: ClassId;
      readonly property: StylePropertyName;
      readonly value: string | null;
    }
  | {
      readonly type: "class.directStyle.set";
      readonly classId: ClassId;
      readonly properties: StyleProperties;
    }
  | {
      readonly type: "class.directStyle.clear";
      readonly classId: ClassId;
    }
  | {
      readonly type: "class.appliedStyle.set";
      readonly classId: ClassId;
      readonly styleDefId: StyleDefId | null;
    }
  | {
      readonly type: "class.interaction.set";
      readonly classId: ClassId;
      readonly interaction: InteractionAttachment | null;
    }

  // ==========================================================================
  // Class attribute
  // ==========================================================================
  | {
      readonly type: "class.attribute.create";
      readonly classId: ClassId;
      readonly text: string;
      readonly classifier: MemberClassifier | null;
      readonly beforeAttributeId: AttributeId | null;
    }
  | {
      readonly type: "class.attribute.set";
      readonly attributeId: AttributeId;
      readonly text: string;
      readonly classifier: MemberClassifier | null;
    }
  | {
      readonly type: "class.attribute.delete";
      readonly attributeId: AttributeId;
    }
  | {
      readonly type: "class.attribute.move";
      readonly attributeId: AttributeId;
      readonly classId: ClassId;
      readonly beforeAttributeId: AttributeId | null;
    }

  // ==========================================================================
  // Class method
  // ==========================================================================
  | {
      readonly type: "class.method.create";
      readonly classId: ClassId;
      readonly text: string;
      readonly classifier: MemberClassifier | null;
      readonly beforeMethodId: MethodId | null;
    }
  | {
      readonly type: "class.method.set";
      readonly methodId: MethodId;
      readonly text: string;
      readonly classifier: MemberClassifier | null;
    }
  | {
      readonly type: "class.method.delete";
      readonly methodId: MethodId;
    }
  | {
      readonly type: "class.method.move";
      readonly methodId: MethodId;
      readonly classId: ClassId;
      readonly beforeMethodId: MethodId | null;
    }

  // ==========================================================================
  // Lollipop interface
  // ==========================================================================
  | {
      readonly type: "class.lollipopInterface.create";
      readonly classId: ClassId;
      readonly label: string;
      readonly side: AttachmentSide;
    }
  | {
      readonly type: "class.lollipopInterface.delete";
      readonly lollipopInterfaceId: LollipopInterfaceId;
    }
  | {
      readonly type: "class.lollipopInterface.move";
      readonly lollipopInterfaceId: LollipopInterfaceId;
      readonly classId: ClassId;
      readonly beforeLollipopInterfaceId: LollipopInterfaceId | null;
    }
  | {
      readonly type: "class.lollipopInterface.label.set";
      readonly lollipopInterfaceId: LollipopInterfaceId;
      readonly label: string;
    }
  | {
      readonly type: "class.lollipopInterface.side.set";
      readonly lollipopInterfaceId: LollipopInterfaceId;
      readonly side: AttachmentSide;
    }

  // ==========================================================================
  // Namespace
  // ==========================================================================
  | {
      readonly type: "namespace.create";
      readonly name: string;
      readonly parentNamespaceId: NamespaceId | null;
      readonly spatial: SpatialAttachment;
      readonly initialClassIds: readonly ClassId[];
      readonly initialNamespaceIds: readonly NamespaceId[];
    }
  | {
      readonly type: "namespace.delete";
      readonly namespaceId: NamespaceId;
    }
  | {
      readonly type: "namespace.name.set";
      readonly namespaceId: NamespaceId;
      readonly name: string;
    }
  | {
      readonly type: "namespace.label.set";
      readonly namespaceId: NamespaceId;
      readonly label: string;
    }
  | {
      readonly type: "namespace.parentNamespace.set";
      readonly namespaceId: NamespaceId;
      readonly parentNamespaceId: NamespaceId | null;
    }
  | {
      readonly type: "namespace.spatial.set";
      readonly namespaceId: NamespaceId;
      readonly spatial: SpatialAttachment | null;
    }

  // ==========================================================================
  // Relationship
  // ==========================================================================
  | {
      readonly type: "relationship.create";
      readonly source: RelationshipEndpoint;
      readonly target: RelationshipEndpoint;
      readonly lineKind: RelationshipLineKind;
      readonly label: string | null;
    }
  | {
      readonly type: "relationship.delete";
      readonly relationshipId: RelationshipId;
    }
  | {
      readonly type: "relationship.source.class.set";
      readonly relationshipId: RelationshipId;
      readonly classId: ClassId;
    }
  | {
      readonly type: "relationship.target.class.set";
      readonly relationshipId: RelationshipId;
      readonly classId: ClassId;
    }
  | {
      readonly type: "relationship.source.multiplicity.set";
      readonly relationshipId: RelationshipId;
      readonly multiplicity: string | null;
    }
  | {
      readonly type: "relationship.target.multiplicity.set";
      readonly relationshipId: RelationshipId;
      readonly multiplicity: string | null;
    }
  | {
      readonly type: "relationship.source.endpointKind.set";
      readonly relationshipId: RelationshipId;
      readonly endpointKind: RelationshipEndpointKind;
    }
  | {
      readonly type: "relationship.target.endpointKind.set";
      readonly relationshipId: RelationshipId;
      readonly endpointKind: RelationshipEndpointKind;
    }
  | {
      readonly type: "relationship.lineKind.set";
      readonly relationshipId: RelationshipId;
      readonly lineKind: RelationshipLineKind;
    }
  | {
      readonly type: "relationship.label.set";
      readonly relationshipId: RelationshipId;
      readonly label: string | null;
    }

  // ==========================================================================
  // Note
  // ==========================================================================
  | {
      readonly type: "note.create";
      readonly text: string;
      readonly spatial: SpatialAttachment;
      readonly attachedToClassId: ClassId | null;
    }
  | {
      readonly type: "note.delete";
      readonly noteId: NoteId;
    }
  | {
      readonly type: "note.text.set";
      readonly noteId: NoteId;
      readonly text: string;
    }
  | {
      readonly type: "note.spatial.set";
      readonly noteId: NoteId;
      readonly spatial: SpatialAttachment;
    }
  | {
      readonly type: "note.attachment.set";
      readonly noteId: NoteId;
      readonly attachedToClassId: ClassId | null;
    }
  | {
      readonly type: "note.duplicate";
      readonly noteId: NoteId;
    }

  // ==========================================================================
  // Style definition
  // ==========================================================================
  | {
      readonly type: "style.definition.create";
      readonly name: string;
      readonly sourceKind: "classDef" | "externalCssClass";
      readonly properties: StyleProperties;
      readonly applyToClassIds: readonly ClassId[];
    }
  | {
      readonly type: "style.definition.delete";
      readonly styleDefId: StyleDefId;
    }
  | {
      readonly type: "style.definition.name.set";
      readonly styleDefId: StyleDefId;
      readonly name: string;
    }
  | {
      readonly type: "style.definition.sourceKind.set";
      readonly styleDefId: StyleDefId;
    }
  | {
      readonly type: "style.definition.property.set";
      readonly styleDefId: StyleDefId;
      readonly property: StylePropertyName;
      readonly value: string | null;
    }
  | {
      readonly type: "style.definition.clear";
      readonly styleDefId: StyleDefId;
    }

  // ==========================================================================
  // Style application
  // ==========================================================================
  | {
      readonly type: "style.application.create";
      readonly targetId: ClassId;
      readonly styleDefId: StyleDefId;
    }
  | {
      readonly type: "style.application.delete";
      readonly styleApplicationId: StyleApplicationId;
    }
  | {
      readonly type: "style.application.target.set";
      readonly styleApplicationId: StyleApplicationId;
      readonly targetId: ClassId;
    }
  | {
      readonly type: "style.application.styleDefinition.set";
      readonly styleApplicationId: StyleApplicationId;
      readonly styleDefId: StyleDefId;
    };

type EditorCommandType = EditorCommand["type"];

export type EditorCommandOf<TType extends EditorCommandType> = Extract<
  EditorCommand,
  { readonly type: TType }
>;
