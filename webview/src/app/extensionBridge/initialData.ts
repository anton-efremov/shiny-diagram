export function readInitialData(): string {
  const dataElement = document.getElementById("shiny-initial-data");

  if (!dataElement?.textContent) return "";

  try {
    const parsed: unknown = JSON.parse(dataElement.textContent);
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return "";
  }
}
