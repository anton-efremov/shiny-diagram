/**
 * @role [L]+[P] Logic and Presentational
 * @logic Multi selected class style and action interactions.
 * @presents Multi selected class style inspector scenario.
 */

import type { ReactElement } from "react";
import ColorSelector from "../../../../ui/ColorSelector/ColorSelector";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import {
  BorderIcon,
  DeleteIcon,
  DuplicateIcon,
  FillIcon,
  TextColorIcon,
} from "../../../../ui/icons/icons";
import { toColorSelectorProps } from "../childViews";
import { useMultiClassStylePaneInteractions } from "./useInteractions";
import type { MultiClassStylePaneView } from "./views";
import styles from "../StylePane.module.css";

type MultiClassStylePaneProps = {
  readonly view: MultiClassStylePaneView;
};

export default function MultiClassStylePane({ view }: MultiClassStylePaneProps): ReactElement {
  // @job connect:command:wire
  const { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick } =
    useMultiClassStylePaneInteractions(view);

  const { classViews, aggregatedStyles } = view;

  // @job render:structure
  return (
    <section className={styles.selectionPanel} aria-label="Selected class styles">
      <div className={styles.multiSelectionSummary}>
        <div className={styles.selectionType}>Selection</div>
        <h2 className={styles.className}>{classViews.length} classes selected</h2>
      </div>

      <div className={styles.styleList}>
        <ColorSelector
          label="Fill"
          icon={<FillIcon />}
          {...toColorSelectorProps(aggregatedStyles.fill)}
          onChange={onFillColorChange}
        />
        <ColorSelector
          label="Border"
          icon={<BorderIcon />}
          {...toColorSelectorProps(aggregatedStyles.stroke)}
          onChange={onStrokeColorChange}
        />
        <ColorSelector
          label="Text"
          icon={<TextColorIcon />}
          {...toColorSelectorProps(aggregatedStyles.color)}
          onChange={onTextColorChange}
        />
      </div>

      <div className={styles.actionArea}>
        <ControlButton icon={<DuplicateIcon />} label="Duplicate selected" onClick={onDuplicate} />
        <ControlButton
          icon={<DeleteIcon />}
          label="Delete selected"
          tone="danger"
          onClick={onDeleteClick}
        />
      </div>
    </section>
  );
}
