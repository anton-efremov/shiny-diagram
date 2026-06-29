/**
 * @role [P]
 * @presents Class style action buttons.
 */

import type { ReactElement } from "react";
import ControlButton from "../../../../../ui/ControlButton/ControlButton";
import { DeleteIcon, DuplicateIcon } from "../../../../../ui/icons/icons";
import styles from "./ClassStyleActions.module.css";

type ClassStyleActionsProps = {
  readonly duplicateLabel: string;
  readonly deleteLabel: string;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

export default function ClassStyleActions({
  duplicateLabel,
  deleteLabel,
  onDuplicate,
  onDelete,
}: ClassStyleActionsProps): ReactElement {
  return (
    <div className={styles.actionArea}>
      <ControlButton icon={<DuplicateIcon />} label={duplicateLabel} onClick={onDuplicate} />
      <ControlButton icon={<DeleteIcon />} label={deleteLabel} tone="danger" onClick={onDelete} />
    </div>
  );
}
