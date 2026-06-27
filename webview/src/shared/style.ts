/**
 * @fileoverview Visual styling vocabulary (property names and class style values), independent of UML semantics.
 */

export type StylePropertyName = "fill" | "stroke" | "color" | "strokeWidth" | "strokeDasharray";

export type ClassStyleProperty = Extract<StylePropertyName, "fill" | "stroke" | "color">;

export type ClassStyleProperties = Partial<Record<ClassStyleProperty, string>>;
