import type { ClassBoxMetrics } from "./commands/commandTypes";

export type { ClassBoxMetrics };

function readPx(propertyName: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim();
  return parseFloat(value);
}

export function readClassBoxMetrics(): ClassBoxMetrics {
  return {
    defaultWidth: readPx("--shiny-classbox-default-width"),
    defaultHeight: readPx("--shiny-classbox-default-height"),
    margin: readPx("--shiny-classbox-margin"),
    fontSize: readPx("--shiny-classbox-font-size"),
    memberFontSize: readPx("--shiny-classbox-member-font-size"),
    memberLineHeight: readPx("--shiny-classbox-member-line-height"),
    headerMinHeight: readPx("--shiny-classbox-header-min-height"),
  };
}
