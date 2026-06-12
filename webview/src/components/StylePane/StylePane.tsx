import type { CSSProperties, ReactElement } from "react";
import type { ClassBoxProps } from "../../parsers/classDiagram/diagramModel";
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

  const { node, style } = selectedClassBox;
  const dynamicVars = {
    "--style-fill": style?.fill,
    "--style-stroke": style?.stroke,
    "--style-color": style?.color,
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
            {node.stereotype ? (
              <div className={styles.stereotype}>&lt;&lt;{node.stereotype}&gt;&gt;</div>
            ) : null}
          </div>
        </div>

        <div className={styles.previewCard} aria-label="Selected class color preview">
          <div className={styles.previewHeader}>{node.id}</div>
          <div className={styles.previewBody}>
            {style?.name ? <span className={styles.styleName}>{style.name}</span> : "Default style"}
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
                  value={toColorInputValue(style?.fill)}
                  onChange={(event) => onFillColorChange(event.currentTarget.value)}
                />
                <span>{style?.fill ?? "Default"}</span>
              </label>
            </dd>
          </div>
          <StyleValue label="Stroke" value={style?.stroke} swatchClassName={styles.strokeSwatch} />
          <StyleValue label="Text" value={style?.color} swatchClassName={styles.textSwatch} />
        </dl>
      </section>
    </aside>
  );
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
