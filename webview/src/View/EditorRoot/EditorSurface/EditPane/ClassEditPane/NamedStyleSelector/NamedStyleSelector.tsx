/**
 * @behavior Named style selection scenario.
 * @render Named style selector.
 */

import type { ReactElement } from "react";
import { toStyleDefId } from "../../../../../../shared/ids";
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
    if (value === "multiple") return;
    onStyleChange(value === "none" ? null : toStyleDefId(value));
  }

  return (
    <Dropdown
      value={selectedValue}
      options={[
        ...(selectedValue === "multiple"
          ? [{ value: "multiple", label: "Saved styles: Multiple" }]
          : []),
        { value: "none", label: "Saved styles: No style" },
        ...styleViews.map((styleView) => ({
          value: styleView.styleId,
          label: `Saved styles: ${styleView.name}`,
          swatchStyle: styleView.style,
        })),
      ]}
      onChange={onChange}
    />
  );
}

// Private helpers
function toSelectedValue(classes: readonly ClassView[]): string {
  const first = classes[0]?.appliedStyleId;
  if (classes.every((classView) => classView.appliedStyleId === first)) {
    return first ?? "none";
  }
  return "multiple";
}
