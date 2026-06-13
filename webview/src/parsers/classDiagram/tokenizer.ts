/**
 * @fileoverview Tokenizes Mermaid class diagram source into a tree of typed
 * tokens. Identifies line types and recursively groups block constructs
 * (class bodies, namespace bodies) so rule functions receive structured,
 * hierarchical token output rather than raw strings.
 */

/** Semantic type of a single parsed token. */
export type ParseTokenType =
  | "classDeclaration"
  | "relationship"
  | "styleDef"
  | "styleApplication"
  | "spatialAnnotation"
  | "namespace"
  | "directive"
  | "blank"
  | "unknown";

/**
 * A single parsed token in the tokenizer output tree.
 * Block constructs (class bodies, namespace bodies) carry their inner lines
 * as child parsed token, enabling arbitrary nesting depth.
 */
export type ParseToken = {
  readonly lineNumber: number;
  readonly raw: string;
  readonly type: ParseTokenType;
  /** Child tokens for block constructs. Present only on classDeclaration and namespace tokens. */
  readonly blockTokens?: readonly ParseToken[];
};

/**
 * Splits Mermaid source into a tree of typed tokens.
 * Block constructs are grouped recursively under their opening line so
 * rule functions receive a flat list of top-level constructs, each
 * carrying its children as blockTokens.
 *
 * @param source - Full .mmd file content.
 * @returns Flat array of top-level tokens with recursive block grouping applied.
 */
export function tokenize(source: string): ParseToken[] {
  const rawLines = source.split("\n");
  return tokenizeLines(rawLines, 0, rawLines.length).nodes;
}

/**
 * Recursively tokenizes a slice of raw lines into tokens.
 * Stops when it reaches a closing "}" or the end of the slice.
 *
 * @param rawLines - Full array of raw source lines, not a slice
 * @param start - Index to start tokenizing from.
 * @param end - Index to stop tokenizing at (exclusive).
 * @returns Parsed tokens and the index of the next unprocessed line.
 */
function tokenizeLines(
  rawLines: string[],
  start: number,
  end: number
): { nodes: ParseToken[]; nextIndex: number } {
  const nodes: ParseToken[] = [];
  let i = start;

  while (i < end) {
    const raw = rawLines[i];

    // Stop at a closing brace — caller consumes it. Mermaid requires closing "}" on its own line.
    if (/^\s*\}\s*$/.test(raw)) {
      break;
    }

    const lineNumber = i;
    const type = detectLineType(raw);

    if ((type === "classDeclaration" || type === "namespace") && raw.includes("{")) {
      // Opening brace on the same line as the declaration.
      const closesOnSameLine = /\{[^}]*\}/.test(raw);
      if (closesOnSameLine) {
        nodes.push({ lineNumber, raw, type, blockTokens: [] });
        i++;
      } else {
        // Recurse into the block body, collecting child tokens.
        const { nodes: blockTokens, nextIndex } = tokenizeLines(rawLines, i + 1, end);
        nodes.push({ lineNumber, raw, type, blockTokens });
        i = nextIndex + 1; // +1 to consume the closing "}"
      }
    } else {
      nodes.push({ lineNumber, raw, type });
      i++;
    }
  }

  return { nodes, nextIndex: i };
}

/**
 * Determines the semantic type of a single raw source line.
 * Order matters: more specific patterns are tested before broader ones.
 */
function detectLineType(raw: string): ParseTokenType {
  if (/^\s*$/.test(raw)) return "blank";
  if (/^\s*%%\s+@spatial:/.test(raw)) return "spatialAnnotation";
  if (/^\s*%%/.test(raw)) return "directive";
  if (/^\s*classDef\s+/.test(raw)) return "styleDef";
  // styleApplication must be checked before classDeclaration — both start with "class \w"
  if (/^\s*class\s+\w+:::/.test(raw)) return "styleApplication";
  if (/^\s*class\s+\w/.test(raw)) return "classDeclaration";
  if (/^\s*namespace\s+\w/.test(raw)) return "namespace";
  if (/\w+\s*(?:-->|<\|--|<\|--\|>|\*--|o--|--\(\)|\.\.>|\.\.\|>|\.\.| -- )\s*\w/.test(raw))
    return "relationship";
  return "unknown";
}
