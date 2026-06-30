/**
 * @role [L]+[P]
 * @logic Missing spatial annotation command dispatch.
 * @presents Missing-annotations editor-state interface.
 */
import type { ReactElement } from "react";
import ControlButton from "../../ui/ControlButton/ControlButton";
import { GenerateIcon } from "../../ui/icons/icons";
import { useInteractions } from "./useInteractions";
import styles from "./MissingAnnotationsView.module.css";
import type { EditorViewModel } from "../../views/schema";

type MissingAnnotationsViewProps = {
  readonly view: Extract<EditorViewModel, { readonly status: "missingAnnotations" }>;
};

export default function MissingAnnotationsView({
  view,
}: MissingAnnotationsViewProps): ReactElement {
  // Event handler derivation: generate missing spatial annotations.
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
