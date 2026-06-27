/**
 * @role [P] Presentational
 * @presents Missing-annotations editor-state interface.
 */
import { useCallback } from "react";
import type { ReactElement } from "react";
import { useDispatchCommand } from "../contexts";
import ControlButton from "../../ui/ControlButton/ControlButton";
import { GenerateIcon } from "../../ui/icons/icons";
import { toMissingAnnotationTransaction } from "./commands";
import styles from "./MissingAnnotationsView.module.css";
import type { EditorViewModel } from "../../views/schema";

type MissingAnnotationsViewProps = {
  readonly view: Pick<
    Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
    "missingClassIds" | "diagram"
  >;
};

/**
 * Renders the missing annotations editor interface.
 */
export default function MissingAnnotationsView({
  view,
}: MissingAnnotationsViewProps): ReactElement {
  const dispatchCommand = useDispatchCommand();

  // @job connect:command:wire
  const onGenerate = useCallback(() => {
    dispatchCommand(toMissingAnnotationTransaction(view));
  }, [dispatchCommand, view]);

  // @job render:structure
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
