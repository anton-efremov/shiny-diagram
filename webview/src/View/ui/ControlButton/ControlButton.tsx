/**
 * @role [P] Presentational
 * @presents Shared Shiny View button control.
 */

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./ControlButton.module.css";

type ControlButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  readonly icon?: ReactNode;
  readonly label?: string;
  readonly variant?: "compact" | "label";
  readonly tone?: "neutral" | "danger";
  readonly active?: boolean;
  readonly pressed?: boolean;
  readonly type?: "button" | "submit" | "reset";
};

export default function ControlButton({
  icon,
  label,
  variant = "label",
  tone = "neutral",
  active = false,
  pressed,
  type = "button",
  className,
  children,
  ...buttonProps
}: ControlButtonProps): ReactElement {
  // @job connect:child:view
  const isIconOnly = variant === "compact";
  const content = children ?? label;

  const ariaPressed = pressed ?? (active ? true : undefined);

  // @job render:structure
  return (
    <button
      {...buttonProps}
      type={type}
      aria-pressed={ariaPressed}
      className={[
        styles.button,
        variant === "compact" ? styles.compact : styles.withLabel,
        tone === "danger" ? styles.danger : "",
        active ? styles.active : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {isIconOnly ? null : <span className={styles.labelText}>{content}</span>}
    </button>
  );
}
