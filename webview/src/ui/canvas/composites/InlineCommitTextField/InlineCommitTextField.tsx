/**
 * @behavior Canvas text rest/edit swap with commit, discard, cancel, and validation routing.
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
