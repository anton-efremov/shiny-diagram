/**
 * @behavior Relationship multiplicity preset pick commit and custom draft commit routing.
 * @render Relationship multiplicity controls.
 */

import { useEffect, useState } from "react";
import type { ChangeEvent, Dispatch, KeyboardEvent, ReactElement, SetStateAction } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
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
  useEffect(() => {
    setSourceDraft(view.sourceMultiplicity ?? "");
    setIsSourceCustom(isCustomMultiplicity(view.sourceMultiplicity));
  }, [view.sourceMultiplicity]);
  useEffect(() => {
    setTargetDraft(view.targetMultiplicity ?? "");
    setIsTargetCustom(isCustomMultiplicity(view.targetMultiplicity));
  }, [view.targetMultiplicity]);

  // Event handler props derivation
  const { onMultiplicityCommit } = useInteractions(view.relationshipId);

  function onSourcePresetChange(event: ChangeEvent<HTMLSelectElement>): void {
    handlePresetChange(
      event.currentTarget.value,
      view.sourceMultiplicity ?? null,
      setIsSourceCustom,
      setSourceDraft,
      (value) => onMultiplicityCommit("source", value)
    );
  }

  function onTargetPresetChange(event: ChangeEvent<HTMLSelectElement>): void {
    handlePresetChange(
      event.currentTarget.value,
      view.targetMultiplicity ?? null,
      setIsTargetCustom,
      setTargetDraft,
      (value) => onMultiplicityCommit("target", value)
    );
  }

  function onSourceChange(event: ChangeEvent<HTMLInputElement>): void {
    setSourceDraft(event.currentTarget.value);
  }

  function onTargetChange(event: ChangeEvent<HTMLInputElement>): void {
    setTargetDraft(event.currentTarget.value);
  }

  function onSourceKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    handleDraftKeyDown(event, sourceDraft, view.sourceMultiplicity ?? "", setSourceDraft, (value) =>
      onMultiplicityCommit("source", value)
    );
  }

  function onTargetKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    handleDraftKeyDown(event, targetDraft, view.targetMultiplicity ?? "", setTargetDraft, (value) =>
      onMultiplicityCommit("target", value)
    );
  }

  // UI props derivation
  const sourceSelectValue = toSelectValue(view.sourceMultiplicity, isSourceCustom);
  const targetSelectValue = toSelectValue(view.targetMultiplicity, isTargetCustom);

  return (
    <section className={styles.section} aria-label="Relationship multiplicities">
      <MultiplicityField
        label="Source multiplicity"
        selectValue={sourceSelectValue}
        draft={sourceDraft}
        onPresetChange={onSourcePresetChange}
        onDraftChange={onSourceChange}
        onDraftKeyDown={onSourceKeyDown}
      />
      <MultiplicityField
        label="Target multiplicity"
        selectValue={targetSelectValue}
        draft={targetDraft}
        onPresetChange={onTargetPresetChange}
        onDraftChange={onTargetChange}
        onDraftKeyDown={onTargetKeyDown}
      />
    </section>
  );
}

// Private helpers
type MultiplicityFieldProps = {
  readonly label: string;
  readonly selectValue: string;
  readonly draft: string;
  readonly onPresetChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly onDraftChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

function MultiplicityField({
  label,
  selectValue,
  draft,
  onPresetChange,
  onDraftChange,
  onDraftKeyDown,
}: MultiplicityFieldProps): ReactElement {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={selectValue} onChange={onPresetChange}>
        <option value={NONE_OPTION}>none</option>
        {multiplicityPresets.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>custom…</option>
      </select>
      {selectValue === CUSTOM_OPTION ? (
        <input value={draft} onChange={onDraftChange} onKeyDown={onDraftKeyDown} />
      ) : null}
    </label>
  );
}

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

function handlePresetChange(
  option: string,
  currentValue: string | null,
  onCustomModeChange: Dispatch<SetStateAction<boolean>>,
  onReset: (value: string) => void,
  onCommit: (value: string | null) => void
): void {
  if (option === CUSTOM_OPTION) {
    onCustomModeChange(true);
    return;
  }
  onCustomModeChange(false);
  const value = option === NONE_OPTION ? null : option;
  onReset(value ?? "");
  if (value === currentValue) return;
  onCommit(value);
}

function handleDraftKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  draft: string,
  fallback: string,
  onReset: (value: string) => void,
  onCommit: (value: string | null) => void
): void {
  if (event.key === "Escape") {
    onReset(fallback);
    return;
  }
  if (event.key !== "Enter") return;
  const value = draft.trim();
  onCommit(value === "" ? null : value);
}
