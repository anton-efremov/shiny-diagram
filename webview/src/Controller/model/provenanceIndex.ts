/**
 * @fileoverview Source-location index for addressable DiagramGraph facts.
 *
 * The current parser produces locations for classes, members, namespaces,
 * style definitions, relationships, style applications, namespace membership,
 * and class spatial annotations. It does not yet produce first-class lollipop
 * interfaces, notes, style-definition node distinctions beyond classDef, or
 * diagram config provenance.
 */

import type {
  AttributeId,
  ClassId,
  MethodId,
  NamespaceId,
  RelationshipId,
  StyleApplicationId,
  StyleDefId,
} from "../../shared/ids";
import type { SourceLocation } from "./sourceLocation";

export type ProvenanceIndex = {
  readonly classes: ReadonlyMap<ClassId, SourceLocation>;
  readonly members: ReadonlyMap<AttributeId | MethodId, SourceLocation>;
  readonly namespaces: ReadonlyMap<NamespaceId, SourceLocation>;
  readonly styleDefinitions: ReadonlyMap<StyleDefId, SourceLocation>;
  readonly relationships: ReadonlyMap<RelationshipId, SourceLocation>;
  readonly classSpatial: ReadonlyMap<ClassId, SourceLocation>;
  readonly namespaceMemberships: ReadonlyMap<ClassId, SourceLocation>;
  readonly styleApplications: ReadonlyMap<StyleApplicationId, SourceLocation>;
};
