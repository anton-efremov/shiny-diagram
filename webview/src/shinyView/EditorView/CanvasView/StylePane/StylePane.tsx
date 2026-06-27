/**
 * @role [L]+[P] Logic and Presentational
 * @logic StylePane scenario routing for selected class views.
 * @presents Style inspector pane.
 */
import type { ReactElement } from "react";
import ClassStylePane from "./ClassStylePane/ClassStylePane";
import EmptyStylePane from "./EmptyStylePane/EmptyStylePane";
import type { SelectionState } from "../../../state/editorStates";
import type { DiagramView } from "../../../views/schema";
import styles from "./StylePane.module.css";

type StylePaneProps = {
  readonly view: Pick<DiagramView, "classes">;
  readonly selectionState: SelectionState;
};

/**
 * Renders the selected class style inspector.
 */
export default function StylePane({ view, selectionState }: StylePaneProps): ReactElement {
  // @job logic:child:view
  const selectedClasses = view.classes.filter((classView) =>
    selectionState.classIds.includes(classView.classId)
  );

  // @job logic:child:route
  const scenario =
    selectedClasses.length === 0 ? <EmptyStylePane /> : <ClassStylePane view={selectedClasses} />;

  // @job render:structure
  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {scenario}
    </aside>
  );
}
