/**
 * Inline commit field swapping optional display content for validated editing.
 *
 * Begins its draft at `initialValue`, reports edits through `onDraftChange`, and
 * resets when that value changes. In display state, `display` supplies text,
 * treatment, and edit request. In edit state, `ariaLabel` names the field and
 * `validate` gates completion: Enter or valid blur reports `onCommit`; invalid
 * blur restores the value and reports `onDiscard` with messages; Escape and the
 * cancel action restore it and report `onCancel`. Validation uses
 * `validationStacking`, while `surface` supplies an explicit cancel ground.
 *
 * Options:
 * - `isEditing` — off renders `display` or nothing; on renders the field
 * - `treatment` — `primary`, `secondary`, and `heading` align with their display
 *   text metrics; `label` and `multiplicity` align with their edge-text pills
 * - `autoFocus` — on requests focus when the editor mounts
 * - `isCancelVisible` — on reserves trailing room and shows a cancel action
 * - `surfaceTone` — `default` uses the canvas surface, `base` base fill, and
 *   `neutral` a neutral wash when `surface` is absent
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

type DisplayText = {
  readonly text: string;
  readonly variant: "primary" | "secondary" | "heading";
  readonly onEditRequest: (event: MouseEvent<HTMLDivElement>) => void;
};

type InlineCommitTextFieldProps = {
  readonly initialValue: string;
  readonly display?: DisplayText;
  readonly isEditing: boolean;
  readonly treatment: InlineTextTreatment;
  readonly validate: (draft: string) => readonly string[];
  readonly ariaLabel: string;
  readonly autoFocus?: boolean;
  readonly isCancelVisible?: boolean;
  readonly validationStacking: number;
  readonly surface?: string;
  readonly surfaceTone?: "default" | "base" | "neutral";
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
  display,
  isEditing,
  treatment,
  validate,
  ariaLabel,
  autoFocus = false,
  isCancelVisible = false,
  validationStacking,
  surface,
  surfaceTone,
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
    return display ? (
      <InlineTextBlock
        text={display.text}
        variant={display.variant}
        onEditRequest={display.onEditRequest}
      />
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
        autoFocus={autoFocus}
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
            surfaceTone={surfaceTone}
            onPress={lifecycle.onCancel}
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
