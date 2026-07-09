/**
 * @behavior Relationship multiplicity preset pick commit and custom draft commit routing.
 * @render Relationship multiplicity controls.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import MultiplicityField from "./MultiplicityField/MultiplicityField";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./MultiplicityControls.module.css";

const multiplicityPresets = ["1", "0..1", "*", "0..*", "1..*"] as const;
const NONE_OPTION = "none";
const CUSTOM_OPTION = "custom";

type MultiplicityControlsProps = {
  readonly view: RelationshipView;
};

export default function MultiplicityControls({ view }: MultiplicityControlsProps): ReactElement {
  // State creation: local state - multiplicity drafts and explicit custom mode per end
  const [sourceDraft, setSourceDraft] = useState(view.sourceMultiplicity ?? "");
  const [targetDraft, setTargetDraft] = useState(view.targetMultiplicity ?? "");
  const [isSourceCustom, setIsSourceCustom] = useState(() =>
    isCustomMultiplicity(view.sourceMultiplicity)
  );
  const [isTargetCustom, setIsTargetCustom] = useState(() =>
    isCustomMultiplicity(view.targetMultiplicity)
  );

  // State reconciliation
  useStateReconciliation({
    sourceMultiplicity: view.sourceMultiplicity,
    targetMultiplicity: view.targetMultiplicity,
    presetOptions: multiplicityPresets,
    setSourceDraft,
    setTargetDraft,
    setIsSourceCustom,
    setIsTargetCustom,
  });

  // Event handler props derivation
  const {
    onSourcePresetChange,
    onTargetPresetChange,
    onSourceDraftChange,
    onTargetDraftChange,
    onSourceDraftKeyDown,
    onTargetDraftKeyDown,
  } = useInteractions({
    relationshipId: view.relationshipId,
    sourceMultiplicity: view.sourceMultiplicity,
    targetMultiplicity: view.targetMultiplicity,
    sourceDraft,
    targetDraft,
    noneOption: NONE_OPTION,
    customOption: CUSTOM_OPTION,
    setSourceDraft,
    setTargetDraft,
    setIsSourceCustom,
    setIsTargetCustom,
  });

  // UI props derivation
  const sourceSelectValue = toSelectValue(view.sourceMultiplicity, isSourceCustom);
  const targetSelectValue = toSelectValue(view.targetMultiplicity, isTargetCustom);

  return (
    <section className={styles.section} aria-label="Relationship multiplicities">
      <MultiplicityField
        label="Source multiplicity"
        options={multiplicityPresets}
        noneOption={NONE_OPTION}
        customOption={CUSTOM_OPTION}
        selectValue={sourceSelectValue}
        draft={sourceDraft}
        onPresetChange={onSourcePresetChange}
        onDraftChange={onSourceDraftChange}
        onDraftKeyDown={onSourceDraftKeyDown}
      />
      <MultiplicityField
        label="Target multiplicity"
        options={multiplicityPresets}
        noneOption={NONE_OPTION}
        customOption={CUSTOM_OPTION}
        selectValue={targetSelectValue}
        draft={targetDraft}
        onPresetChange={onTargetPresetChange}
        onDraftChange={onTargetDraftChange}
        onDraftKeyDown={onTargetDraftKeyDown}
      />
    </section>
  );
}

// Private helpers
function isCustomMultiplicity(value: string | undefined): boolean {
  return (
    value !== undefined &&
    value !== "" &&
    !(multiplicityPresets as readonly string[]).includes(value)
  );
}

function toSelectValue(value: string | undefined, isCustom: boolean): string {
  if (isCustom || isCustomMultiplicity(value)) return CUSTOM_OPTION;
  return value === undefined || value === "" ? NONE_OPTION : value;
}
