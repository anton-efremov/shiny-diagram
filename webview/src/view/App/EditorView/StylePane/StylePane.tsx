import type { CSSProperties, ReactElement } from "react";
import { useEditorState } from "../../../contexts/EditorStateContext";
import { useCanvasState } from "../../../contexts/CanvasStateContext";
import { useStylePaneController } from "./useStylePaneController";
import styles from "./StylePane.module.css";

/**
 * Renders the selected class style inspector.
 */
export default function StylePane(): ReactElement {
  const { elementViews } = useEditorState();
  const { canvasState } = useCanvasState();
  const selectedView = elementViews?.classes.find((v) => v.classId === canvasState.selectedClassId);

  const { onFillColorChange } = useStylePaneController({
    selectedClassId: selectedView?.classId ?? null,
    selectedView,
  });

  if (!selectedView) {
    return (
      <aside className={styles.stylePane} aria-label="Styles pane">
        <header className={styles.header}>Styles</header>
        <div className={styles.emptySelection} aria-label="No selected diagram element" />
      </aside>
    );
  }

  const fill = selectedView.style?.fill;
  const stroke = selectedView.style?.stroke;
  const color = selectedView.style?.color;
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
            <h2 className={styles.className}>{selectedView.header.label}</h2>
            {selectedView.header.stereotype ? (
              <div className={styles.stereotype}>
                &lt;&lt;{selectedView.header.stereotype}&gt;&gt;
              </div>
            ) : null}
          </div>
        </div>

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
