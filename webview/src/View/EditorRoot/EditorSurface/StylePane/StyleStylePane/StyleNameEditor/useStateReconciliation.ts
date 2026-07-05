/**
 * @behavior StyleNameEditor draft state reconciliation when the selected style name changes.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

type StateReconciliationInput = {
  readonly name: string;
  readonly setDraftNameState: Dispatch<SetStateAction<string>>;
  readonly setNotificationState: Dispatch<SetStateAction<NotificationState | null>>;
};

type NotificationState = {
  readonly key: number;
  readonly message: string;
};

export function useStateReconciliation({
  name,
  setDraftNameState,
  setNotificationState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setDraftNameState(name);
    setNotificationState(null);
  }, [name, setDraftNameState, setNotificationState]);
}
