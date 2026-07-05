/**
 * @behavior Named style editor section routing.
 * @render Named style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleView } from "../../../../views/schema";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import StyleNameEditor from "./StyleNameEditor/StyleNameEditor";
import { useInteractions } from "./useInteractions";
import styles from "./StyleStylePane.module.css";

type StyleStylePaneProps = {
  readonly view: StyleView;
  readonly styles: readonly StyleView[];
};

export default function StyleStylePane({
  view,
  styles: styleViews,
}: StyleStylePaneProps): ReactElement {
  const { onDelete } = useInteractions(view);

  return (
    <section className={styles.panel} aria-label="Named style editor">
      <StyleNameEditor view={view} styles={styleViews} />
      <ChangeStylePalette view={view} />
      <button type="button" className={styles.danger} onClick={onDelete}>
        Delete style
      </button>
    </section>
  );
}
