/**
 * @behavior Class style summary scenario and save-style prompt.
 * @render Selected class style summary.
 */

import { useState, type ReactElement } from "react";
import type { StyleDefId } from "../../../../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../../../../shared/style";
import type { ClassView, StyleView } from "../../../../../views/schema";
import Button from "../../../../../ui/primitives/Button/Button";
import CommitTextField from "../../../../../ui/composites/CommitTextField/CommitTextField";
import StyledBoxSwatch from "../../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import { useDispatchTransaction } from "../../../../../contexts";
import { toStyleSaveTransaction } from "./transactions";

type StyleSummaryProps = {
  readonly view: readonly ClassView[];
  readonly styles: readonly StyleView[];
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
};

type SummaryScenario =
  | {
      readonly kind: "named";
      readonly label: string;
      readonly detail?: string;
      readonly styleDefId?: StyleDefId;
      readonly style?: ClassView["style"];
    }
  | {
      readonly kind: "direct";
      readonly label: string;
      readonly style: NonNullable<ClassView["style"]>;
    }
  | {
      readonly kind: "mixed";
      readonly label: string;
      readonly detail: string;
      readonly style?: ClassView["style"];
    };

type SaveStyleScenario =
  | {
      readonly kind: "direct";
      readonly style: StyleProperties;
    }
  | {
      readonly kind: "disabled";
    };

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

export default function StyleSummary({
  view,
  styles: styleViews,
  onStyleSelect,
}: StyleSummaryProps): ReactElement {
  // State creation: local state - style save prompt lifecycle and entered style name
  const [promptState, setPromptState] = useState(false);
  const dispatchTransaction = useDispatchTransaction();

  // UI props derivation
  const scenario = toSummaryScenario(view, styleViews);
  const saveStyleScenario = toSaveStyleScenario(scenario);
  return (
    <>
      <StyledBoxSwatch
        styleValues={scenario.style ?? EMPTY_STYLE_PROPERTIES}
        label={
          "detail" in scenario && scenario.detail
            ? `${scenario.label}: ${scenario.detail}`
            : scenario.label
        }
      />
      {scenario.kind === "named" ? (
        <Button
          label={`Edit style ${scenario.label}`}
          disabled={!scenario.styleDefId}
          onClick={() => scenario.styleDefId && onStyleSelect(scenario.styleDefId)}
        />
      ) : (
        <Button
          label="Save style"
          disabled={scenario.kind !== "direct"}
          onClick={() => setPromptState(true)}
        />
      )}
      {promptState && scenario.kind === "direct" ? (
        <CommitTextField
          initialValue=""
          validate={(draft) => validateStyleName(draft, styleViews)}
          ariaLabel="Enter style name"
          onCommit={(draft) => {
            if (saveStyleScenario.kind !== "direct") return;
            const name = toCamelCaseName(draft);
            if (name === "") return;
            dispatchTransaction(toStyleSaveTransaction(view, name, saveStyleScenario.style));
            setPromptState(false);
          }}
          onDiscard={() => undefined}
          onCancel={() => setPromptState(false)}
        />
      ) : null}
    </>
  );
}

// Private helpers
function toSummaryScenario(
  classes: readonly ClassView[],
  styles: readonly StyleView[]
): SummaryScenario {
  const first = classes[0];
  const sameApplied = classes.every(
    (classView) => classView.appliedStyleId === first.appliedStyleId
  );
  const sameStyle = classes.every((classView) => areStylesEqual(classView.style, first.style));
  if (sameApplied && sameStyle) {
    if (first.appliedStyleId) {
      return {
        kind: "named",
        label: toStyleName(first.appliedStyleId, styles),
        styleDefId: first.appliedStyleId,
        style: first.style,
      };
    }
    if (hasStyleValue(first.style)) {
      return { kind: "direct", label: "Custom style", style: first.style };
    }
    return { kind: "named", label: "No style", style: first.style };
  }

  return {
    kind: "mixed",
    label: "Multiple styles",
    detail: toMixedDetail(classes, styles),
    style: sameStyle ? first.style : undefined,
  };
}

function toSaveStyleScenario(scenario: SummaryScenario): SaveStyleScenario {
  return scenario.kind === "direct"
    ? { kind: "direct", style: scenario.style }
    : { kind: "disabled" };
}

function toMixedDetail(classes: readonly ClassView[], styles: readonly StyleView[]): string {
  const names = [
    ...new Set(
      classes.flatMap((classView) =>
        classView.appliedStyleId ? [toStyleName(classView.appliedStyleId, styles)] : []
      )
    ),
  ];
  const hasCustom = classes.some(
    (classView) => !classView.appliedStyleId && hasStyleValue(classView.style)
  );
  return [...names, ...(hasCustom ? ["Custom style(s)"] : [])].join(", ");
}

function hasStyleValue(style: StyleProperties | undefined): style is StyleProperties {
  return style !== undefined && STYLE_PROPERTIES.some(({ name }) => style[name] !== null);
}

function areStylesEqual(
  left: StyleProperties | undefined,
  right: StyleProperties | undefined
): boolean {
  return STYLE_PROPERTIES.every(
    ({ name }) => (left ?? EMPTY_STYLE_PROPERTIES)[name] === (right ?? EMPTY_STYLE_PROPERTIES)[name]
  );
}

function toStyleName(styleId: string | undefined, styles: readonly StyleView[]): string {
  if (styleId === undefined) return "No style";
  return styles.find((styleView) => styleView.styleId === styleId)?.name ?? styleId;
}

function validateStyleName(draftName: string, styles: readonly StyleView[]): readonly string[] {
  const normalizedName = toCamelCaseName(draftName);
  if (normalizedName === "") return ["Enter a style name."];
  return styles.some((styleView) => styleView.name === normalizedName)
    ? [`Style "${normalizedName}" already exists.`]
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
