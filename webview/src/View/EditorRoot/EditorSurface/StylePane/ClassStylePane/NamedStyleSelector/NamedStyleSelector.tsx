/**
 * @behavior Named style selection scenario.
 * @render Named style selector.
 */

import type { ChangeEvent, ReactElement } from "react";
import { toStyleDefId } from "../../../../../../shared/ids";
import type { ClassView, StyleView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./NamedStyleSelector.module.css";

type NamedStyleSelectorProps = {
  readonly view: readonly ClassView[];
  readonly styles: readonly StyleView[];
};

export default function NamedStyleSelector({
  view,
  styles: styleViews,
}: NamedStyleSelectorProps): ReactElement {
  const { onStyleChange } = useInteractions(view);
  const selectedValue = toSelectedValue(view);

  function onChange(event: ChangeEvent<HTMLSelectElement>): void {
    const value = event.currentTarget.value;
    if (value === "multiple") return;
    onStyleChange(value === "none" ? null : toStyleDefId(value));
  }

  return (
    <label className={styles.selector}>
      <span>Select style</span>
      <select value={selectedValue} onChange={onChange}>
        {selectedValue === "multiple" ? <option value="multiple">Multiple</option> : null}
        <option value="none">No style</option>
        {styleViews.map((styleView) => (
          <option key={styleView.styleId} value={styleView.styleId}>
            {styleView.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function toSelectedValue(classes: readonly ClassView[]): string {
  const first = classes[0]?.appliedStyleId;
  if (classes.every((classView) => classView.appliedStyleId === first)) {
    return first ?? "none";
  }
  return "multiple";
}
