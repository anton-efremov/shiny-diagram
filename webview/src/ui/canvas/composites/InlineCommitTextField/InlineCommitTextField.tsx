/**
 * Inline commit field swapping optional display content for validated editing.
 *
 * Begins its draft at `initialValue`, reports edits through `onDraftChange`, and
 * resets when that value changes. In display state, `displayText` supplies text
 * and clicking it reports `onEditRequest`, using the selected `treatment`. In
 * edit state, `ariaLabel` names the field and `validate` gates completion:
 * confirming a valid draft, or leaving the field with one, reports `onCommit`;
 * leaving with an invalid draft restores the value and reports `onDiscard` with
 * messages; backing out or using the cancel action restores it and reports
 * `onCancel`. Validation uses `validationStacking`, while `surface` supplies an
 * explicit cancel ground over the treatment-selected fallback.
 *
 * Lifecycle:
 * - `isEditing` — off renders `displayText` or nothing; on renders the field
 *   Used by: class, namespace, and relationship text
 * - `isCancelVisible` — on reserves trailing room and shows a cancel action
 *   Used by: relationship labels, captions, and multiplicities
 *
 * Modifiers:
 * - `treatment` — the editor's alignment with its display state:
 *   - `primary` aligns with prominent centered text — e.g. a class title
 *   - `secondary` aligns with secondary text — e.g. a class stereotype or alias
 *   - `heading` aligns with left-aligned heading text — e.g. a namespace heading
 *   - `label` aligns with the light edge-text pill — e.g. a relationship label
 *   - `multiplicity` aligns with the dark edge-text pill — e.g. an endpoint
 *     multiplicity
 */

import type { MouseEvent, ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import { useCommitLifecycle } from "../../../core/commitLifecycle";
import InlineActionButton from "../../primitives/InlineActionButton/InlineActionButton";
import InlineTextBlock from "../../primitives/InlineTextBlock/InlineTextBlock";
import InlineTextField from "../../primitives/InlineTextField/InlineTextField";
import InlineValidationPopup from "../../primitives/InlineValidationPopup/InlineValidationPopup";
import styles from "./InlineCommitTextField.module.css";

export type InlineTextTreatment = "primary" | "secondary" | "heading" | "label" | "multiplicity";

type DisplayState =
  | {
      readonly displayText: string;
      readonly onEditRequest: (event: MouseEvent<HTMLDivElement>) => void;
    }
  | {
      readonly displayText?: undefined;
      readonly onEditRequest?: undefined;
    };

type InlineCommitTextFieldProps = DisplayState & {
  readonly initialValue: string;
  readonly ariaLabel: string;
  readonly surface?: string;
  readonly validationStacking: number;
  readonly validate: (draft: string) => readonly string[];
  readonly isEditing: boolean;
  readonly isCancelVisible?: boolean;
  readonly treatment: InlineTextTreatment;
  readonly onCommit: (value: string) => void;
  readonly onDraftChange?: (value: string) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

const CANCEL_GLYPH: GlyphDescriptor = {
  paths: ["M5 5 11 11M11 5 5 11"],
  filled: false,
  dashed: false,
};

export default function InlineCommitTextField({
  initialValue,
  displayText,
  onEditRequest,
  isEditing,
  treatment,
  validate,
  ariaLabel,
  isCancelVisible = false,
  validationStacking,
  surface,
  onCommit,
  onDraftChange,
  onDiscard,
  onCancel,
}: InlineCommitTextFieldProps): ReactElement | null {
  const lifecycle = useCommitLifecycle({
    initialValue,
    validate,
    onCommit,
    onDraftChange,
    onDiscard,
    onCancel,
  });

  if (!isEditing) {
    const displayVariant = toDisplayVariant(treatment);
    return displayText !== undefined && displayVariant ? (
      <InlineTextBlock text={displayText} variant={displayVariant} onEditRequest={onEditRequest} />
    ) : null;
  }

  const tone =
    treatment === "label" ? "label" : treatment === "multiplicity" ? "multiplicity" : "default";

  return (
    <div
      className={`${styles.editor} ${styles[treatment]}`}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <InlineTextField
        value={lifecycle.draft}
        invalid={lifecycle.messages.length > 0}
        ariaLabel={ariaLabel}
        autoFocus
        hasEndAction={isCancelVisible}
        tone={tone}
        onChange={lifecycle.onDraftChange}
        onBlur={lifecycle.onBlur}
        onKeyDown={lifecycle.onKeyDown}
      />
      {isCancelVisible ? (
        <span className={styles.cancelAction}>
          <InlineActionButton
            glyph={CANCEL_GLYPH}
            label="Cancel editing"
            treatment="cancel"
            surface={surface}
            surfaceTone={toCancelSurfaceTone(treatment)}
            onClick={lifecycle.onCancel}
          />
        </span>
      ) : null}
      {lifecycle.messages.length > 0 ? (
        <InlineValidationPopup
          messages={lifecycle.messages}
          stacking={validationStacking}
          onDismiss={lifecycle.onPopupDismiss}
        />
      ) : null}
    </div>
  );
}

function toDisplayVariant(
  treatment: InlineTextTreatment
): "primary" | "secondary" | "heading" | null {
  return treatment === "label" || treatment === "multiplicity" ? null : treatment;
}

function toCancelSurfaceTone(treatment: InlineTextTreatment): "default" | "base" | "neutral" {
  return treatment === "heading"
    ? "neutral"
    : treatment === "primary" || treatment === "secondary"
      ? "base"
      : "default";
}
