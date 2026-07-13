/**
 * @behavior Escape and outside-pointer validation dismissal routing.
 * @render Canvas validation-message overlay anchored to its call site.
 */

import { useLayoutEffect } from "react";
import type { CSSProperties, ReactElement } from "react";
import { useAnchoredPopupPosition } from "../../../core/useAnchoredPopupPosition";
import styles from "./InlineValidationPopup.module.css";

type InlineValidationPopupProps = {
  readonly messages: readonly string[];
  readonly stacking: number;
  readonly onDismiss: () => void;
};

export default function InlineValidationPopup({
  messages,
  stacking,
  onDismiss,
}: InlineValidationPopupProps): ReactElement {
  const { anchorRef, popupRef, position } = useAnchoredPopupPosition(messages);
  const style = position
    ? ({ left: position.left, top: position.top, zIndex: stacking } satisfies CSSProperties)
    : ({ zIndex: stacking } satisfies CSSProperties);

  useLayoutEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onDismiss();
    }

    function handlePointerDown(): void {
      onDismiss();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onDismiss]);

  return (
    <>
      <span ref={anchorRef} className={styles.anchor} aria-hidden="true" />
      <div
        ref={popupRef}
        className={`${styles.popup} ${position?.placement === "below" ? styles.below : styles.above}`}
        style={style}
        role="alert"
        popover="manual"
      >
        <span className={styles.message}>{messages.join(" ")}</span>
        <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={onDismiss}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M5 5 11 11M11 5 5 11"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
