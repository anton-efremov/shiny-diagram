/**
 * @fileoverview Translates class.duplicate: copy declaration content, spatial annotation, and first style application.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { ClassNode, DiagramGraph } from "../../model/diagramGraph";
import type { ClassId, StyleDefId } from "../../../shared/ids";
import type { WriteIntent } from "../writeIntent";
import { generateDuplicateClassId } from "../generateId";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassDuplicate(
  command: EditorCommandOf<"class.duplicate">,
  graph: DiagramGraph
): WriteIntent[] {
  const source = graph.classes.get(command.sourceClassId);
  if (!source) throw new Error(`Class ${command.sourceClassId} cannot be duplicated`);
  if (!source.spatial) throw new Error(`Class ${command.sourceClassId} has no spatial data`);

  const id = generateDuplicateClassId(graph, command.sourceClassId);
  const anchor = {
    kind: "afterStatement" as const,
    statement: { kind: "class" as const, classId: command.sourceClassId },
  };
  const intents: WriteIntent[] = [
    {
      kind: "insertStatement",
      payload: composeDuplicatedClassDeclaration(source, id),
      anchor,
    },
    {
      kind: "insertStatement",
      payload: composeSpatialAnnotation(id, {
        position: command.position,
        size: source.spatial.size,
      }),
      anchor,
    },
  ];

  const style = [...graph.styleApplications.values()].find(
    (candidate) => candidate.targetId === command.sourceClassId
  );
  if (style) {
    intents.push({
      kind: "insertStatement",
      payload: composeClassStyleApplication(id, style.styleDefId),
      anchor,
    });
  }

  return intents;
}

function composeDuplicatedClassDeclaration(source: ClassNode, classId: ClassId): string {
  const lines = [`class ${classId}`];
  const members = [
    ...source.attributes.map((attribute) => attribute.name),
    ...source.methods.map((method) => `${method.name}(${method.parameters})`),
  ];
  if (source.annotation || members.length > 0) {
    lines[0] = `class ${classId} {`;
    if (source.annotation) lines.push(`<<${source.annotation}>>`);
    lines.push(...members);
    lines.push("}");
  }
  return lines.join("\n");
}

function composeClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${classId}:::${styleDefId}`;
}
