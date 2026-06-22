/**
 * @fileoverview Formats complete Mermaid source lines emitted by command handlers.
 */

import type { StyleDefNode } from "../../model/diagramTree";
import type { ClassId, StyleDefId } from "../../../shared/ids";
import type { StylePropertyName } from "../../../shared/styleTypes";

/**
 * Formats a minimal Mermaid class declaration line.
 */
export function formatClassDeclaration(classId: ClassId): string {
  return `class ${classId}`;
}

/**
 * Duplicates a class declaration or block by replacing only the declared class ID.
 */
export function formatDuplicatedClassDeclaration(
  declarationText: string,
  classId: ClassId
): string | null {
  const match = /^(\s*class\s+)(\w+)/.exec(declarationText);
  if (!match) return null;

  return `${match[1]}${classId}${declarationText.slice(match[0].length)}`;
}

/**
 * Formats a native Mermaid class style application line.
 */
export function formatClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${classId}:::${styleDefId}`;
}

/**
 * Formats a minimal Mermaid classDef line.
 */
export function formatMinimalStyleDef(
  styleDefId: StyleDefId,
  property: "fill" | "stroke" | "color",
  value: string
): string {
  return `classDef ${styleDefId} ${property}:${value}`;
}

/**
 * Formats a complete Shiny spatial annotation line.
 */
export function formatSpatialAnnotation(
  classId: string,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const rx = Math.round(x);
  const ry = Math.round(y);
  return `%% @spatial:${classId} x=${rx} y=${ry} w=${width} h=${height}`;
}

/**
 * Formats a complete classDef line with one property updated.
 */
export function formatStyleProperty(
  style: StyleDefNode,
  property: StylePropertyName,
  value: string
): string {
  const match = /^(\s*classDef\s+\w+\s+)(.*)$/.exec(style.location.raw);
  if (!match) {
    return `classDef ${style.id} ${property}:${value}`;
  }

  const prefix = match[1];
  const properties = match[2]
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const index = properties.findIndex((p) => p.split(":", 1)[0].trim() === property);

  if (index === -1) {
    properties.push(`${property}:${value}`);
  } else {
    properties[index] = `${property}:${value}`;
  }

  return `${prefix}${properties.join(",")}`;
}

/**
 * Clones a Mermaid classDef line under a new style ID and changes one property.
 */
export function formatClonedStyleDefProperty(
  style: StyleDefNode,
  styleDefId: StyleDefId,
  property: "fill" | "stroke" | "color",
  value: string
): string {
  const match = /^(\s*classDef\s+)(\w+)(\s+)(.*)$/.exec(style.location.raw);
  if (!match) {
    return formatMinimalStyleDef(styleDefId, property, value);
  }

  return `${match[1]}${styleDefId}${match[3]}${formatProperties(match[4], property, value)}`;
}

/**
 * Retargets a class style application to another style definition.
 */
export function formatRetargetedClassStyleApplication(
  rawApplication: string,
  styleDefId: StyleDefId
): string | null {
  const match = /^(\s*class\s+\w+:::)(\w+)(.*)$/.exec(rawApplication);
  if (!match) return null;

  return `${match[1]}${styleDefId}${match[3]}`;
}

function formatProperties(
  rawProperties: string,
  property: "fill" | "stroke" | "color",
  value: string
): string {
  const properties = rawProperties
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const index = properties.findIndex((p) => toSemanticPropertyName(p) === property);

  if (index === -1) {
    properties.push(`${property}:${value}`);
  } else {
    properties[index] = `${property}:${value}`;
  }

  return properties.join(",");
}

function toSemanticPropertyName(propertyText: string): string {
  const key = propertyText.split(":", 1)[0]?.trim();
  switch (key) {
    case "stroke-width":
      return "strokeWidth";
    case "stroke-dasharray":
      return "strokeDasharray";
    default:
      return key;
  }
}
