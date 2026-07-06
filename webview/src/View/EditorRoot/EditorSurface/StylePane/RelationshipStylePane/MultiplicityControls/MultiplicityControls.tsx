/**
 * @behavior Relationship multiplicity draft and commit routing.
 * @render Relationship multiplicity controls.
 */

import { useEffect, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./MultiplicityControls.module.css";

const multiplicityOptions = ["1", "0..1", "*", "0..*", "1..*"] as const;

type MultiplicityControlsProps = {
  readonly view: RelationshipView;
};

export default function MultiplicityControls({ view }: MultiplicityControlsProps): ReactElement {
  // State creation: local state - multiplicity drafts
  const [sourceDraft, setSourceDraft] = useState(view.sourceMultiplicity ?? "");
  const [targetDraft, setTargetDraft] = useState(view.targetMultiplicity ?? "");

  // State reconciliation
  useEffect(() => setSourceDraft(view.sourceMultiplicity ?? ""), [view.sourceMultiplicity]);
  useEffect(() => setTargetDraft(view.targetMultiplicity ?? ""), [view.targetMultiplicity]);

  // Event handler props derivation
  const { onMultiplicityCommit } = useInteractions(view.relationshipId);

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

  function onSourceClear(): void {
    setSourceDraft("");
    onMultiplicityCommit("source", null);
  }

  function onTargetClear(): void {
    setTargetDraft("");
    onMultiplicityCommit("target", null);
  }

  return (
    <section className={styles.section} aria-label="Relationship multiplicities">
      <MultiplicityField
        label="Source multiplicity"
        listId="source-multiplicity-options"
        value={sourceDraft}
        onChange={onSourceChange}
        onKeyDown={onSourceKeyDown}
        onClear={onSourceClear}
      />
      <MultiplicityField
        label="Target multiplicity"
        listId="target-multiplicity-options"
        value={targetDraft}
        onChange={onTargetChange}
        onKeyDown={onTargetKeyDown}
        onClear={onTargetClear}
      />
    </section>
  );
}

type MultiplicityFieldProps = {
  readonly label: string;
  readonly listId: string;
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onClear: () => void;
};

function MultiplicityField({
  label,
  listId,
  value,
  onChange,
  onKeyDown,
  onClear,
}: MultiplicityFieldProps): ReactElement {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.row}>
        <input value={value} list={listId} onChange={onChange} onKeyDown={onKeyDown} />
        <button type="button" onClick={onClear}>
          None
        </button>
      </div>
      <datalist id={listId}>
        {multiplicityOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
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
