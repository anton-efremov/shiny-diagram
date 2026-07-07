/**
 * @fileoverview Tokenizes Mermaid source lines for the parse pipeline.
 */

export type ParseTokenType =
  | "classDeclaration"
  | "relationship"
  | "styleDef"
  | "classDirectStyle"
  | "styleApplication"
  | "spatialAnnotation"
  | "namespace"
  | "directive"
  | "blank"
  | "unknown";

export type ParseToken = {
  readonly lineNumber: number;
  readonly endLine: number;
  readonly raw: string;
  readonly fullRaw: string;
  readonly type: ParseTokenType;
  readonly blockTokens?: readonly ParseToken[];
};

/**
 * Tokenizes Mermaid source while retaining source lines and nested block structure.
 */
export function tokenize(source: string): ParseToken[] {
  const rawLines = source.split("\n");
  return tokenizeLines(rawLines, 0, rawLines.length).nodes;
}

function tokenizeLines(
  rawLines: string[],
  start: number,
  end: number
): { nodes: ParseToken[]; nextIndex: number } {
  const nodes: ParseToken[] = [];
  let i = start;

  while (i < end) {
    const raw = rawLines[i];

    if (/^\s*\}\s*$/.test(raw)) {
      break;
    }

    const lineNumber = i;
    const type = detectLineType(raw);

    if ((type === "classDeclaration" || type === "namespace") && raw.includes("{")) {
      const closesOnSameLine = /\{[^}]*\}/.test(raw);
      if (closesOnSameLine) {
        nodes.push({ lineNumber, endLine: lineNumber, raw, fullRaw: raw, type, blockTokens: [] });
        i++;
      } else {
        const { nodes: blockTokens, nextIndex } = tokenizeLines(rawLines, i + 1, end);
        nodes.push({
          lineNumber,
          endLine: nextIndex,
          raw,
          fullRaw: rawLines.slice(lineNumber, nextIndex + 1).join("\n"),
          type,
          blockTokens,
        });
        i = nextIndex + 1;
      }
    } else {
      nodes.push({ lineNumber, endLine: lineNumber, raw, fullRaw: raw, type });
      i++;
    }
  }

  return { nodes, nextIndex: i };
}

function detectLineType(raw: string): ParseTokenType {
  if (/^\s*$/.test(raw)) return "blank";
  if (/^\s*%%\s+@spatial:/.test(raw)) return "spatialAnnotation";
  if (/^\s*%%/.test(raw)) return "directive";
  if (/^\s*classDef\s+/.test(raw)) return "styleDef";
  if (/^\s*style\s+\w+\s+/.test(raw)) return "classDirectStyle";
  if (/^\s*class\s+\w+:::/.test(raw)) return "styleApplication";
  if (/^\s*class\s+\w/.test(raw)) return "classDeclaration";
  if (/^\s*namespace\s+\w/.test(raw)) return "namespace";
  if (
    /^\s*\w+(?:\s+"[^"]+")?\s*(?:\(\)|<\||\|>|<|>|\*|o)?(?:--|\.\.)(?:\(\)|<\||\|>|<|>|\*|o)?\s*(?:"[^"]+"\s*)?\w+(?:\s*:\s*.*)?\s*$/.test(
      raw
    )
  )
    return "relationship";
  return "unknown";
}
