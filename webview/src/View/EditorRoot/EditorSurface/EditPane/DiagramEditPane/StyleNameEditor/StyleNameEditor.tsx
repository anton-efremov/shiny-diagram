/**
 * @behavior Style name validation and commit routing.
 * @render Named style swatch and commit name field.
 */

import type { ReactElement } from "react";
import type { StyleView } from "../../../../../views/schema";
import type { SelectionState } from "../../../../../state/editorStates";
import type { TransactionResult } from "../../../../../commands/editorCommands";
import CommitTextField from "../../../../../ui/composites/CommitTextField/CommitTextField";
import StyledBoxSwatch from "../../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import { useInteractions } from "./useInteractions";

type StyleNameEditorProps = {
  readonly view: readonly StyleView[];
  readonly selectionState: Extract<SelectionState, { readonly kind: "style" }>;
  readonly onRenameCommitted: (
    result: TransactionResult,
    previousStyleDefId: StyleView["styleId"]
  ) => void;
};

export default function StyleNameEditor({
  view,
  selectionState,
  onRenameCommitted,
}: StyleNameEditorProps): ReactElement {
  // View and State slice props derivation
  const selectedStyle = view.find((styleView) => styleView.styleId === selectionState.styleDefId);

  // Event handler props derivation
  const { onNameCommit } = useInteractions({
    view: selectedStyle,
    onRenameCommitted,
  });

  // Child component routing
  if (!selectedStyle) return <></>;

  return (
    <>
      <StyledBoxSwatch styleValues={selectedStyle.style} label={selectedStyle.name} />
      <CommitTextField
        initialValue={selectedStyle.name}
        validate={(draft) => validateStyleName(draft, selectedStyle, view)}
        ariaLabel="Style name"
        onCommit={onNameCommit}
        onDiscard={() => undefined}
        onCancel={() => undefined}
      />
    </>
  );
}

// Private helpers
function validateStyleName(
  draft: string,
  view: StyleView,
  styles: readonly StyleView[]
): readonly string[] {
  const name = toStyleName(draft);
  if (name === "") return [];
  return styles.some((styleView) => styleView.styleId !== view.styleId && styleView.name === name)
    ? [`Style "${name}" already exists.`]
    : [];
}

function toStyleName(value: string): string {
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
