/**
 * @behavior Save style prompt lifecycle and transaction dispatch.
 * @state StyleSummary prompt, draft name, and notification state updates.
 */

import { useCallback } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { ClassView, StyleView } from "../../../../../views/schema";
import type { StyleProperties } from "../../../../../../shared/style";
import { toStyleSaveTransaction } from "./transactions";

type Interactions = {
  readonly onPromptOpen: () => void;
  readonly onDraftNameChange: (draftName: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type UseInteractionsInput = {
  readonly view: readonly ClassView[];
  readonly scenario: SaveStyleScenario;
  readonly styles: readonly StyleView[];
  readonly draftNameState: string;
  readonly setDraftNameState: Dispatch<SetStateAction<string>>;
  readonly setPromptState: Dispatch<SetStateAction<boolean>>;
  readonly setNotificationState: Dispatch<SetStateAction<NotificationState | null>>;
};

type NotificationState = {
  readonly key: number;
  readonly message: string;
};

type SaveStyleScenario =
  | {
      readonly kind: "direct";
      readonly style: StyleProperties;
    }
  | {
      readonly kind: "disabled";
    };

export function useInteractions({
  view,
  scenario,
  styles,
  draftNameState,
  setDraftNameState,
  setPromptState,
  setNotificationState,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onPromptOpen = useCallback(() => {
    setPromptState(true);
  }, [setPromptState]);

  const onDraftNameChange = useCallback(
    (draftName: string) => {
      setDraftNameState(draftName);
      setNotificationState(null);
    },
    [setDraftNameState, setNotificationState]
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (scenario.kind !== "direct") return;

      const normalizedName = toCamelCaseName(draftNameState);
      if (normalizedName === "") return;
      if (styles.some((styleView) => styleView.name === normalizedName)) {
        setNotificationState((state) => ({
          key: (state?.key ?? 0) + 1,
          message: `Style "${normalizedName}" already exists.`,
        }));
        return;
      }

      dispatchTransaction(toStyleSaveTransaction(view, normalizedName, scenario.style));
      setDraftNameState("");
      setNotificationState(null);
      setPromptState(false);
    },
    [
      dispatchTransaction,
      draftNameState,
      scenario,
      setDraftNameState,
      setNotificationState,
      setPromptState,
      styles,
      view,
    ]
  );

  return { onPromptOpen, onDraftNameChange, onSubmit };
}

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
