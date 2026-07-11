/**
 * @behavior Preset select and custom text commit lifecycle.
 * @render Commit combo box.
 */

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import type { DropdownOption } from "../Dropdown/Dropdown";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import styles from "./CommitComboBox.module.css";

type CommitComboBoxProps = {
  readonly initialValue: string;
  readonly options: readonly DropdownOption[];
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly isLabelVisible?: boolean;
  readonly onCommit: (value: string) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function CommitComboBox({
  initialValue,
  options,
  validate,
  disabled = false,
  ariaLabel,
  isLabelVisible = true,
  onCommit,
  onDiscard,
  onCancel,
}: CommitComboBoxProps): ReactElement {
  const [draft, setDraft] = useState(initialValue);
  const [isCustom, setIsCustom] = useState(() => !hasPresetValue(options, initialValue));
  const [isOpen, setIsOpen] = useState(false);
  const comboBoxRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useState<readonly string[]>([]);
  const selectedOption = options.find((option) => option.value === initialValue);
  const renderedOptions = [...options, { value: "__custom", label: "Custom" }];

  useEffect(() => {
    setDraft(initialValue);
    setIsCustom(!hasPresetValue(options, initialValue));
    setMessages([]);
  }, [initialValue, options]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event: PointerEvent): void {
      if (comboBoxRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    function handleWindowKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [isOpen]);

  function commitCustom(): void {
    const nextMessages = validate(draft);
    if (nextMessages.length > 0) {
      setMessages(nextMessages);
      return;
    }
    setMessages([]);
    onCommit(draft);
  }

  function discardIfInvalid(): void {
    if (!isCustom) return;
    const nextMessages = validate(draft);
    if (nextMessages.length === 0) {
      setMessages([]);
      onCommit(draft);
      return;
    }
    setDraft(initialValue);
    setMessages([]);
    onDiscard(nextMessages);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commitCustom();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(initialValue);
      setMessages([]);
      onCancel();
    }
  }

  function handleComboKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!isOpen || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
    menuButtonRef.current?.focus();
  }

  function selectValue(nextValue: string): void {
    setIsOpen(false);
    if (nextValue === "__custom") {
      setIsCustom(true);
      setDraft(hasPresetValue(options, initialValue) ? "" : initialValue);
      return;
    }
    setIsCustom(false);
    setDraft(nextValue);
    setMessages([]);
    onCommit(nextValue);
  }

  const visibleLabel = isLabelVisible ? ariaLabel : undefined;

  return (
    <div className={visibleLabel === undefined ? styles.comboWithoutLabel : styles.combo}>
      {visibleLabel === undefined ? null : <span className={styles.label}>{visibleLabel}</span>}
      <div ref={comboBoxRef} className={styles.comboBox} onKeyDown={handleComboKeyDown}>
        {isCustom ? (
          <TextField
            value={draft}
            disabled={disabled}
            invalid={messages.length > 0}
            ariaLabel={ariaLabel}
            hasEndAction
            onChange={(value) => {
              setDraft(value);
              setMessages([]);
            }}
            onBlur={discardIfInvalid}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button
            type="button"
            className={styles.valueButton}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {selectedOption?.label ?? ""}
          </button>
        )}
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          disabled={disabled}
          aria-label={ariaLabel === undefined ? "Options" : `${ariaLabel} options`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsOpen((current) => !current)}
        />
        {isOpen ? (
          <div className={styles.menu} role="listbox">
            {renderedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.option}
                role="option"
                aria-selected={
                  option.value === "__custom"
                    ? isCustom
                    : !isCustom && option.value === initialValue
                }
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectValue(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        {messages.length > 0 ? (
          <ValidationPopup messages={messages} onDismiss={() => setMessages([])} />
        ) : null}
      </div>
    </div>
  );
}

function hasPresetValue(options: readonly DropdownOption[], value: string): boolean {
  return options.some((option) => option.value === value);
}
