/**
 * @behavior Class member grouping, drag reorder lifecycle, and blur-discard popup state.
 * @render Member table sections inside a class box.
 */

import type { ReactElement } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { AttributeId, ClassId, MethodId } from "../../../../../../../../shared/ids";
import type { MemberKind } from "../../../../../../../../shared/uml";
import { MEMBER_DRAG_THRESHOLD } from "../../../../../../../config/editorUiConfig";
import type { EditingState } from "../../../../../../../state/editorStates";
import type { ClassMemberView, ClassView } from "../../../../../../../views/schema";
import ValidationPopup from "../../../../../../../ui/ValidationPopup/ValidationPopup";
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

type MemberDragState = {
  readonly memberKind: MemberKind;
  readonly draggedMemberId: AttributeId | MethodId;
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly isActive: boolean;
  readonly dropGap: number;
};

export default function MemberTable({
  view,
  isSelected,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onClassSelect,
}: MemberTableProps): ReactElement {
  // State creation: local state - member drag lifecycle and blur-discard validation messages
  const [dragState, setDragState] = useState<MemberDragState | null>(null);
  const [discardErrors, setDiscardErrors] = useState<readonly string[]>([]);

  // Keystroke listener registration
  useEffect(() => {
    if (!dragState?.isActive) return undefined;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setDragState(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dragState?.isActive]);

  // View and State slice props derivation
  const fields = view.members.filter((member) => member.kind === "field");
  const methods = view.members.filter((member) => member.kind === "method");
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  // Event handler props derivation
  const { onMemberCommit, onMemberDelete, onMemberCreate, onMemberMove } = useInteractions(
    view.classId,
    onTextBlockEditCancel
  );

  return (
    <div
      className={[
        styles.body,
        isSelected ? styles.isSelected : "",
        dragState?.isActive ? styles.isDraggingMember : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {discardErrors.length > 0 ? (
        <ValidationPopup messages={discardErrors} onDismiss={() => setDiscardErrors([])} />
      ) : null}
      <MemberList
        classId={view.classId}
        members={fields}
        memberKind="field"
        isSelected={isSelected}
        editingState={editingState}
        onTextBlockEditStart={onTextBlockEditStart}
        onTextBlockEditCancel={onTextBlockEditCancel}
        onEditDiscard={(messages) => {
          setDiscardErrors(messages);
          onTextBlockEditCancel();
        }}
        onClassSelect={onClassSelect}
        dragState={dragState}
        setDragState={setDragState}
        onMemberCommit={onMemberCommit}
        onMemberDelete={onMemberDelete}
        onMemberCreate={onMemberCreate}
        onMemberMove={onMemberMove}
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
        onEditDiscard={(messages) => {
          setDiscardErrors(messages);
          onTextBlockEditCancel();
        }}
        onClassSelect={onClassSelect}
        dragState={dragState}
        setDragState={setDragState}
        onMemberCommit={onMemberCommit}
        onMemberDelete={onMemberDelete}
        onMemberCreate={onMemberCreate}
        onMemberMove={onMemberMove}
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
  onEditDiscard,
  onClassSelect,
  dragState,
  setDragState,
  onMemberCommit,
  onMemberDelete,
  onMemberCreate,
  onMemberMove,
}: {
  classId: ClassId;
  members: readonly ClassMemberView[];
  memberKind: MemberKind;
  isSelected: boolean;
  editingState: EditingState;
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void;
  onTextBlockEditCancel: () => void;
  onEditDiscard: (messages: readonly string[]) => void;
  onClassSelect: (classId: ClassId, additive: boolean) => void;
  dragState: MemberDragState | null;
  setDragState: (dragState: MemberDragState | null) => void;
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
  onMemberMove: (
    memberKind: MemberKind,
    members: readonly ClassMemberView[],
    draggedMemberId: AttributeId | MethodId,
    dropGap: number
  ) => void;
}): ReactElement {
  const listRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const isNewMemberEditing =
    editingState.kind === "newMember" &&
    editingState.classId === classId &&
    editingState.memberKind === memberKind;
  const isThisListDragging = dragState?.memberKind === memberKind && dragState.isActive;
  const dropGap = isThisListDragging ? dragState.dropGap : null;
  let remainingIndex = 0;
  return (
    <div ref={listRef} className={styles.memberList}>
      {members.map((member) => {
        const isDragged = dragState?.draggedMemberId === member.memberId;
        const indicator =
          dropGap === remainingIndex && !isDragged ? (
            <DropIndicator key={`${member.memberId}:drop-before`} />
          ) : null;
        if (!isDragged) remainingIndex++;
        return (
          <Fragment key={member.memberId}>
            {indicator}
            <MemberRow
              classId={classId}
              members={members}
              member={member}
              isSelected={isSelected}
              editingState={editingState}
              onTextBlockEditStart={onTextBlockEditStart}
              onTextBlockEditCancel={onTextBlockEditCancel}
              onEditDiscard={onEditDiscard}
              onClassSelect={onClassSelect}
              dragState={dragState}
              setDragState={setDragState}
              listRef={listRef}
              suppressClickRef={suppressClickRef}
              onMemberCommit={onMemberCommit}
              onMemberDelete={onMemberDelete}
              onMemberMove={onMemberMove}
            />
          </Fragment>
        );
      })}
      {dropGap === remainingIndex ? <DropIndicator /> : null}
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
          onEditDiscard={(messages) => {
            onEditDiscard(messages);
          }}
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
  members,
  member,
  isSelected,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onEditDiscard,
  onClassSelect,
  dragState,
  setDragState,
  listRef,
  suppressClickRef,
  onMemberCommit,
  onMemberDelete,
  onMemberMove,
}: {
  classId: ClassId;
  members: readonly ClassMemberView[];
  member: ClassMemberView;
  isSelected: boolean;
  editingState: EditingState;
  onTextBlockEditStart: (editingState: Exclude<EditingState, { readonly kind: "none" }>) => void;
  onTextBlockEditCancel: () => void;
  onEditDiscard: (messages: readonly string[]) => void;
  onClassSelect: (classId: ClassId, additive: boolean) => void;
  dragState: MemberDragState | null;
  setDragState: (dragState: MemberDragState | null) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  suppressClickRef: React.MutableRefObject<boolean>;
  onMemberCommit: (
    memberKind: MemberKind,
    memberId: AttributeId | MethodId,
    text: string,
    classifier: ClassMemberView["classifier"]
  ) => readonly string[];
  onMemberDelete: (memberKind: MemberKind, memberId: AttributeId | MethodId) => readonly string[];
  onMemberMove: (
    memberKind: MemberKind,
    members: readonly ClassMemberView[],
    draggedMemberId: AttributeId | MethodId,
    dropGap: number
  ) => void;
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
        onEditDiscard={onEditDiscard}
      />
    );
  }
  return (
    <div
      className={toMemberClassName(member, isSelected)}
      title={member.text}
      data-member-row="true"
      data-member-id={member.memberId}
      onPointerDown={(event) => {
        if (!isSelected || editingState.kind !== "none") return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragState({
          memberKind: member.kind,
          draggedMemberId: member.memberId,
          pointerId: event.pointerId,
          originX: event.clientX,
          originY: event.clientY,
          isActive: false,
          dropGap: 0,
        });
      }}
      onPointerMove={(event) => {
        if (
          dragState?.pointerId !== event.pointerId ||
          dragState.draggedMemberId !== member.memberId
        ) {
          return;
        }
        const distance = Math.hypot(
          event.clientX - dragState.originX,
          event.clientY - dragState.originY
        );
        if (!dragState.isActive && distance < MEMBER_DRAG_THRESHOLD) return;
        event.preventDefault();
        event.stopPropagation();
        setDragState({
          ...dragState,
          isActive: true,
          dropGap: toDropGap(listRef.current, member.memberId, event.clientY),
        });
      }}
      onPointerUp={(event) => {
        if (
          dragState?.pointerId !== event.pointerId ||
          dragState.draggedMemberId !== member.memberId
        ) {
          return;
        }
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (dragState.isActive) {
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = true;
          if (isInsideList(listRef.current, event.clientX, event.clientY)) {
            onMemberMove(member.kind, members, member.memberId, dragState.dropGap);
          }
        }
        setDragState(null);
      }}
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
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
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

function DropIndicator(): ReactElement {
  return <div className={styles.dropIndicator} aria-hidden="true" />;
}

function toDropGap(
  listElement: HTMLDivElement | null,
  draggedMemberId: AttributeId | MethodId,
  pointerY: number
): number {
  if (!listElement) return 0;
  const rows = [...listElement.querySelectorAll<HTMLElement>("[data-member-row='true']")].filter(
    (row) => row.dataset.memberId !== String(draggedMemberId)
  );

  let gap = 0;
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    if (pointerY < rect.top + rect.height / 2) return gap;
    gap++;
  }
  return gap;
}

function isInsideList(
  listElement: HTMLDivElement | null,
  pointerX: number,
  pointerY: number
): boolean {
  if (!listElement) return false;
  const rect = listElement.getBoundingClientRect();
  return (
    pointerX >= rect.left &&
    pointerX <= rect.right &&
    pointerY >= rect.top &&
    pointerY <= rect.bottom
  );
}

function toMemberClassName(member: ClassMemberView, isSelected: boolean): string {
  const classNames = [styles.memberRow];
  if (isSelected) classNames.push("nodrag");
  if (member.classifier === "static") classNames.push(styles.isStatic);
  if (member.classifier === "abstract") classNames.push(styles.isAbstract);
  return classNames.join(" ");
}
