/**
 * @behavior Class member grouping and command routing.
 * @render Member compartments inside a class box.
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { ClassId } from "../../../../../../../../shared/ids";
import type { MemberClassifier } from "../../../../../../../../shared/uml";
import Divider from "../../../../../../../ui/primitives/Divider/Divider";
import EditableList from "../../../../../../../ui/composites/EditableList/EditableList";
import type {
  EditableListRow,
  TextEmphasis,
} from "../../../../../../../ui/composites/EditableList/EditableList";
import type { EditingState } from "../../../../../../../state/editorStates";
import type { ClassMemberView, ClassView } from "../../../../../../../views/schema";
import ValidationPopup from "../../../../../../../ui/primitives/ValidationPopup/ValidationPopup";
import { useInteractions } from "./useInteractions";
import styles from "./MemberTable.module.css";

type MemberTableProps = {
  readonly view: Pick<ClassView, "classId" | "members">;
  readonly isSelected: boolean;
  readonly editingState: EditingState;
  readonly separatorColor: string;
  readonly separatorThickness: string;
  readonly separatorLineStyle: "solid" | "dashed" | "dotted";
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
};

export default function MemberTable({
  view,
  isSelected,
  separatorColor,
  separatorThickness,
  separatorLineStyle,
  onTextBlockEditCancel,
}: MemberTableProps): ReactElement {
  const [discardErrors, setDiscardErrors] = useState<readonly string[]>([]);
  const fields = view.members.filter((member) => member.kind === "field");
  const methods = view.members.filter((member) => member.kind === "method");
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;
  const { onMemberCommit, onMemberDelete, onMemberCreate, onMemberMove } = useInteractions(
    view.classId,
    onTextBlockEditCancel
  );

  return (
    <div className={styles.body}>
      {discardErrors.length > 0 ? (
        <ValidationPopup messages={discardErrors} onDismiss={() => setDiscardErrors([])} />
      ) : null}
      <EditableList
        rows={toRows(fields)}
        addLabel="+ attribute"
        addTitle="Add attribute"
        validate={() => []}
        isEditStartEnabled={isSelected}
        isEmphasisEditable
        onRowCommit={(index, value, emphasis) => {
          const member = fields[index];
          const errors =
            value === ""
              ? onMemberDelete(member.kind, member.memberId)
              : onMemberCommit(member.kind, member.memberId, value, toClassifier(emphasis));
          if (errors.length > 0) setDiscardErrors(errors);
        }}
        onRowAdd={(value, emphasis) => {
          const errors = onMemberCreate("field", value, toClassifier(emphasis));
          if (errors.length > 0) setDiscardErrors(errors);
        }}
        onRowReorder={(from, to) => {
          const member = fields[from];
          if (!member) return;
          onMemberMove("field", fields, member.memberId, to);
        }}
      />
      {hasFieldsAndMethods ? (
        <Divider
          color={separatorColor}
          thickness={separatorThickness}
          lineStyle={separatorLineStyle}
        />
      ) : null}
      <EditableList
        rows={toRows(methods)}
        addLabel="+ method"
        addTitle="Add member"
        validate={() => []}
        isEditStartEnabled={isSelected}
        isEmphasisEditable
        onRowCommit={(index, value, emphasis) => {
          const member = methods[index];
          const errors =
            value === ""
              ? onMemberDelete(member.kind, member.memberId)
              : onMemberCommit(member.kind, member.memberId, value, toClassifier(emphasis));
          if (errors.length > 0) setDiscardErrors(errors);
        }}
        onRowAdd={(value, emphasis) => {
          const errors = onMemberCreate("method", value, toClassifier(emphasis));
          if (errors.length > 0) setDiscardErrors(errors);
        }}
        onRowReorder={(from, to) => {
          const member = methods[from];
          if (!member) return;
          onMemberMove("method", methods, member.memberId, to);
        }}
      />
    </div>
  );
}

function toRows(members: readonly ClassMemberView[]): readonly EditableListRow[] {
  return members.map((member) => ({
    text: member.text,
    emphasis: toEmphasis(member.classifier),
  }));
}

function toEmphasis(classifier: MemberClassifier | null): TextEmphasis | null {
  if (classifier === "static") return "underline";
  if (classifier === "abstract") return "italic";
  return null;
}

function toClassifier(emphasis: TextEmphasis | null): MemberClassifier | null {
  if (emphasis === "underline") return "static";
  if (emphasis === "italic") return "abstract";
  return null;
}
