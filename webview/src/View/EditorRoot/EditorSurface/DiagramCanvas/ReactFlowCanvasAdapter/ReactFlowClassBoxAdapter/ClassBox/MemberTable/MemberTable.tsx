/**
 * @behavior Class members sliced into field and method render groups.
 * @render Member table sections inside a class box.
 */

import type { ReactElement } from "react";
import type { AttributeId, ClassId, MethodId } from "../../../../../../../../shared/ids";
import type { MemberKind } from "../../../../../../../../shared/uml";
import type { EditingState } from "../../../../../../../state/editorStates";
import type { ClassMemberView, ClassView } from "../../../../../../../views/schema";
import MemberEditField from "./MemberEditField/MemberEditField";
import { useInteractions } from "./useInteractions";
import styles from "./MemberTable.module.css";

type MemberTableProps = {
  readonly view: Pick<ClassView, "classId" | "members">;
  readonly isSelected: boolean;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
};

export default function MemberTable({
  view,
  isSelected,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onClassSelect,
}: MemberTableProps): ReactElement {
  // View and State slice props derivation
  const fields = view.members.filter((member) => member.kind === "field");
  const methods = view.members.filter((member) => member.kind === "method");
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  // Event handler props derivation
  const { onMemberCommit, onMemberDelete, onMemberCreate } = useInteractions(
    view.classId,
    onTextBlockEditCancel
  );

  return (
    <div className={isSelected ? `${styles.body} ${styles.isSelected}` : styles.body}>
      <MemberList
        classId={view.classId}
        members={fields}
        memberKind="field"
        isSelected={isSelected}
        editingState={editingState}
        onTextBlockEditStart={onTextBlockEditStart}
        onTextBlockEditCancel={onTextBlockEditCancel}
        onClassSelect={onClassSelect}
        onMemberCommit={onMemberCommit}
        onMemberDelete={onMemberDelete}
        onMemberCreate={onMemberCreate}
      />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList
        classId={view.classId}
        members={methods}
        memberKind="method"
        isSelected={isSelected}
        editingState={editingState}
        onTextBlockEditStart={onTextBlockEditStart}
        onTextBlockEditCancel={onTextBlockEditCancel}
        onClassSelect={onClassSelect}
        onMemberCommit={onMemberCommit}
        onMemberDelete={onMemberDelete}
        onMemberCreate={onMemberCreate}
      />
    </div>
  );
}

// Private helpers
function MemberList({
  classId,
  members,
  memberKind,
  isSelected,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onClassSelect,
  onMemberCommit,
  onMemberDelete,
  onMemberCreate,
}: {
  classId: ClassId;
  members: readonly ClassMemberView[];
  memberKind: MemberKind;
  isSelected: boolean;
  editingState: EditingState;
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void;
  onTextBlockEditCancel: () => void;
  onClassSelect: (classId: ClassId, additive: boolean) => void;
  onMemberCommit: (
    memberKind: MemberKind,
    memberId: AttributeId | MethodId,
    text: string,
    classifier: ClassMemberView["classifier"]
  ) => readonly string[];
  onMemberDelete: (memberKind: MemberKind, memberId: AttributeId | MethodId) => readonly string[];
  onMemberCreate: (
    memberKind: MemberKind,
    text: string,
    classifier: ClassMemberView["classifier"]
  ) => readonly string[];
}): ReactElement {
  const isNewMemberEditing =
    editingState.kind === "newMember" &&
    editingState.classId === classId &&
    editingState.memberKind === memberKind;
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <MemberRow
          key={member.memberId}
          classId={classId}
          member={member}
          isSelected={isSelected}
          editingState={editingState}
          onTextBlockEditStart={onTextBlockEditStart}
          onTextBlockEditCancel={onTextBlockEditCancel}
          onClassSelect={onClassSelect}
          onMemberCommit={onMemberCommit}
          onMemberDelete={onMemberDelete}
        />
      ))}
      {isNewMemberEditing ? (
        <MemberEditField
          initialText=""
          initialClassifier={null}
          onCommit={(text, classifier) =>
            text === ""
              ? (onTextBlockEditCancel(), [])
              : onMemberCreate(memberKind, text, classifier)
          }
          onCancel={onTextBlockEditCancel}
        />
      ) : null}
      {isSelected && !isNewMemberEditing ? (
        <button
          type="button"
          className={styles.addMemberButton}
          onClick={(event) => {
            event.stopPropagation();
            onTextBlockEditStart({ kind: "newMember", classId, memberKind });
          }}
        >
          + {memberKind === "field" ? "attribute" : "method"}
        </button>
      ) : null}
    </div>
  );
}

function MemberRow({
  classId,
  member,
  isSelected,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onClassSelect,
  onMemberCommit,
  onMemberDelete,
}: {
  classId: ClassId;
  member: ClassMemberView;
  isSelected: boolean;
  editingState: EditingState;
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void;
  onTextBlockEditCancel: () => void;
  onClassSelect: (classId: ClassId, additive: boolean) => void;
  onMemberCommit: (
    memberKind: MemberKind,
    memberId: AttributeId | MethodId,
    text: string,
    classifier: ClassMemberView["classifier"]
  ) => readonly string[];
  onMemberDelete: (memberKind: MemberKind, memberId: AttributeId | MethodId) => readonly string[];
}): ReactElement {
  const isEditing =
    editingState.kind === "member" &&
    editingState.memberId === member.memberId &&
    editingState.classId === classId;
  if (isEditing) {
    return (
      <MemberEditField
        initialText={member.text}
        initialClassifier={member.classifier}
        onCommit={(text, classifier) =>
          text === ""
            ? onMemberDelete(member.kind, member.memberId)
            : onMemberCommit(member.kind, member.memberId, text, classifier)
        }
        onCancel={onTextBlockEditCancel}
      />
    );
  }
  return (
    <div
      className={toMemberClassName(member, isSelected)}
      title={member.text}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onTextBlockEditStart({
          kind: "member",
          classId,
          memberKind: member.kind,
          memberId: member.memberId,
        });
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (isSelected) {
          onTextBlockEditStart({
            kind: "member",
            classId,
            memberKind: member.kind,
            memberId: member.memberId,
          });
        } else {
          onClassSelect(classId, false);
        }
      }}
    >
      {member.text}
    </div>
  );
}

function toMemberClassName(member: ClassMemberView, isSelected: boolean): string {
  const classNames = [styles.memberRow];
  if (isSelected) classNames.push("nodrag");
  if (member.classifier === "static") classNames.push(styles.isStatic);
  if (member.classifier === "abstract") classNames.push(styles.isAbstract);
  return classNames.join(" ");
}
