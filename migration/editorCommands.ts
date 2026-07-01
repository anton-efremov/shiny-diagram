/**
 * @fileoverview Canonical registry of View-to-Controller editor commands.
 *
 * This file defines every command shape the View may emit to Controller.
 * Components construct these command values, but must not define additional
 * View-to-Controller command shapes elsewhere.
 *
 * Commands describe stable editor intent in product/editor vocabulary, not UI
 * events, framework mechanics, source syntax, or persistence details.
 *
 * Command names follow: <editor-object-path>.<action>.
 * Prefer one command per independently meaningful editor fact.
 *
 * Command annotations identify exact View components:
 * - Initiated by: component that hears the user event.
 * - Emitted by: lowest View component that has enough context to dispatch the
 *   fully specified command transaction.
 *
 * If the contract is NOT IMPLEMENTED YET, the component names in "Initiated by"
 * and "Emitted by" are written to the best current guess.
 */

import type {
  ClassId,
  NamespaceId,
  NoteId,
  RelationshipId,
  StyleDefId,
} from "../../shared/ids";
import type { StyleProperties, StylePropertyName } from "../../shared/style";
import type {
  AttachmentSide,
  AttributeId,
  ClassAnnotation,
  DiagramDirection,
  InteractionAttachment,
  LollipopInterfaceId,
  MethodId,
  NoteSpatial,
  RelationshipEndpoint,
  RelationshipEndpointKind,
  RelationshipLineKind,
  SpatialAttachment,
  StyleApplicationId,
  Visibility,
} from "./diagramGraph";

/** One View-to-Controller editor transaction. */
export type EditorCommandTransaction = readonly EditorCommand[];

export type EditorDispatch = (transaction: EditorCommandTransaction) => void;

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
      readonly name: string;
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
      readonly label: string;
    }
  | {
      readonly type: "class.genericType.set";
      readonly classId: ClassId;
      readonly genericType: string | null;
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
      readonly type: "class.directStyle.property.set";
      readonly classId: ClassId;
      readonly property: StylePropertyName;
      readonly value: string | null;
    }
  | {
      readonly type: "class.directStyle.clear";
      readonly classId: ClassId;
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
      readonly name: string;
      readonly beforeAttributeId: AttributeId | null;
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
  | {
      readonly type: "class.attribute.name.set";
      readonly attributeId: AttributeId;
      readonly name: string;
    }
  | {
      readonly type: "class.attribute.visibility.set";
      readonly attributeId: AttributeId;
      readonly visibility: Visibility | null;
    }
  | {
      readonly type: "class.attribute.type.set";
      readonly attributeId: AttributeId;
      readonly attributeType: string | null;
    }
  | {
      readonly type: "class.attribute.static.set";
      readonly attributeId: AttributeId;
      readonly isStatic: boolean;
    }

  // ==========================================================================
  // Class method
  // ==========================================================================
  | {
      readonly type: "class.method.create";
      readonly classId: ClassId;
      readonly name: string;
      readonly parameters: string;
      readonly beforeMethodId: MethodId | null;
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
  | {
      readonly type: "class.method.name.set";
      readonly methodId: MethodId;
      readonly name: string;
    }
  | {
      readonly type: "class.method.visibility.set";
      readonly methodId: MethodId;
      readonly visibility: Visibility | null;
    }
  | {
      readonly type: "class.method.parameters.set";
      readonly methodId: MethodId;
      readonly parameters: string;
    }
  | {
      readonly type: "class.method.returnType.set";
      readonly methodId: MethodId;
      readonly returnType: string | null;
    }
  | {
      readonly type: "class.method.static.set";
      readonly methodId: MethodId;
      readonly isStatic: boolean;
    }
  | {
      readonly type: "class.method.abstract.set";
      readonly methodId: MethodId;
      readonly isAbstract: boolean;
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
      readonly spatial: NoteSpatial;
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
      readonly spatial: NoteSpatial;
    }

  // ==========================================================================
  // Style definition
  // ==========================================================================
  | {
      readonly type: "style.definition.create";
      readonly name: string;
      readonly sourceKind: "classDef" | "externalCssClass";
      readonly properties: StyleProperties;
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
      // NOTE: mirrors the catalog verbatim, which omits the target value.
      // Almost certainly should also carry `sourceKind: "classDef" | "externalCssClass"`.
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
