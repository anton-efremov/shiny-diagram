/**
 * @role [L] Logic
 * @logic Selected class-box style inspection and class-box action orchestration.
 * @presents Class-box style inspector boundary.
 */

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
import { useClassStylePaneInteractions } from "./useInteractions";
import type { ClassView } from "../../../../views/schema";
import styles from "../StylePane.module.css";

type ClassStylePaneProps = {
  readonly view: readonly ClassView[];
};

export default function ClassStylePane({ view }: ClassStylePaneProps): ReactElement {
  const selectedClasses = view;

  // Derive pure UI child props
  const selectionSummaryProps = toClassSelectionSummaryProps(selectedClasses);
  const stylePreviewProps = toClassStylePreviewProps(selectedClasses);
  const styleControlsProps = toClassStyleControlsProps(selectedClasses);
  const styleActionsProps = toClassStyleActionsProps(selectedClasses);

  // Define action handlers
  const {
    onFillColorChange,
    onBorderColorChange,
    onTextColorChange,
    onDuplicate,
    onDelete: onDeleteClick,
  } = useClassStylePaneInteractions(selectedClasses);

  return (
    <section className={styles.selectionPanel} aria-label="Selected class styles">
      <ClassSelectionSummary {...selectionSummaryProps} />
      <ClassStylePreview {...stylePreviewProps} />
      <ClassStyleControls
        {...styleControlsProps}
        onFillColorChange={onFillColorChange}
        onBorderColorChange={onBorderColorChange}
        onTextColorChange={onTextColorChange}
      />
      <ClassStyleActions
        {...styleActionsProps}
        onDuplicate={onDuplicate}
        onDeleteClick={onDeleteClick}
      />
    </section>
  );
}
