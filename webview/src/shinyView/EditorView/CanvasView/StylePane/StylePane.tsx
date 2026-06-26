/**
 * @role [L]+[P] Logic and Presentational
 * @logic StylePane scenario routing for selected class views.
 * @presents Style inspector pane.
 */
import type { ReactElement } from "react";
import ClassStylePane from "./ClassStylePane/ClassStylePane";
import EmptyStylePane from "./EmptyStylePane/EmptyStylePane";
import { toClassStylePaneView, toEmptyStylePaneView } from "./childViews";
import type { StylePaneView } from "./views";
import styles from "./StylePane.module.css";

type StylePaneProps = {
  readonly view: StylePaneView;
};

/**
 * Renders the selected class style inspector.
 */
export default function StylePane({ view }: StylePaneProps): ReactElement {
  // @job logic:child:view
  const classStylePaneView = toClassStylePaneView(view);

  // @job logic:child:route
  const scenario =
    classStylePaneView.selectedClasses.length === 0 ? (
      <EmptyStylePane view={toEmptyStylePaneView(view)} />
    ) : (
      <ClassStylePane view={classStylePaneView} />
    );

  // @job render:structure
  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {scenario}
    </aside>
  );
}
