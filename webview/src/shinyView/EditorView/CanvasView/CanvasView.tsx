/**
 * @role [P] Presentational
 * @presents Ready editor-state interface.
 */
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "../EditorView.module.css";
import type { CanvasViewModel } from "./views";

type CanvasViewProps = {
  readonly view: CanvasViewModel;
};

/**
 * Renders the ready class diagram editor interface.
 */
export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  // @job render:layout
  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane view={view.toolPaneView} />
      <div className={styles.canvasRegion}>
        <ClassDiagram view={view.classDiagramView} />
      </div>
      <StylePane view={view.stylePaneView} />
    </section>
  );
}
