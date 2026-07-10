/**
 * @render Quiet back-navigation affordance with reservable layout space.
 */

import type { ReactElement } from "react";
import styles from "./BackAffordance.module.css";

type BackAffordanceProps = {
  readonly label: string;
  readonly visible?: boolean;
  readonly onClick?: () => void;
};

export default function BackAffordance({
  label,
  visible = true,
  onClick,
}: BackAffordanceProps): ReactElement {
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
