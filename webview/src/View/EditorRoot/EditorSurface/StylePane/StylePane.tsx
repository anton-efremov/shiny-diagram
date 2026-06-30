/**
 * @behavior Selected class view slicing and style pane scenario routing.
 * @render Style inspector pane.
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

export default function StylePane({ view, selectionState }: StylePaneProps): ReactElement {
  // View and State slice props derivation
  const selectedClasses = view.classes.filter((classView) =>
    selectionState.classIds.includes(classView.classId)
  );

  // Child component routing
  const stylePaneContent =
    selectedClasses.length === 0 ? <EmptyStylePane /> : <ClassStylePane view={selectedClasses} />;

  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {stylePaneContent}
    </aside>
  );
}
