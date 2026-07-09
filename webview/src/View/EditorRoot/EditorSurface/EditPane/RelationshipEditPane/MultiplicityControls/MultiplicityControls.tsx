/**
 * @behavior Relationship multiplicity preset and custom commit routing.
 * @render Relationship multiplicity controls.
 */

import type { ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useDispatchTransaction } from "../../../../../contexts";
import CommitComboBox from "../../../../../ui/composites/CommitComboBox/CommitComboBox";
import { toRelationshipMultiplicitySetTransaction } from "./transactions";

const multiplicityPresets = ["1", "0..1", "*", "0..*", "1..*"] as const;

type MultiplicityControlsProps = {
  readonly view: RelationshipView;
};

export default function MultiplicityControls({ view }: MultiplicityControlsProps): ReactElement {
  const dispatchTransaction = useDispatchTransaction();

  return (
    <>
      <CommitComboBox
        initialValue={view.sourceMultiplicity ?? ""}
        options={toMultiplicityOptions("Source")}
        validate={() => []}
        ariaLabel="Source multiplicity"
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
      <CommitComboBox
        initialValue={view.targetMultiplicity ?? ""}
        options={toMultiplicityOptions("Target")}
        validate={() => []}
        ariaLabel="Target multiplicity"
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
    </>
  );
}

// Private helpers
function toMultiplicityOptions(label: string): readonly { value: string; label: string }[] {
  return [
    { value: "", label: `${label}: none` },
    ...multiplicityPresets.map((preset) => ({ value: preset, label: `${label}: ${preset}` })),
  ];
}
