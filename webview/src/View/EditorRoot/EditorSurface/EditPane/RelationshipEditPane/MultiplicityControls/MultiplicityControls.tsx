/**
 * @behavior Relationship multiplicity preset and custom commit routing.
 * @render Relationship multiplicity controls.
 */

import type { ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useDispatchTransaction } from "../../../../../contexts";
import CommitComboBox from "../../../../../../ui/chrome/composites/CommitComboBox/CommitComboBox";
import FieldGrid from "../../../../../../ui/chrome/templates/FieldGrid/FieldGrid";
import { toRelationshipMultiplicitySetTransaction } from "./transactions";

const multiplicityPresets = ["1", "0..1", "*", "0..*", "1..*"] as const;

type MultiplicityControlsProps = {
  readonly view: RelationshipView;
};

export default function MultiplicityControls({ view }: MultiplicityControlsProps): ReactElement {
  const dispatchTransaction = useDispatchTransaction();

  return (
    <FieldGrid
      inset
      labelWidth="standard"
      controlWidth="full"
      rows={[
        {
          label: "Source",
          control: (
            <CommitComboBox
              initialValue={view.sourceMultiplicity ?? ""}
              options={toMultiplicityOptions()}
              validate={() => []}
              ariaLabel="Source"
              isLabelVisible={false}
              onCommit={(value) =>
                dispatchTransaction(
                  toRelationshipMultiplicitySetTransaction(
                    view.relationshipId,
                    "source",
                    value.trim() === "" ? null : value.trim()
                  )
                )
              }
              onDiscard={() => undefined}
              onCancel={() => undefined}
            />
          ),
        },
        {
          label: "Target",
          control: (
            <CommitComboBox
              initialValue={view.targetMultiplicity ?? ""}
              options={toMultiplicityOptions()}
              validate={() => []}
              ariaLabel="Target"
              isLabelVisible={false}
              onCommit={(value) =>
                dispatchTransaction(
                  toRelationshipMultiplicitySetTransaction(
                    view.relationshipId,
                    "target",
                    value.trim() === "" ? null : value.trim()
                  )
                )
              }
              onDiscard={() => undefined}
              onCancel={() => undefined}
            />
          ),
        },
      ]}
    />
  );
}

// Private helpers
function toMultiplicityOptions(): readonly { value: string; label: string }[] {
  return [
    { value: "", label: "None" },
    ...multiplicityPresets.map((preset) => ({ value: preset, label: preset })),
  ];
}
