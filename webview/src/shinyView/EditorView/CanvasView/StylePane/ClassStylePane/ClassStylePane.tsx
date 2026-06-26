/**
 * @role [L]+[P] Logic and Presentational
 * @logic Selected class-box style inspection and class-box action interactions.
 * @presents Class-box style inspector scenario.
 */

import type { CSSProperties, ReactElement } from "react";
import ColorSelector from "../../../../ui/ColorSelector/ColorSelector";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import {
  BorderIcon,
  DeleteIcon,
  DuplicateIcon,
  FillIcon,
  TextColorIcon,
} from "../../../../ui/icons/icons";
import {
  toClassPreviewView,
  toClassSelectionSummaryView,
  toClassStyleActionsView,
  toClassStyleControlsView,
} from "./childViews";
import { useClassStylePaneInteractions } from "./useInteractions";
import type { ClassStylePaneView } from "./views";
import styles from "../StylePane.module.css";

type ClassStylePaneProps = {
  readonly view: ClassStylePaneView;
};

export default function ClassStylePane({ view }: ClassStylePaneProps): ReactElement {
  // @job logic:child:view
  const summaryView = toClassSelectionSummaryView(view.selectedClasses);
  const previewView = toClassPreviewView(view.selectedClasses);
  const controlsView = toClassStyleControlsView(view.selectedClasses);
  const actionsView = toClassStyleActionsView(view.selectedClasses);

  // @job connect:command:wire
  const { onFillColorChange, onBorderColorChange, onTextColorChange, onDuplicate, onDeleteClick } =
    useClassStylePaneInteractions(view);

  // @job render:style
  const dynamicVars =
    previewView.kind === "visible"
      ? ({
          "--style-fill": previewView.style.fill,
          "--style-stroke": previewView.style.stroke,
          "--style-color": previewView.style.color,
        } as CSSProperties)
      : undefined;

  // @job render:structure
  return (
    <section
      className={styles.selectionPanel}
      style={dynamicVars}
      aria-label="Selected class styles"
    >
      {summaryView.kind === "single" ? (
        <div className={styles.selectionSummary}>
          <div className={styles.selectionAccent} aria-hidden="true" />
          <div className={styles.selectionCopy}>
            <div className={styles.selectionType}>Class</div>
            <h2 className={styles.className}>{summaryView.label}</h2>
            {summaryView.stereotype ? (
              <div className={styles.stereotype}>&lt;&lt;{summaryView.stereotype}&gt;&gt;</div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.multiSelectionSummary}>
          <div className={styles.selectionType}>Selection</div>
          <h2 className={styles.className}>{summaryView.count} classes selected</h2>
        </div>
      )}

      {previewView.kind === "visible" ? (
        <div className={styles.previewCard} aria-label="Selected class color preview">
          <div className={styles.previewHeader}>{previewView.label}</div>
          <div className={styles.previewBody}>
            {previewView.styleName ? (
              <span className={styles.styleName}>{previewView.styleName}</span>
            ) : (
              "Default style"
            )}
          </div>
        </div>
      ) : null}

      <div className={styles.styleList}>
        <ColorSelector
          label="Fill"
          icon={<FillIcon />}
          {...controlsView.fill}
          onChange={onFillColorChange}
        />
        <ColorSelector
          label="Border"
          icon={<BorderIcon />}
          {...controlsView.border}
          onChange={onBorderColorChange}
        />
        <ColorSelector
          label="Text"
          icon={<TextColorIcon />}
          {...controlsView.text}
          onChange={onTextColorChange}
        />
      </div>

      <div className={styles.actionArea}>
        <ControlButton
          icon={<DuplicateIcon />}
          label={actionsView.duplicateLabel}
          onClick={onDuplicate}
        />
        <ControlButton
          icon={<DeleteIcon />}
          label={actionsView.deleteLabel}
          tone="danger"
          onClick={onDeleteClick}
        />
      </div>
    </section>
  );
}
