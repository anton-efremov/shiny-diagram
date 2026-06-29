/**
 * @role [L]+[P]
 * @logic Selected class-box style child prop derivation and class-box action orchestration.
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
import { useInteractions } from "./useInteractions";
import type { ClassView } from "../../../../views/schema";
import styles from "./ClassStylePane.module.css";

type ClassStylePaneProps = {
  readonly view: readonly ClassView[];
};

export default function ClassStylePane({ view }: ClassStylePaneProps): ReactElement {
  /** Child props derivation: selected class views become ready-to-render inspector values */
  const classSelectionSummaryProps = toClassSelectionSummaryProps(view);
  const classStylePreviewProps = toClassStylePreviewProps(view);
  const classStyleControlsProps = toClassStyleControlsProps(view);
  const classStyleActionsProps = toClassStyleActionsProps(view);

  /** Event handler derivation: style edits and class actions dispatch command transactions */
  const { onFillColorChange, onBorderColorChange, onTextColorChange, onDuplicate, onDelete } =
    useInteractions(view);

  return (
    <section className={styles.selectionPanel} aria-label="Selected class styles">
      <ClassSelectionSummary {...classSelectionSummaryProps} />
      <ClassStylePreview {...classStylePreviewProps} />
      <ClassStyleControls
        {...classStyleControlsProps}
        onFillColorChange={onFillColorChange}
        onBorderColorChange={onBorderColorChange}
        onTextColorChange={onTextColorChange}
      />
      <ClassStyleActions
        {...classStyleActionsProps}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </section>
  );
}
