/**
 * Inline text area for controlled multiline entry.
 *
 * Displays `value` with the initial height hinted by `rows`, reports edits
 * through `onChange`, and forwards focus loss and keyboard input through
 * `onBlur` and `onKeyDown`.
 *
 * Options:
 * - `autoFocus` — on requests focus when the area mounts
 * - `treatment` — `body` fills its container without resizing; `row` grows with
 *   its content as the draft changes
 * - `invalid` — on shows invalid treatment for the row form
 * - `hasEndAction` — on reserves trailing room for an overlaid row action
 */

import { useLayoutEffect, useRef } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import styles from "./InlineTextArea.module.css";

type InlineTextAreaProps = {
  readonly value: string;
  readonly autoFocus: boolean;
  readonly treatment: "body" | "row";
  readonly rows?: number;
  readonly invalid?: boolean;
  readonly hasEndAction?: boolean;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export default function InlineTextArea({
  value,
  autoFocus,
  treatment,
  rows,
  invalid = false,
  hasEndAction = false,
  onChange,
  onBlur,
  onKeyDown,
}: InlineTextAreaProps): ReactElement {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (treatment !== "row" || !areaRef.current) return;
    areaRef.current.style.height = "auto";
    areaRef.current.style.height = `${areaRef.current.scrollHeight}px`;
  }, [treatment, value]);

  return (
    <textarea
      ref={areaRef}
      className={`${styles.area} ${styles[treatment]} ${hasEndAction ? styles.withEndAction : ""}`}
      value={value}
      rows={rows}
      aria-invalid={invalid}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
