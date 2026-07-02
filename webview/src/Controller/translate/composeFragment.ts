/**
 * @fileoverview Composes zero-indent Mermaid fragments for write intents.
 */

import type { ClassNode } from "../model/diagramGraph";
import type { Point, Size, SpatialAttachment } from "../../shared/geometry";
import type { ClassId, StyleDefId } from "../../shared/ids";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../shared/style";

export function composeClassDeclaration(classId: ClassId): string {
  return `class ${classId}`;
}

export function composeDuplicatedClassDeclaration(source: ClassNode, classId: ClassId): string {
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

export function composeSpatialAnnotation(classId: ClassId, spatial: SpatialAttachment): string {
  return composeSpatialAnnotationParts(classId, spatial.position, spatial.size);
}

export function composeSpatialAnnotationParts(
  classId: ClassId,
  position: Point,
  size: Size
): string {
  const x = Math.round(position.x);
  const y = Math.round(position.y);
  return `%% @spatial:${classId} x=${x} y=${y} w=${size.width} h=${size.height}`;
}

export function composeClassDirectStyle(
  classId: ClassId,
  property: StylePropertyName,
  value: string
): string {
  return `style ${classId} ${composeStyleEntry(property, value)}`;
}

export function composeStyleEntry(property: StylePropertyName, value: string): string {
  return `${toSourcePropertyName(property)}:${value}`;
}

export function composeStyleValue(value: string | number): string {
  return String(value);
}

export function composeClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${classId}:::${styleDefId}`;
}

function toSourcePropertyName(property: StylePropertyName): string {
  return (
    STYLE_PROPERTIES.find((styleProperty) => styleProperty.name === property)?.source ?? property
  );
}
