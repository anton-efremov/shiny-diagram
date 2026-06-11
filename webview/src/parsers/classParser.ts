/**
 * @fileoverview Parses Mermaid class diagram source into spatial box data
 * and React Flow node models. Class names are extracted from the Mermaid AST
 * via mermaid.mermaidAPI.getDiagramFromText(); spatial annotations are
 * extracted from source text using regex. No React hooks, no VS Code
 * dependencies.
 */

import mermaid from "mermaid";
import type { Node } from "@xyflow/react";
import type { SpatialBox } from "../types";

export type ClassNodeData = {
  label: string;
};

// Minimal structural type for the class diagram DB.
// We avoid importing from mermaid/dist internals to reduce coupling to mermaid's private API.
type ClassDiagramDb = {
  getClasses(): Map<string, { id: string }>;
};

/**
 * Extracts spatial box data for all declared classes that have a matching
 * spatial annotation. Classes without an annotation are omitted.
 */
export async function extractSpatialBoxes(source: string): Promise<SpatialBox[]> {
  const classNames = await extractClassNamesFromAst(source);
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
 * Extracts unique class names from the Mermaid AST.
 * Uses Mermaid's own parser rather than a regex reimplementation.
 */
async function extractClassNamesFromAst(source: string): Promise<string[]> {
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  const db = diagram.db as unknown as ClassDiagramDb;
  return [...db.getClasses().keys()];
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
