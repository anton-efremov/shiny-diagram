/**
 * @behavior Local class header drafts and commit keyboard adapters.
 * @render Class header text controls.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import type { ClassId } from "../../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../../shared/uml";
import type { ClassView } from "../../../../../views/schema";
import ValidationPopup from "../../../../../ui/ValidationPopup/ValidationPopup";
import styles from "./HeaderTextControls.module.css";

type HeaderTextControlsProps = {
  readonly view: ClassView;
  readonly onNameCommit: (classId: ClassId, name: string) => readonly string[];
  readonly onAnnotationCommit: (
    classId: ClassId,
    annotation: ClassAnnotation | null
  ) => readonly string[];
  readonly onLabelCommit: (classId: ClassId, label: string | null) => readonly string[];
};

const ANNOTATION_PRESETS = ["interface", "abstract", "service", "enumeration"] as const;

export default function HeaderTextControls({
  view,
  onNameCommit,
  onAnnotationCommit,
  onLabelCommit,
}: HeaderTextControlsProps): ReactElement {
  const [nameDraft, setNameDraft] = useState(view.header.name);
  const [annotationDraft, setAnnotationDraft] = useState(view.header.stereotype ?? "");
  const [labelDraft, setLabelDraft] = useState(
    view.header.label === view.header.name ? "" : view.header.label
  );
  const [errors, setErrors] = useState<readonly string[]>([]);

  useEffect(() => {
    setNameDraft(view.header.name);
    setAnnotationDraft(view.header.stereotype ?? "");
    setLabelDraft(view.header.label === view.header.name ? "" : view.header.label);
  }, [view.header.label, view.header.name, view.header.stereotype]);

  const onNameSubmit = (): void => {
    setErrors(onNameCommit(view.classId, nameDraft.trim()));
  };

  const onAnnotationSubmit = (annotation: string | null): void => {
    const nextErrors = onAnnotationCommit(view.classId, annotation);
    setErrors(nextErrors);
    if (nextErrors.length === 0) setAnnotationDraft(annotation ?? "");
  };

  const onLabelSubmit = (label: string | null): void => {
    const nextErrors = onLabelCommit(view.classId, label);
    setErrors(nextErrors);
    if (nextErrors.length === 0) setLabelDraft(label ?? "");
  };

  return (
    <section className={styles.controls} aria-label="Class text">
      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          value={nameDraft}
          onChange={(event) => setNameDraft(event.currentTarget.value)}
          onBlur={onNameSubmit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onNameSubmit();
            }
          }}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Annotation</span>
        <select
          value={annotationDraft}
          onChange={(event) => onAnnotationSubmit(event.currentTarget.value || null)}
        >
          <option value="">None</option>
          {ANNOTATION_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
        <input
          value={annotationDraft}
          placeholder="Custom"
          onChange={(event) => setAnnotationDraft(event.currentTarget.value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAnnotationSubmit(annotationDraft.trim() || null);
            }
          }}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Label</span>
        <div className={styles.inline}>
          <input
            value={labelDraft}
            onChange={(event) => setLabelDraft(event.currentTarget.value)}
            onBlur={() => onLabelSubmit(labelDraft.trim() || null)}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onLabelSubmit(labelDraft.trim() || null);
              }
            }}
          />
          <button type="button" onClick={() => onLabelSubmit(null)}>
            Clear
          </button>
        </div>
      </label>
      {errors.length > 0 ? (
        <ValidationPopup messages={errors} onDismiss={() => setErrors([])} />
      ) : null}
    </section>
  );
}
