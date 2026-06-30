/**
 * @behavior Missing spatial annotation command dispatch.
 * @render Missing-annotations editor-state interface.
 */

import type { ReactElement } from "react";
import ControlButton from "../../ui/ControlButton/ControlButton";
import { GenerateIcon } from "../../ui/icons/icons";
import { useInteractions } from "./useInteractions";
import styles from "./MissingAnnotationsSurface.module.css";
import type { EditorViewModel } from "../../views/schema";

type MissingAnnotationsView = Pick<
  Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
  "missingClassIds" | "diagram"
>;

type MissingAnnotationsSurfaceProps = {
  readonly view: MissingAnnotationsView;
};

export default function MissingAnnotationsSurface({
  view,
}: MissingAnnotationsSurfaceProps): ReactElement {
  // Event handler props derivation
  const { onGenerate } = useInteractions({ view });

  return (
    <>
      <div className={styles.statusMessage}>
        ⚠ Missing annotations
        <ControlButton icon={<GenerateIcon />} label="Generate" onClick={onGenerate} />
      </div>
      <div className={styles.missingCanvas}>
        <p className={styles.missingLabel}>Classes without spatial annotations:</p>
        <ul className={styles.missingList}>
          {view.missingClassIds.map((id) => (
            <li key={id} className={styles.missingItem}>
              {id}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
