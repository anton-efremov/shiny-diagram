/**
 * @behavior Multiline text entry change routing.
 * @render Shared text area.
 */

import { useLayoutEffect, useRef } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import styles from "./TextArea.module.css";

type TextAreaProps = {
  readonly value: string;
  readonly rows: number;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly autoFocus?: boolean;
  readonly appearance?: "pane" | "inline";
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export default function TextArea({
  value,
  rows,
  disabled = false,
  invalid = false,
  autoFocus = false,
  appearance = "pane",
  onChange,
  onBlur,
  onKeyDown,
}: TextAreaProps): ReactElement {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (appearance !== "inline" || !areaRef.current) return;
    areaRef.current.style.height = "auto";
    areaRef.current.style.height = `${areaRef.current.scrollHeight}px`;
  }, [appearance, value]);

  return (
    <textarea
      ref={areaRef}
      className={`${styles.area} ${appearance === "inline" ? styles.inline : ""}`}
      value={value}
      rows={rows}
      disabled={disabled}
      aria-invalid={invalid}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
