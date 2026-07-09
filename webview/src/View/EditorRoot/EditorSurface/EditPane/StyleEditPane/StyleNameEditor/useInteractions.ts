/**
 * @behavior Style name edit lifecycle, rename transaction dispatch, and StyleNameEditor draft, edit mode, and notification state updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { StyleView } from "../../../../../views/schema";
import { toStyleNameSetTransaction } from "./transactions";

type Interactions = {
  readonly onEditStart: () => void;
  readonly onDraftNameChange: (draftName: string) => void;
  readonly onNameCommit: () => void;
  readonly onNameCancel: () => void;
};

type UseInteractionsInput = {
  readonly view: StyleView;
  readonly styles: readonly StyleView[];
  readonly draftNameState: string;
  readonly setDraftNameState: Dispatch<SetStateAction<string>>;
  readonly setEditingState: Dispatch<SetStateAction<boolean>>;
  readonly setNotificationState: Dispatch<SetStateAction<NotificationState | null>>;
};

type NotificationState = {
  readonly key: number;
  readonly message: string;
};

export function useInteractions({
  view,
  styles,
  draftNameState,
  setDraftNameState,
  setEditingState,
  setNotificationState,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onEditStart = useCallback(() => {
    setEditingState(true);
  }, [setEditingState]);

  const onDraftNameChange = useCallback(
    (draftName: string) => {
      setDraftNameState(draftName);
      setNotificationState(null);
    },
    [setDraftNameState, setNotificationState]
  );

  const onNameCommit = useCallback(() => {
    const name = toCamelCaseName(draftNameState);
    if (name === "") {
      setEditingState(false);
      return;
    }
    if (styles.some((styleView) => styleView.styleId !== view.styleId && styleView.name === name)) {
      setNotificationState((state) => ({
        key: (state?.key ?? 0) + 1,
        message: `Style "${name}" already exists.`,
      }));
      return;
    }
    if (name !== view.name) {
      dispatchTransaction(toStyleNameSetTransaction(view, name));
    }
    setNotificationState(null);
    setEditingState(false);
  }, [dispatchTransaction, draftNameState, setEditingState, setNotificationState, styles, view]);

  const onNameCancel = useCallback(() => {
    setDraftNameState(view.name);
    setNotificationState(null);
    setEditingState(false);
  }, [setDraftNameState, setEditingState, setNotificationState, view.name]);

  return { onEditStart, onDraftNameChange, onNameCommit, onNameCancel };
}

// Private helpers
function toCamelCaseName(value: string): string {
  return value
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(toCapitalizedWord)
    .join("");
}

function toCapitalizedWord(value: string): string {
  const lower = value.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
}
