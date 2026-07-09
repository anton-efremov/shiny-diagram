/**
 * @behavior Class style summary scenario and save-style prompt.
 * @render Selected class style summary.
 */

import { useState, type ReactElement } from "react";
import type { StyleDefId } from "../../../../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../../../../shared/style";
import type { ClassView, StyleView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./StyleSummary.module.css";

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
  const [draftNameState, setDraftNameState] = useState("");
  const [promptState, setPromptState] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState | null>(null);

  // UI props derivation
  const scenario = toSummaryScenario(view, styleViews);
  const saveStyleScenario = toSaveStyleScenario(scenario);
  const canSubmit = toCanSubmit(draftNameState);

  // Event handler props derivation
  const { onPromptOpen, onDraftNameChange, onSubmit } = useInteractions({
    view,
    scenario: saveStyleScenario,
    styles: styleViews,
    draftNameState,
    setDraftNameState,
    setPromptState,
    setNotificationState,
  });

  return (
    <section className={styles.summary} aria-label="Style summary">
      <div className={styles.header}>
        <span className={styles.swatch} style={toSwatchStyle(scenario)} />
        <div className={styles.titleBlock}>
          <span className={styles.title}>{scenario.label}</span>
          {"detail" in scenario && scenario.detail ? (
            <span className={styles.detail}>{scenario.detail}</span>
          ) : null}
        </div>
      </div>
      {scenario.kind === "named" ? (
        <button
          type="button"
          className={styles.action}
          disabled={!scenario.styleDefId}
          onClick={() => scenario.styleDefId && onStyleSelect(scenario.styleDefId)}
        >
          Edit style {scenario.label}
        </button>
      ) : (
        <button
          type="button"
          className={styles.action}
          disabled={scenario.kind !== "direct"}
          onClick={onPromptOpen}
        >
          Save style
        </button>
      )}
      {promptState && scenario.kind === "direct" ? (
        <form className={styles.prompt} onSubmit={onSubmit}>
          <input
            value={draftNameState}
            aria-label="Enter style name"
            placeholder="Enter style name"
            onChange={(event) => onDraftNameChange(event.currentTarget.value)}
          />
          <button type="submit" disabled={!canSubmit}>
            Save
          </button>
          {notificationState ? (
            <p key={notificationState.key} className={styles.notification} role="status">
              {notificationState.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
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

function toCanSubmit(draftName: string): boolean {
  return toCamelCaseName(draftName) !== "";
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

function toSwatchStyle(scenario: SummaryScenario): {
  readonly background?: string;
  readonly borderColor?: string;
  readonly color?: string;
} {
  return {
    background: scenario.style?.fill ?? undefined,
    borderColor: scenario.style?.stroke ?? undefined,
    color: scenario.style?.color ?? undefined,
  };
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
