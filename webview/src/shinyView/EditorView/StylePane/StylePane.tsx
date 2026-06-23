import type { CSSProperties, ReactElement } from "react";
import ColorSelector from "../Controls/ColorSelector";
import ControlButton from "../Controls/ControlButton";
import { BorderIcon, DeleteIcon, DuplicateIcon, FillIcon, TextColorIcon } from "../Controls/icons";
import { useEditorClassSelectionState } from "../contexts";
import { aggregateClassStyles } from "./styleAggregation";
import type { AggregatedStyleProperty } from "./styleAggregation";
import { useStylePaneInteractions } from "./useStylePaneInteractions";
import styles from "./StylePane.module.css";

/**
 * Renders the selected class style inspector.
 */
export default function StylePane(): ReactElement {
  const { selectedClassViews } = useEditorClassSelectionState();
  const selectedView = selectedClassViews.length === 1 ? selectedClassViews[0] : undefined;
  const aggregatedStyles = aggregateClassStyles(selectedClassViews);

  const { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick } =
    useStylePaneInteractions();

  if (selectedClassViews.length === 0) {
    return (
      <aside className={styles.stylePane} aria-label="Styles pane">
        <header className={styles.header}>Styles</header>
        <div className={styles.emptySelection} aria-label="No selected diagram element" />
      </aside>
    );
  }

  const fill = selectedView?.style?.fill;
  const stroke = selectedView?.style?.stroke;
  const color = selectedView?.style?.color;
  const dynamicVars = {
    "--style-fill": fill,
    "--style-stroke": stroke,
    "--style-color": color,
  } as CSSProperties;

  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      <section
        className={styles.selectionPanel}
        style={dynamicVars}
        aria-label="Selected class styles"
      >
        {selectedView ? (
          <div className={styles.selectionSummary}>
            <div className={styles.selectionAccent} aria-hidden="true" />
            <div className={styles.selectionCopy}>
              <div className={styles.selectionType}>Class</div>
              <h2 className={styles.className}>{selectedView.header.label}</h2>
              {selectedView.header.stereotype ? (
                <div className={styles.stereotype}>
                  &lt;&lt;{selectedView.header.stereotype}&gt;&gt;
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={styles.multiSelectionSummary}>
            <div className={styles.selectionType}>Selection</div>
            <h2 className={styles.className}>{selectedClassViews.length} classes selected</h2>
          </div>
        )}

        {selectedView ? (
          <div className={styles.previewCard} aria-label="Selected class color preview">
            <div className={styles.previewHeader}>{selectedView.header.label}</div>
            <div className={styles.previewBody}>
              {selectedView.style?.name ? (
                <span className={styles.styleName}>{selectedView.style.name}</span>
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
          <ControlButton
            icon={<DuplicateIcon />}
            label={selectedView ? "Duplicate" : "Duplicate selected"}
            onClick={onDuplicate}
          />
          <ControlButton
            icon={<DeleteIcon />}
            label={selectedView ? "Delete class" : "Delete selected"}
            tone="danger"
            onClick={onDeleteClick}
          />
        </div>
      </section>
    </aside>
  );
}

function toColorSelectorProps(property: AggregatedStyleProperty): {
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed: boolean;
} {
  if (property.kind === "multiple") {
    return {
      displayValue: "Multiple",
      pickerValue: property.pickerValue,
      mixed: true,
    };
  }

  return {
    displayValue: property.value ?? "Default",
    pickerValue: property.pickerValue,
    swatchColor: property.value,
    mixed: false,
  };
}
