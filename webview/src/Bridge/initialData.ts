/**
 * @fileoverview Reads initial Mermaid source injected into the webview document.
 */

/**
 * Returns the host-injected document snapshot when it is present and valid.
 */
export function readInitialData(): { readonly sourceText: string; readonly documentName: string } {
  const dataElement = document.getElementById("shiny-initial-data");

  if (!dataElement?.textContent) return { sourceText: "", documentName: "" };

  try {
    const parsed: unknown = JSON.parse(dataElement.textContent);
    if (typeof parsed !== "object" || parsed === null) {
      return { sourceText: "", documentName: "" };
    }
    const data = parsed as { sourceText?: unknown; documentName?: unknown };
    return {
      sourceText: typeof data.sourceText === "string" ? data.sourceText : "",
      documentName: typeof data.documentName === "string" ? data.documentName : "",
    };
  } catch {
    return { sourceText: "", documentName: "" };
  }
}
