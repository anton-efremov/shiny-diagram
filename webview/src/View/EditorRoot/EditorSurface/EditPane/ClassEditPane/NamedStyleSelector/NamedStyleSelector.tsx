/**
 * @behavior Named style selection scenario.
 * @render Named style selector.
 */

import type { ReactElement } from "react";
import { toStyleDefId } from "../../../../../../shared/ids";
import type { StyleProperties } from "../../../../../../shared/style";
import type { ClassView, StyleView } from "../../../../../views/schema";
import Dropdown from "../../../../../ui/composites/Dropdown/Dropdown";
import { useInteractions } from "./useInteractions";

type NamedStyleSelectorProps = {
  readonly view: readonly ClassView[];
  readonly styles: readonly StyleView[];
};

export default function NamedStyleSelector({
  view,
  styles: styleViews,
}: NamedStyleSelectorProps): ReactElement {
  // Event handler props derivation
  const { onStyleChange } = useInteractions(view);
  const selectedValue = toSelectedValue(view);

  function onChange(value: string): void {
    if (value === "multiple" || value === "custom") return;
    onStyleChange(value === "none" ? null : toStyleDefId(value));
  }

  return (
    <Dropdown
      value={selectedValue}
      options={[
        ...(selectedValue === "multiple" ? [{ value: "multiple", label: "Multiple" }] : []),
        ...(selectedValue === "custom"
          ? [{ value: "custom", label: "Custom style", swatchStyle: toCustomSwatchStyle(view) }]
          : []),
        { value: "none", label: "No style", swatchStyle: {} },
        ...styleViews.map((styleView) => ({
          value: styleView.styleId,
          label: styleView.name,
          swatchStyle: styleView.style,
        })),
      ]}
      onChange={onChange}
    />
  );
}

// Private helpers
function toCustomSwatchStyle(classes: readonly ClassView[]): Partial<StyleProperties> {
  return classes.length === 1 ? (classes[0]?.style ?? {}) : {};
}

function toSelectedValue(classes: readonly ClassView[]): string {
  const first = classes[0]?.appliedStyleId;
  if (classes.every((classView) => classView.appliedStyleId === first)) {
    if (first) return first;
    return classes.some((classView) => classView.style !== undefined) ? "custom" : "none";
  }
  return "multiple";
}
