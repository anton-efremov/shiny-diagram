/**
 * @fileoverview Tokenizes Mermaid class diagram source into a flat sequence of
 * typed lines. Identifies line types and groups multi-line class body blocks so
 * rule functions receive structured token output rather than raw strings.
 */

/** Semantic type of a single source line. */
export type LineType =
  | "classDecl"
  | "relationship"
  | "styleDef"
  | "styleApplication"
  | "spatialAnnotation"
  | "namespace"
  | "directive"
  | "blank"
  | "unknown";

/**
 * A single tokenized source line, optionally carrying grouped body lines
 * for multi-line constructs (class bodies, namespaces).
 */
export type TokenizedLine = {
  readonly lineNumber: number;
  readonly raw: string;
  readonly type: LineType;
  /** Body lines for block constructs (class body, namespace body). */
  readonly blockLines?: readonly TokenizedLine[];
};

/**
 * Splits Mermaid source into a typed, optionally grouped token sequence.
 * Class bodies and namespace bodies are grouped under their opening line so
 * rules receive a flat list of top-level constructs.
 *
 * @param source - Full .mmd file content.
 * @returns Flat array of tokenized lines with block grouping applied.
 */
export function tokenize(source: string): TokenizedLine[] {
  const rawLines = source.split("\n");
  const result: TokenizedLine[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const raw = rawLines[i];
    const lineNumber = i;
    const type = detectLineType(raw);

    if ((type === "classDecl" || type === "namespace") && raw.includes("{")) {
      // Opening brace: check if the block closes on the same line.
      const closesOnSameLine = /\{[^}]*\}/.test(raw);
      if (closesOnSameLine) {
        result.push({ lineNumber, raw, type, blockLines: [] });
        i++;
      } else {
        const blockLines: TokenizedLine[] = [];
        i++;
        while (i < rawLines.length && !/^\s*\}\s*$/.test(rawLines[i])) {
          blockLines.push({
            lineNumber: i,
            raw: rawLines[i],
            type: detectLineType(rawLines[i]),
          });
          i++;
        }
        result.push({ lineNumber, raw, type, blockLines });
        i++; // consume the closing "}"
      }
    } else {
      result.push({ lineNumber, raw, type });
      i++;
    }
  }

  return result;
}

/**
 * Determines the semantic type of a single raw source line.
 * Order matters: more specific patterns are tested before broader ones.
 */
function detectLineType(raw: string): LineType {
  if (/^\s*$/.test(raw)) return "blank";
  if (/^\s*%%\s+@spatial:/.test(raw)) return "spatialAnnotation";
  if (/^\s*%%/.test(raw)) return "directive";
  if (/^\s*classDef\s+/.test(raw)) return "styleDef";
  // styleApplication must be checked before classDecl — both start with "class \w"
  if (/^\s*class\s+\w+:::/.test(raw)) return "styleApplication";
  if (/^\s*class\s+\w/.test(raw)) return "classDecl";
  if (/^\s*namespace\s+\w/.test(raw)) return "namespace";
  if (/\w+\s*(?:-->|<\|--|<\|--\|>|\*--|o--|--\(\)|\.\.>|\.\.\|>|\.\.| -- )\s*\w/.test(raw))
    return "relationship";
  return "unknown";
}
