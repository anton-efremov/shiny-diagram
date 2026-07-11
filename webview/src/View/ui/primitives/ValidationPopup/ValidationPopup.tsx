/**
 * @behavior Escape and outside-pointer validation dismissal routing.
 * @render Top-layer validation-message overlay anchored to its call site.
 */

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import styles from "./ValidationPopup.module.css";

type ValidationPopupProps = {
  readonly messages: readonly string[];
  readonly onDismiss: () => void;
};

type PopupPosition = {
  readonly left: number;
  readonly top: number;
  readonly placement: "above" | "below";
};

export default function ValidationPopup({
  messages,
  onDismiss,
}: ValidationPopupProps): ReactElement {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopupPosition | null>(null);

  useLayoutEffect(() => {
    const popupElement = popupRef.current;

    function updatePosition(): void {
      if (!popupElement?.matches(":popover-open")) popupElement?.showPopover();
      const anchor = anchorRef.current?.getBoundingClientRect();
      const popup = popupElement?.getBoundingClientRect();
      if (!anchor || !popup) return;
      const placement = anchor.top >= popup.height + 10 ? "above" : "below";
      setPosition({
        left: Math.min(
          window.innerWidth - popup.width / 2 - 8,
          Math.max(popup.width / 2 + 8, anchor.left + anchor.width / 2)
        ),
        top: placement === "above" ? anchor.top - 8 : anchor.bottom + 8,
        placement,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      if (popupElement?.matches(":popover-open")) popupElement.hidePopover();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [messages]);

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
        style={position ? { left: position.left, top: position.top } : undefined}
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
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
