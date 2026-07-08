/**
 * @fileoverview Translates `class.create`.
 *
 * Emits class creation as two logical statement insertions.
 *
 * 1. Class declaration statement
 * - Written inside the requested parent namespace if `parentNamespaceId` is set
 * or diagram scope otherwise
 * - Written after the latest class statement in the target scope.
 * - If no class statements in the target scope - after the latest namespace statement
 * - Otherwise, in the beginning of scope block
 *
 * 2. Spatial annotation
 * - Written after the latest class spatial annotation in the target scope.
 * - If no class spatial annotations - after latest statement of any kind.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { ClassId } from "../../../shared/ids";
import type { TranslateContext } from "../translateContext";
import { spellIdentity } from "../../model/identitySpelling";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassCreate(
  command: EditorCommandOf<"class.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  const id = context.allocateClassId(null);
  const declarationScope: BlockRef = command.parentNamespaceId
    ? { kind: "namespace", namespaceId: command.parentNamespaceId }
    : { kind: "diagram" };
  const diagramScope: BlockRef = { kind: "diagram" };

  // ---
  // Class declaration
  // ---
  const declarationAnchor: StatementAnchor =
    asSameKind(anchorAfterKindList(graph, provenance, declarationScope, ["class"])) ??
    asDifferentKind(anchorAfterKindList(graph, provenance, declarationScope, ["namespace"])) ??
    anchorBlockOpening(declarationScope);
  const insertDeclarationIntent: WriteIntent = {
    kind: "insertStatement",
    payload: composeClassDeclaration(id),
    anchor: declarationAnchor,
  };

  // ---
  // Spatial annotation
  // ---
  const spatialAnchor: StatementAnchor =
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["classSpatial"])) ??
    asDifferentKind(anchorAfterKindList(graph, provenance, diagramScope, STATEMENT_KINDS)) ??
    anchorBlockOpening(diagramScope);
  const insertSpatialIntent: WriteIntent = {
    kind: "insertStatement",
    payload: composeSpatialAnnotation(id, command.spatial),
    anchor: spatialAnchor,
  };

  return [insertDeclarationIntent, insertSpatialIntent];
}

function composeClassDeclaration(classId: ClassId): string {
  return `class ${spellIdentity(classId)}`;
}
