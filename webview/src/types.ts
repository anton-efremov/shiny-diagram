/**
 * @fileoverview Shared domain types for the Shiny webview.
 */

export type Mode = "autorender" | "editor";

export type SpatialBox = {
  className: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
