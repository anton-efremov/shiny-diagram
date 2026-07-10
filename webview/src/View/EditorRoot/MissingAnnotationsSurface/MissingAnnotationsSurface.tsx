/**
 * @behavior Missing spatial annotation command dispatch.
 * @render Missing-annotations editor-state interface.
 */

import type { ReactElement } from "react";
import Button from "../../ui/primitives/Button/Button";
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
        <Button icon={<GenerateGlyph />} label="Generate" onClick={onGenerate} />
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

function GenerateGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.25 4.25l1.4 1.4M10.35 10.35l1.4 1.4M11.75 4.25l-1.4 1.4M5.65 10.35l-1.4 1.4M8 5.75 9.1 8 8 10.25 6.9 8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
