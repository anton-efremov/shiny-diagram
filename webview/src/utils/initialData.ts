/**
 * @fileoverview Reads the initial source text injected by the extension host
 * into the webview's #shiny-initial-data script tag. No React dependencies.
 */

/**
 * Reads the JSON-encoded source text from the #shiny-initial-data script tag.
 * Returns an empty string if the tag is missing or its content is malformed.
 */
export function readInitialData(): string {
  const dataElement = document.getElementById("shiny-initial-data");

  if (!dataElement?.textContent) {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(dataElement.textContent);
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return "";
  }
}
