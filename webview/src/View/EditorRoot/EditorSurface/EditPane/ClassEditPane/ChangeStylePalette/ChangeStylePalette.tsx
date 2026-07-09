/**
 * @behavior Selected class style property common-value derivation.
 * @render Class style property controls.
 */

import type { ChangeEvent, ReactElement } from "react";
import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../../../../shared/style";
import type { ClassView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./ChangeStylePalette.module.css";

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

type ChangeStylePaletteProps = {
  readonly view: readonly ClassView[];
};

export default function ChangeStylePalette({ view }: ChangeStylePaletteProps): ReactElement {
  // Event handler props derivation
  const { onPropertyChange } = useInteractions(view);

  return (
    <section className={styles.palette} aria-label="Change style palette">
      {STYLE_PROPERTIES.map(({ name }) => (
        <label key={name} className={styles.control}>
          <span>{toLabel(name)}</span>
          <input
            type={isColorProperty(name) ? "color" : "text"}
            value={toInputValue(toCommonPropertyValue(view, name), name)}
            placeholder={toPlaceholder(toCommonPropertyValue(view, name))}
            onChange={(event) => onPropertyChange(name, toValue(event))}
          />
        </label>
      ))}
    </section>
  );
}

// Private helpers
function toCommonPropertyValue(
  classes: readonly ClassView[],
  property: StylePropertyName
): string | null | "multiple" {
  const first = (classes[0]?.style ?? EMPTY_STYLE_PROPERTIES)[property];
  return classes.every(
    (classView) => (classView.style ?? EMPTY_STYLE_PROPERTIES)[property] === first
  )
    ? first
    : "multiple";
}

function toInputValue(value: string | null | "multiple", property: StylePropertyName): string {
  if (value === "multiple" || value === null) return isColorProperty(property) ? "#ffffff" : "";
  return value;
}

function toPlaceholder(value: string | null | "multiple"): string {
  return value === "multiple" ? "multiple" : "";
}

function toValue(event: ChangeEvent<HTMLInputElement>): string | null {
  return event.currentTarget.value.trim() === "" ? null : event.currentTarget.value;
}

function isColorProperty(property: StylePropertyName): boolean {
  return property === "fill" || property === "stroke" || property === "color";
}

function toLabel(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return "Fill";
    case "stroke":
      return "Stroke";
    case "strokeWidth":
      return "Stroke width";
    case "strokeDasharray":
      return "Stroke dasharray";
    case "color":
      return "Text";
  }
}
