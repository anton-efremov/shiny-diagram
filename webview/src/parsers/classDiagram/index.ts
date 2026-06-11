/**
 * @fileoverview Public API for the Mermaid class diagram parser.
 * Orchestrates the tokenizer and rule functions to produce a DiagramModel
 * from raw Mermaid source. Pure function — no React, no VS Code dependencies.
 */

import type { DiagramModel } from "./diagramModel";
import { tokenize } from "./tokenizer";
import { parseClasses } from "./rules/parseClasses";
import { parseRelationships } from "./rules/parseRelationships";
import { parseStyles } from "./rules/parseStyles";
import { parseSpatial } from "./rules/parseSpatial";

/**
 * Parses a Mermaid class diagram source string into a DiagramModel.
 * All rules receive the same tokenized line sequence and run independently.
 *
 * @param source - Full .mmd file content.
 * @returns Immutable DiagramModel ready for editor components to consume.
 */
export function parseDiagram(source: string): DiagramModel {
  const lines = tokenize(source);

  const classNodes = parseClasses(lines);
  const relationships = parseRelationships(lines);
  const styleDefs = parseStyles(lines);
  const spatialList = parseSpatial(lines);

  const classes = new Map(classNodes.map((c) => [c.id, c]));
  const styleDefinitions = new Map(styleDefs.map((s) => [s.name, s]));
  const spatialAnnotations = new Map(spatialList.map((a) => [a.classId, a]));

  return { classes, relationships, styleDefinitions, spatialAnnotations };
}
