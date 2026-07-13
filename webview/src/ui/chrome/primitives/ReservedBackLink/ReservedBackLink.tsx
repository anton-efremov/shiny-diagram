/**
 * Back-navigation button that keeps its place when unavailable.
 *
 * Renders `label` as the button content and reports activation through
 * `onClick`.
 *
 * Options:
 * - `visible` — on exposes the control normally; off removes it from the
 *   accessibility tree and focus order while it remains visibly rendered
 */

import type { ReactElement } from "react";
import styles from "./ReservedBackLink.module.css";

type ReservedBackLinkProps = {
  readonly label: string;
  readonly visible?: boolean;
  readonly onClick?: () => void;
};

export default function ReservedBackLink({
  label,
  visible = true,
  onClick,
}: ReservedBackLinkProps): ReactElement {
  return (
    <button
      type="button"
      className={visible ? styles.affordance : styles.hiddenAffordance}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
