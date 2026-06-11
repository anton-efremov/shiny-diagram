/**
 * @fileoverview Parses Mermaid class diagram source text into spatial box data
 * and React Flow node models. Pure functions only — no React hooks, no VS Code
 * dependencies.
 */

import type { Node } from "@xyflow/react";
import type { SpatialBox } from "../types";

export type ClassNodeData = {
  label: string;
};

/**
 * Rewrites hyphenated CSS property names in classDef lines to camelCase so
 * Mermaid's parser accepts them without errors.
 *
 * @param source - Full .mmd file content.
 * @returns Source string with classDef property names normalized.
 */
export function normalizeClassDefStyleProperties(source: string): string {
  return source.replace(
    /^(\s*classDef\s+\S+\s+)(.*)$/gm,
    (_line, prefix: string, styleProps: string) => {
      const normalized = styleProps
        .replace(/\bstroke-width:/g, "strokeWidth:")
        .replace(/\bstroke-dasharray:/g, "strokeDasharray:");

      return `${prefix}${normalized}`;
    }
  );
}

/**
 * Extracts spatial box data for all declared classes that have a matching
 * spatial annotation. Classes without an annotation are omitted.
 */
export function extractSpatialBoxes(source: string): SpatialBox[] {
  const classNames = extractClassNames(source);
  const spatialByClassName = extractSpatialAnnotations(source);

  return classNames.flatMap((className) => {
    const spatial = spatialByClassName.get(className);

    if (!spatial) {
      return [];
    }

    return [
      {
        className,
        ...spatial,
      },
    ];
  });
}

/**
 * Converts spatial box data into React Flow node descriptors for the Editor canvas.
 */
export function toReactFlowNodes(boxes: SpatialBox[]): Array<Node<ClassNodeData, "classBox">> {
  return boxes.map((box) => ({
    id: box.className,
    type: "classBox",
    position: { x: box.x, y: box.y },
    data: { label: box.className },
    width: box.width,
    height: box.height,
    style: {
      width: box.width,
      height: box.height,
    },
    draggable: false,
    selectable: false,
  }));
}

/**
 * Extracts unique class names declared with a class block in Mermaid source.
 */
function extractClassNames(source: string): string[] {
  const names = new Set<string>();
  const classBlockPattern = /^\s*class\s+([A-Za-z_][\w]*)\s*(?:\{|$)/gm;
  let match: RegExpExecArray | null;

  while ((match = classBlockPattern.exec(source)) !== null) {
    names.add(match[1]);
  }

  return [...names];
}

/**
 * Extracts all @spatial annotations from Mermaid source, keyed by class name.
 */
function extractSpatialAnnotations(source: string): Map<string, Omit<SpatialBox, "className">> {
  const spatialByClassName = new Map<string, Omit<SpatialBox, "className">>();
  const annotationPattern = /^\s*%%\s+@spatial:([A-Za-z_][\w]*)\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = annotationPattern.exec(source)) !== null) {
    const values = parseSpatialValues(match[2]);

    if (values) {
      spatialByClassName.set(match[1], values);
    }
  }

  return spatialByClassName;
}

/**
 * Parses a spatial annotation value string into numeric x, y, width, height fields.
 * Returns null if any required key is missing or non-finite.
 */
function parseSpatialValues(valueText: string): Omit<SpatialBox, "className"> | null {
  const values = new Map<string, number>();

  for (const part of valueText.trim().split(/\s+/)) {
    const [key, rawValue] = part.split("=");
    const value = Number(rawValue);

    if (key && Number.isFinite(value)) {
      values.set(key, value);
    }
  }

  const x = values.get("x");
  const y = values.get("y");
  const width = values.get("w");
  const height = values.get("h");

  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }

  return { x, y, width, height };
}
