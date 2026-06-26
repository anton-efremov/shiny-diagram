/**
 * @role [L]+[P] Logic and Presentational
 * @logic Single selected class style and action interactions.
 * @presents Single selected class style inspector scenario.
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
import { toColorSelectorProps } from "../childViews";
import { useSingleClassStylePaneInteractions } from "./useInteractions";
import type { SingleClassStylePaneView } from "./views";
import styles from "../StylePane.module.css";

type SingleClassStylePaneProps = {
  readonly view: SingleClassStylePaneView;
};

export default function SingleClassStylePane({ view }: SingleClassStylePaneProps): ReactElement {
  // @job connect:command:wire
  const { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick } =
    useSingleClassStylePaneInteractions(view);

  const { classView, aggregatedStyles } = view;

  // @job render:style
  const dynamicVars = {
    "--style-fill": classView.style?.fill,
    "--style-stroke": classView.style?.stroke,
    "--style-color": classView.style?.color,
  } as CSSProperties;

  // @job render:structure
  return (
    <section
      className={styles.selectionPanel}
      style={dynamicVars}
      aria-label="Selected class styles"
    >
      <div className={styles.selectionSummary}>
        <div className={styles.selectionAccent} aria-hidden="true" />
        <div className={styles.selectionCopy}>
          <div className={styles.selectionType}>Class</div>
          <h2 className={styles.className}>{classView.header.label}</h2>
          {classView.header.stereotype ? (
            <div className={styles.stereotype}>&lt;&lt;{classView.header.stereotype}&gt;&gt;</div>
          ) : null}
        </div>
      </div>

      <div className={styles.previewCard} aria-label="Selected class color preview">
        <div className={styles.previewHeader}>{classView.header.label}</div>
        <div className={styles.previewBody}>
          {classView.style?.name ? (
            <span className={styles.styleName}>{classView.style.name}</span>
          ) : (
            "Default style"
          )}
        </div>
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
        <ControlButton icon={<DuplicateIcon />} label="Duplicate" onClick={onDuplicate} />
        <ControlButton
          icon={<DeleteIcon />}
          label="Delete class"
          tone="danger"
          onClick={onDeleteClick}
        />
      </div>
    </section>
  );
}
