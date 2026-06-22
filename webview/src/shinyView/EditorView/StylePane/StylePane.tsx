import type { CSSProperties, ReactElement } from "react";
import { useEditorState } from "../../contexts/EditorStateContext";
import { useCanvasState } from "../../contexts/CanvasStateContext";
import { useStylePaneInteractions as useStylePaneInteractions } from "./useStylePaneInteractions";
import styles from "./StylePane.module.css";

/**
 * Renders the selected class style inspector.
 */
export default function StylePane(): ReactElement {
  const { elementViews } = useEditorState();
  const { canvasState } = useCanvasState();
  const selectedClassIds = new Set(canvasState.selectedClassIds);
  const selectedViews = elementViews?.classes.filter((v) => selectedClassIds.has(v.classId)) ?? [];
  const selectedView = selectedViews.length === 1 ? selectedViews[0] : undefined;

  const { onFillColorChange, onDuplicate, onDeleteClick } = useStylePaneInteractions({
    selectedClassIds: selectedViews.map((view) => view.classId),
    selectedView,
  });

  if (selectedViews.length === 0) {
    return (
      <aside className={styles.stylePane} aria-label="Styles pane">
        <header className={styles.header}>Styles</header>
        <div className={styles.emptySelection} aria-label="No selected diagram element" />
      </aside>
    );
  }

  if (selectedViews.length > 1) {
    return (
      <aside className={styles.stylePane} aria-label="Styles pane">
        <header className={styles.header}>Styles</header>
        <section className={styles.selectionPanel} aria-label="Selected class actions">
          <div className={styles.multiSelectionSummary}>
            <div className={styles.selectionType}>Selection</div>
            <h2 className={styles.className}>{selectedViews.length} classes selected</h2>
          </div>

          <div className={styles.actionArea}>
            <button className={styles.actionButton} type="button" onClick={onDuplicate}>
              Duplicate selected
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              type="button"
              onClick={onDeleteClick}
            >
              Delete selected
            </button>
          </div>
        </section>
      </aside>
    );
  }

  const singleSelectedView = selectedView;
  if (!singleSelectedView) {
    throw new Error("Expected one selected class view");
  }

  const fill = singleSelectedView.style?.fill;
  const stroke = singleSelectedView.style?.stroke;
  const color = singleSelectedView.style?.color;
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
            <h2 className={styles.className}>{singleSelectedView.header.label}</h2>
            {singleSelectedView.header.stereotype ? (
              <div className={styles.stereotype}>
                &lt;&lt;{singleSelectedView.header.stereotype}&gt;&gt;
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.previewCard} aria-label="Selected class color preview">
          <div className={styles.previewHeader}>{singleSelectedView.header.label}</div>
          <div className={styles.previewBody}>
            {singleSelectedView.style?.name ? (
              <span className={styles.styleName}>{singleSelectedView.style.name}</span>
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

        <div className={styles.actionArea}>
          <button className={styles.actionButton} type="button" onClick={onDuplicate}>
            Duplicate
          </button>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            type="button"
            onClick={onDeleteClick}
          >
            Delete class
          </button>
        </div>
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
