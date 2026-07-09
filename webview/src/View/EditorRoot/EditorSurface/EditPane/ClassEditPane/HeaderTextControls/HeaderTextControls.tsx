/**
 * @behavior Class header commit adapters.
 * @render Class header text controls.
 */

import type { ReactElement } from "react";
import type { ClassId } from "../../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../../shared/uml";
import type { ClassView } from "../../../../../views/schema";
import CommitClearableTextField from "../../../../../ui/composites/CommitClearableTextField/CommitClearableTextField";
import CommitComboBox from "../../../../../ui/composites/CommitComboBox/CommitComboBox";
import CommitTextField from "../../../../../ui/composites/CommitTextField/CommitTextField";

type HeaderTextControlsProps = {
  readonly view: ClassView;
  readonly onNameCommit: (classId: ClassId, name: string) => readonly string[];
  readonly onAnnotationCommit: (
    classId: ClassId,
    annotation: ClassAnnotation | null
  ) => readonly string[];
  readonly onLabelCommit: (classId: ClassId, label: string | null) => readonly string[];
};

const ANNOTATION_PRESETS = ["interface", "abstract", "service", "enumeration"] as const;

export default function HeaderTextControls({
  view,
  onNameCommit,
  onAnnotationCommit,
  onLabelCommit,
}: HeaderTextControlsProps): ReactElement {
  const label = view.header.label === view.header.name ? "" : view.header.label;

  return (
    <>
      <CommitTextField
        initialValue={view.header.name}
        validate={() => []}
        ariaLabel="Name"
        onCommit={(draft) => onNameCommit(view.classId, draft.trim())}
        onDiscard={() => undefined}
        onCancel={() => undefined}
      />
      <CommitComboBox
        initialValue={view.header.stereotype ?? ""}
        options={[
          { value: "", label: "None" },
          ...ANNOTATION_PRESETS.map((preset) => ({
            value: preset,
            label: preset,
          })),
        ]}
        validate={() => []}
        ariaLabel="Annotation"
        onCommit={(draft) => onAnnotationCommit(view.classId, draft.trim() || null)}
        onDiscard={() => undefined}
        onCancel={() => undefined}
      />
      <CommitClearableTextField
        initialValue={label}
        validate={() => []}
        ariaLabel="Label"
        onCommit={(draft) => onLabelCommit(view.classId, draft.trim() || null)}
        onClear={() => onLabelCommit(view.classId, null)}
        onDiscard={() => undefined}
        onCancel={() => undefined}
      />
    </>
  );
}
