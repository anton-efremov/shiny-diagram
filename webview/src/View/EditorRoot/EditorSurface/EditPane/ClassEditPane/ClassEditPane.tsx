/**
 * @behavior Selected class style section routing.
 * @render Class style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleDefId } from "../../../../../shared/ids";
import type { ClassView, StyleView } from "../../../../views/schema";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import ClassActions from "./ClassActions/ClassActions";
import HeaderTextControls from "./HeaderTextControls/HeaderTextControls";
import NamedStyleSelector from "./NamedStyleSelector/NamedStyleSelector";
import StyleSummary from "./StyleSummary/StyleSummary";
import { useInteractions } from "./useInteractions";
import styles from "./ClassEditPane.module.css";

type ClassEditPaneProps = {
  readonly view: readonly ClassView[];
  readonly styles: readonly StyleView[];
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
};

export default function ClassEditPane({
  view,
  styles: styleViews,
  onStyleSelect,
}: ClassEditPaneProps): ReactElement {
  // Event handler props derivation
  const { onNameCommit, onAnnotationCommit, onLabelCommit } = useInteractions();

  return (
    <section className={styles.selectionPanel} aria-label="Selected class styles">
      {view.length === 1 ? (
        <HeaderTextControls
          view={view[0]}
          onNameCommit={onNameCommit}
          onAnnotationCommit={onAnnotationCommit}
          onLabelCommit={onLabelCommit}
        />
      ) : null}
      <StyleSummary view={view} styles={styleViews} onStyleSelect={onStyleSelect} />
      <NamedStyleSelector view={view} styles={styleViews} />
      <ChangeStylePalette view={view} />
      <ClassActions view={view} />
    </section>
  );
}
