/**
 * @behavior Selected class-box style command dispatch and Delete shortcut handling.
 * @render Class-box style inspector boundary.
 */

import { useEffect } from "react";
import type { ReactElement } from "react";
import ClassSelectionSummary from "./ClassSelectionSummary/ClassSelectionSummary";
import ClassStyleActions from "./ClassStyleActions/ClassStyleActions";
import ClassStyleControls from "./ClassStyleControls/ClassStyleControls";
import ClassStylePreview from "./ClassStylePreview/ClassStylePreview";
import {
  toClassSelectionSummaryProps,
  toClassStyleActionsProps,
  toClassStyleControlsProps,
  toClassStylePreviewProps,
} from "./childProps";
import { useInteractions } from "./useInteractions";
import { shouldIgnoreKeyboardShortcutEvent } from "../../../../utils/keyboardEvents";
import type { ClassView } from "../../../../views/schema";
import styles from "./ClassStylePane.module.css";

type ClassStylePaneProps = {
  readonly view: readonly ClassView[];
};

export default function ClassStylePane({ view }: ClassStylePaneProps): ReactElement {
  // UI props derivation
  const classSelectionSummaryProps = toClassSelectionSummaryProps(view);
  const classStylePreviewProps = toClassStylePreviewProps(view);
  const classStyleControlsProps = toClassStyleControlsProps(view);
  const classStyleActionsProps = toClassStyleActionsProps(view);

  // Event handler props derivation
  const { onFillColorChange, onBorderColorChange, onDuplicate, onDelete } = useInteractions(view);

  // Registering keystroke listener: Delete selected classes
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Delete" || shouldIgnoreKeyboardShortcutEvent(event)) return;

      event.preventDefault();
      onDelete();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDelete]);

  return (
    <section className={styles.selectionPanel} aria-label="Selected class styles">
      <ClassSelectionSummary {...classSelectionSummaryProps} />
      <ClassStylePreview {...classStylePreviewProps} />
      <ClassStyleControls
        {...classStyleControlsProps}
        onFillColorChange={onFillColorChange}
        onBorderColorChange={onBorderColorChange}
      />
      <ClassStyleActions
        {...classStyleActionsProps}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </section>
  );
}
