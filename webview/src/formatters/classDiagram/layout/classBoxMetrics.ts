/**
 * @fileoverview Reads ClassBox layout metrics from CSS custom properties
 * defined in styles.css. Single source of truth shared between
 * ClassBox.module.css (rendering) and layout/ (size/position calculation).
 *
 * defaultWidth/defaultHeight/margin are used by gridPlacement today.
 * The font/line-height/header metrics are exported for future content-aware
 * sizing — not yet consumed by any caller.
 */

export type ClassBoxMetrics = {
  readonly defaultWidth: number;
  readonly defaultHeight: number;
  readonly margin: number;
  readonly fontSize: number;
  readonly memberFontSize: number;
  readonly memberLineHeight: number;
  readonly headerMinHeight: number;
};

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
