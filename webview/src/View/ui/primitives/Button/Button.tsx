/**
 * @behavior Button click routing.
 * @render Shared command button.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  readonly label: string;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
  readonly tone?: "neutral" | "danger";
  readonly size?: "default" | "compact";
  readonly alignment?: "stretch" | "end";
  readonly onClick?: () => void;
};

export default function Button({
  label,
  icon,
  disabled = false,
  tone = "neutral",
  size = "default",
  alignment = "stretch",
  onClick,
}: ButtonProps): ReactElement {
  const className = [
    tone === "danger" ? styles.dangerButton : styles.button,
    size === "compact" ? styles.compact : "",
    alignment === "end" ? styles.endAligned : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {icon === undefined ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
