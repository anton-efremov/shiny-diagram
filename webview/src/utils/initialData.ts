/**
 * @fileoverview Reads and validates the initial data injected by the extension
 * host into the webview's #shiny-initial-data script tag. No React dependencies.
 */

export type InitialData = {
  fileName: string;
  firstLine: string;
  lineCount: number;
  characterCount: number;
  sourceText: string;
};

/**
 * Reads the JSON blob from the #shiny-initial-data script tag injected by the
 * extension host. Returns safe defaults for any missing or malformed fields.
 */
export function readInitialData(): InitialData {
  const dataElement = document.getElementById("shiny-initial-data");

  if (!dataElement?.textContent) {
    return {
      fileName: "No active document",
      firstLine: "",
      lineCount: 0,
      characterCount: 0,
      sourceText: "",
    };
  }

  let parsed: Partial<InitialData>;

  try {
    parsed = JSON.parse(dataElement.textContent) as Partial<InitialData>;
  } catch {
    parsed = {
      sourceText: "",
      fileName: "Invalid initial webview data",
    };
  }

  return {
    fileName: typeof parsed.fileName === "string" ? parsed.fileName : "No active document",
    firstLine: typeof parsed.firstLine === "string" ? parsed.firstLine : "",
    lineCount: typeof parsed.lineCount === "number" ? parsed.lineCount : 0,
    characterCount: typeof parsed.characterCount === "number" ? parsed.characterCount : 0,
    sourceText: typeof parsed.sourceText === "string" ? parsed.sourceText : "",
  };
}
