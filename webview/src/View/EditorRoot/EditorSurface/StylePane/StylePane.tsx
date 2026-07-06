/**
 * @behavior Selected class view slicing and style pane scenario routing.
 * @render Style inspector pane.
 */

import type { ReactElement } from "react";
import EmptyStylePane from "./EmptyStylePane/EmptyStylePane";
import ClassStylePane from "./ClassStylePane/ClassStylePane";
import StyleStylePane from "./StyleStylePane/StyleStylePane";
import type { StyleDefId } from "../../../../shared/ids";
import type { SelectionState } from "../../../state/editorStates";
import type { ClassView, DiagramView, StyleView } from "../../../views/schema";
import styles from "./StylePane.module.css";

type StylePaneProps = {
  readonly view: Pick<DiagramView, "classes" | "styles">;
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
};

type StylePaneScenario =
  | {
      readonly kind: "style";
      readonly selectedStyle: StyleView;
    }
  | {
      readonly kind: "empty";
    }
  | {
      readonly kind: "classes";
      readonly selectedClasses: readonly ClassView[];
    };

export default function StylePane({
  view,
  selectionState,
  onStyleSelect,
}: StylePaneProps): ReactElement {
  // View and State slice props derivation
  const stylePaneScenario = toStylePaneScenario(view, selectionState);

  // Child component routing
  let stylePaneContent: ReactElement;
  switch (stylePaneScenario.kind) {
    case "style":
      stylePaneContent = (
        <StyleStylePane view={stylePaneScenario.selectedStyle} styles={view.styles} />
      );
      break;
    case "empty":
      stylePaneContent = <EmptyStylePane />;
      break;
    case "classes":
      stylePaneContent = (
        <ClassStylePane
          view={stylePaneScenario.selectedClasses}
          styles={view.styles}
          onStyleSelect={onStyleSelect}
        />
      );
      break;
  }

  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {stylePaneContent}
    </aside>
  );
}

function toStylePaneScenario(
  view: Pick<DiagramView, "classes" | "styles">,
  selectionState: SelectionState
): StylePaneScenario {
  switch (selectionState.kind) {
    case "none":
      return { kind: "empty" };
    case "classes": {
      const selected = new Set(selectionState.classIds);
      const selectedClasses = view.classes.filter((classView) => selected.has(classView.classId));
      return selectedClasses.length === 0
        ? { kind: "empty" }
        : { kind: "classes", selectedClasses };
    }
    case "style": {
      const selectedStyle = view.styles.find(
        (styleView) => styleView.styleId === selectionState.styleDefId
      );
      return selectedStyle ? { kind: "style", selectedStyle } : { kind: "empty" };
    }
    case "relationship":
      return { kind: "empty" };
  }
}
