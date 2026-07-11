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
  readonly tone?: "neutral" | "danger" | "accent";
  readonly size?: "default" | "compact";
  readonly shape?: "rounded" | "pill";
  readonly alignment?: "stretch" | "end";
  readonly visible?: boolean;
  readonly onClick?: () => void;
};

export default function Button({
  label,
  icon,
  disabled = false,
  tone = "neutral",
  size = "default",
  shape = "rounded",
  alignment = "stretch",
  visible = true,
  onClick,
}: ButtonProps): ReactElement {
  const className = [
    tone === "danger"
      ? styles.dangerButton
      : tone === "accent"
        ? styles.accentButton
        : styles.button,
    size === "compact" ? styles.compact : "",
    shape === "pill" ? styles.pill : "",
    alignment === "end" ? styles.endAligned : "",
    visible ? "" : styles.hidden,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || !visible}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      onClick={onClick}
    >
      {icon === undefined ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
