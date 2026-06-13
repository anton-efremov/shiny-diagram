import type { CSSProperties, ReactElement } from "react";
import type {
  StyleDefNode,
  StyleProperty,
} from "../../../../parsers/classDiagram/diagramTreeModel";
import type { ClassBoxProps } from "../EditorMode";
import styles from "./StylePane.module.css";

type StylePaneProps = {
  selectedClassBox?: ClassBoxProps;
  onFillColorChange: (fill: string) => void;
};

/**
 * Renders the style pane for the current editor selection.
 */
export default function StylePane({
  selectedClassBox,
  onFillColorChange,
}: StylePaneProps): ReactElement {
  if (!selectedClassBox) {
    return (
      <aside className={styles.stylePane} aria-label="Styles pane">
        <header className={styles.header}>Styles</header>
        <div className={styles.emptySelection} aria-label="No selected diagram element" />
      </aside>
    );
  }

  const { node, styleDef } = selectedClassBox;
  const fill = styleDef ? getStyleProp(styleDef, "fill") : undefined;
  const stroke = styleDef ? getStyleProp(styleDef, "stroke") : undefined;
  const color = styleDef ? getStyleProp(styleDef, "color") : undefined;
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
        <div className={styles.selectionSummary}>
          <div className={styles.selectionAccent} aria-hidden="true" />
          <div className={styles.selectionCopy}>
            <div className={styles.selectionType}>Class</div>
            <h2 className={styles.className}>{node.id}</h2>
            {node.annotation ? (
              <div className={styles.stereotype}>&lt;&lt;{node.annotation.value}&gt;&gt;</div>
            ) : null}
          </div>
        </div>

        <div className={styles.previewCard} aria-label="Selected class color preview">
          <div className={styles.previewHeader}>{node.id}</div>
          <div className={styles.previewBody}>
            {styleDef?.id ? (
              <span className={styles.styleName}>{styleDef.id}</span>
            ) : (
              "Default style"
            )}
          </div>
        </div>

        <dl className={styles.styleList}>
          <div className={styles.styleRow}>
            <dt className={styles.styleLabel}>Fill</dt>
            <dd className={styles.styleValue}>
              <label className={styles.colorControl}>
                <span className={styles.colorInputLabel}>Fill color</span>
                <input
                  className={styles.colorInput}
                  type="color"
                  value={toColorInputValue(fill)}
                  onChange={(event) => onFillColorChange(event.currentTarget.value)}
                />
                <span>{fill ?? "Default"}</span>
              </label>
            </dd>
          </div>
          <StyleValue label="Stroke" value={stroke} swatchClassName={styles.strokeSwatch} />
          <StyleValue label="Text" value={color} swatchClassName={styles.textSwatch} />
        </dl>
      </section>
    </aside>
  );
}

function getStyleProp(
  styleDef: StyleDefNode,
  property: StyleProperty["property"]
): string | undefined {
  return styleDef.properties.find((styleProperty) => styleProperty.property === property)?.value;
}

function toColorInputValue(value: string | undefined): string {
  return /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? (value ?? "#ffffff") : "#ffffff";
}

function StyleValue({
  label,
  value,
  swatchClassName,
}: {
  label: string;
  value?: string;
  swatchClassName: string;
}): ReactElement {
  return (
    <div className={styles.styleRow}>
      <dt className={styles.styleLabel}>{label}</dt>
      <dd className={styles.styleValue}>
        <span className={`${styles.swatch} ${swatchClassName}`} aria-hidden="true" />
        <span>{value ?? "Default"}</span>
      </dd>
    </div>
  );
}
