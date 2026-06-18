import type { ReactElement } from "react";
import { useAutorender } from "./useAutorender";
import styles from "./AutorenderView.module.css";

type AutorenderViewProps = { sourceText: string };

export default function AutorenderView({ sourceText }: AutorenderViewProps): ReactElement {
  const { mermaidContainerRef, renderError } = useAutorender(sourceText, true);

  return (
    <section className={styles.canvas} aria-label="Mermaid autorender">
      {renderError ? <pre className={styles.error}>{renderError}</pre> : null}
      <div className={styles.mermaidOutput} ref={mermaidContainerRef} />
    </section>
  );
}
