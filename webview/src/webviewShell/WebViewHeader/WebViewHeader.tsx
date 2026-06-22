import type { ReactElement } from "react";
import type { WebViewMode } from "../state";
import Toggle from "./Toggle/Toggle";
import styles from "./WebViewHeader.module.css";

type WebViewHeaderProps = {
  mode: WebViewMode;
  onModeChange: (mode: WebViewMode) => void;
};

/**
 * Renders the product title and top-level Mermaid/Shiny mode control.
 */
export default function WebViewHeader({ mode, onModeChange }: WebViewHeaderProps): ReactElement {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Shiny Diagram</h1>
      <div className={styles.toolbar}>
        <Toggle
          options={[
            { value: "mermaid", label: "Mermaid" },
            { value: "shiny", label: "Shiny" },
          ]}
          value={mode}
          onChange={onModeChange}
          ariaLabel="Diagram modes"
        />
      </div>
    </header>
  );
}
