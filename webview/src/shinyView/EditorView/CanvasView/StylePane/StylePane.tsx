/**
 * @role [L]+[P] Logic and Presentational
 * @logic StylePane scenario routing for selected class views.
 * @presents Style inspector pane.
 */
import type { ReactElement } from "react";
import EmptyStylePane from "./EmptyStylePane/EmptyStylePane";
import MultiClassStylePane from "./MultiClassStylePane/MultiClassStylePane";
import SingleClassStylePane from "./SingleClassStylePane/SingleClassStylePane";
import { toStylePaneScenarioView } from "./childViews";
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
  const scenarioView = toStylePaneScenarioView(view);

  // @job logic:child:route
  let scenario: ReactElement;
  switch (scenarioView.kind) {
    case "empty":
      scenario = <EmptyStylePane view={scenarioView.view} />;
      break;
    case "singleClass":
      scenario = <SingleClassStylePane view={scenarioView.view} />;
      break;
    case "multiClass":
      scenario = <MultiClassStylePane view={scenarioView.view} />;
      break;
  }

  // @job render:structure
  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {scenario}
    </aside>
  );
}
