/**
 * @behavior Named style property edit routing.
 * @render Named style property controls.
 */

import type { ChangeEvent, ReactElement } from "react";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../../../../../shared/style";
import type { StyleView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./ChangeStylePalette.module.css";

type ChangeStylePaletteProps = {
  readonly view: StyleView;
};

export default function ChangeStylePalette({ view }: ChangeStylePaletteProps): ReactElement {
  const { onPropertyChange } = useInteractions(view);

  return (
    <section className={styles.palette} aria-label="Style controls">
      {STYLE_PROPERTIES.map(({ name }) => (
        <label key={name} className={styles.control}>
          <span>{toLabel(name)}</span>
          <input
            type={isColorProperty(name) ? "color" : "text"}
            value={toInputValue(view.style[name], name)}
            onChange={(event) => onPropertyChange(name, toValue(event))}
          />
        </label>
      ))}
    </section>
  );
}

function toInputValue(value: string | null, property: StylePropertyName): string {
  return value ?? (isColorProperty(property) ? "#ffffff" : "");
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
