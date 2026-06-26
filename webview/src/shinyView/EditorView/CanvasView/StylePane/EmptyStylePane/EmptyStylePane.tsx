/**
 * @role [P] Presentational
 * @presents Empty style inspector scenario.
 */

import type { ReactElement } from "react";
import type { EmptyStylePaneView } from "./views";
import styles from "../StylePane.module.css";

type EmptyStylePaneProps = {
  readonly view: EmptyStylePaneView;
};

export default function EmptyStylePane({ view }: EmptyStylePaneProps): ReactElement {
  void view;

  // @job render:structure
  return <div className={styles.emptySelection} aria-label="No selected diagram element" />;
}
