/**
 * @behavior Style name validation and commit routing.
 * @render Named style swatch and commit name field.
 */

import type { ReactElement } from "react";
import type { StyleView } from "../../../../../views/schema";
import CommitTextField from "../../../../../ui/composites/CommitTextField/CommitTextField";
import StyledBoxSwatch from "../../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import { toStyleNameSetTransaction } from "./transactions";
import { useDispatchTransaction } from "../../../../../contexts";

type StyleNameEditorProps = {
  readonly view: StyleView;
  readonly styles: readonly StyleView[];
};

export default function StyleNameEditor({
  view,
  styles: styleViews,
}: StyleNameEditorProps): ReactElement {
  const dispatchTransaction = useDispatchTransaction();

  return (
    <>
      <StyledBoxSwatch styleValues={view.style} label={view.name} />
      <CommitTextField
        initialValue={view.name}
        validate={(draft) => validateStyleName(draft, view, styleViews)}
        ariaLabel="Style name"
        onCommit={(draft) => {
          const name = toCamelCaseName(draft);
          if (name !== "" && name !== view.name) {
            dispatchTransaction(toStyleNameSetTransaction(view, name));
          }
        }}
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
  const name = toCamelCaseName(draft);
  if (name === "") return [];
  return styles.some((styleView) => styleView.styleId !== view.styleId && styleView.name === name)
    ? [`Style "${name}" already exists.`]
    : [];
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
