/**
 * @fileoverview Spatial primitives (Rect, Point, Size) shared across Controller and View contracts.
 */

export type Rect = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};
export type Point = { readonly x: number; readonly y: number };
export type Size = { readonly width: number; readonly height: number };
