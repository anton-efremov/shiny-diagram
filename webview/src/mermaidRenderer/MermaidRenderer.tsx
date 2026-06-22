import type { ReactElement } from "react";
import { useMermaidRender } from "./useMermaidRender";
import styles from "./MermaidRenderer.module.css";

type MermaidRendererProps = { sourceText: string };

/**
 * Renders Mermaid source through Mermaid's standard SVG renderer.
 */
export default function MermaidRenderer({ sourceText }: MermaidRendererProps): ReactElement {
  const { mermaidContainerRef, renderError } = useMermaidRender(sourceText);

  return (
    <section className={styles.canvas} aria-label="Mermaid autorender">
      {renderError ? <pre className={styles.error}>{renderError}</pre> : null}
      <div className={styles.mermaidOutput} ref={mermaidContainerRef} />
    </section>
  );
}
