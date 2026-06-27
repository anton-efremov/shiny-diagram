/**
 * @role [P] Presentational
 * @presents Class style action buttons.
 */

import type { ReactElement } from "react";
import ControlButton from "../../../../../ui/ControlButton/ControlButton";
import { DeleteIcon, DuplicateIcon } from "../../../../../ui/icons/icons";
import styles from "../../StylePane.module.css";

export type ClassStyleActionsProps = {
  readonly duplicateLabel: string;
  readonly deleteLabel: string;
  readonly onDuplicate: () => void;
  readonly onDeleteClick: () => void;
};

export default function ClassStyleActions({
  duplicateLabel,
  deleteLabel,
  onDuplicate,
  onDeleteClick,
}: ClassStyleActionsProps): ReactElement {
  return (
    <div className={styles.actionArea}>
      <ControlButton icon={<DuplicateIcon />} label={duplicateLabel} onClick={onDuplicate} />
      <ControlButton
        icon={<DeleteIcon />}
        label={deleteLabel}
        tone="danger"
        onClick={onDeleteClick}
      />
    </div>
  );
}
