/**
 * @behavior Toggle button press indication and click routing.
 * @render Shared icon toggle button.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./ToggleButton.module.css";

type ToggleButtonProps = {
  readonly icon: ReactNode;
  readonly label?: string;
  readonly title: string;
  readonly pressed: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
};

export default function ToggleButton({
  icon,
  label,
  title,
  pressed,
  disabled = false,
  onClick,
}: ToggleButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={label === undefined ? styles.iconOnlyButton : styles.labeledButton}
      aria-label={label === undefined ? title : undefined}
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      {label === undefined ? null : <span className={styles.label}>{label}</span>}
    </button>
  );
}
