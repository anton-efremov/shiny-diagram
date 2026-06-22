import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommand";
import type { PlacementMode } from "./placementMode";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import EditorStatus from "./EditorStatus/EditorStatus";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { useSelectedClassIds } from "./useSelectedClassIds";
import type { EditorViewModel } from "./views";
import styles from "./EditorView.module.css";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

/**
 * Renders the visual class-diagram editor shell.
 */
export default function EditorView({ view, dispatch }: EditorViewProps): ReactElement {
  const elements = view.status === "invalidSyntax" ? null : view.elements;
  const { selectedClassIds, setSelectedClassIds } = useSelectedClassIds(elements);
  const [placementMode, setPlacementMode] = useState<PlacementMode | null>(null);
  const selectedClassViews = useMemo(() => {
    const selected = new Set(selectedClassIds);
    return elements?.classes.filter((classView) => selected.has(classView.classId)) ?? [];
  }, [elements, selectedClassIds]);

  if (view.status === "invalidSyntax") {
    return (
      <>
        <EditorStatus view={view} dispatch={dispatch} />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane placementMode={placementMode} onPlacementModeChange={setPlacementMode} />
          <div className={styles.canvasRegion}>
            <div className={styles.errorCanvas}>
              <p className={styles.errorMessage}>{view.message}</p>
            </div>
          </div>
          <StylePane selectedClassViews={selectedClassViews} dispatch={dispatch} />
        </section>
      </>
    );
  }

  if (view.status === "missingAnnotations") {
    return (
      <>
        <EditorStatus view={view} dispatch={dispatch} />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane placementMode={placementMode} onPlacementModeChange={setPlacementMode} />
          <div className={styles.canvasRegion}>
            <div className={styles.missingCanvas}>
              <p className={styles.missingLabel}>Classes without spatial annotations:</p>
              <ul className={styles.missingList}>
                {view.missingIds.map((id) => (
                  <li key={id} className={styles.missingItem}>
                    {id}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <StylePane selectedClassViews={selectedClassViews} dispatch={dispatch} />
        </section>
      </>
    );
  }

  return (
    <>
      <EditorStatus view={view} dispatch={dispatch} />
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane placementMode={placementMode} onPlacementModeChange={setPlacementMode} />
        <div className={styles.canvasRegion}>
          <ClassDiagram
            elements={view.elements}
            selectedClassIds={selectedClassIds}
            placementMode={placementMode}
            onSelectedClassIdsChange={setSelectedClassIds}
            onPlacementModeChange={setPlacementMode}
            dispatch={dispatch}
          />
        </div>
        <StylePane selectedClassViews={selectedClassViews} dispatch={dispatch} />
      </section>
    </>
  );
}
