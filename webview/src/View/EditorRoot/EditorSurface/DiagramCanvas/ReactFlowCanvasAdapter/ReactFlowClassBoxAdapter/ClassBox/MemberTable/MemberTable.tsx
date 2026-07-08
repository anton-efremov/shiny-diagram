/**
 * @behavior Class members sliced into field and method render groups.
 * @render Member table sections inside a class box.
 */

import type { ReactElement } from "react";
import type { ClassMemberView, ClassView } from "../../../../../../../views/schema";
import styles from "./MemberTable.module.css";

type MemberTableProps = {
  readonly view: Pick<ClassView, "members">;
  readonly isSelected: boolean;
};

export default function MemberTable({ view, isSelected }: MemberTableProps): ReactElement {
  // View and State slice props derivation
  const fields = view.members.filter((member) => member.kind === "field");
  const methods = view.members.filter((member) => member.kind === "method");
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  return (
    <div className={isSelected ? `${styles.body} ${styles.isSelected}` : styles.body}>
      <MemberList members={fields} isSelected={isSelected} />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList members={methods} isSelected={isSelected} />
    </div>
  );
}

// Private helpers
function MemberList({
  members,
  isSelected,
}: {
  members: readonly ClassMemberView[];
  isSelected: boolean;
}): ReactElement {
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={member.memberId}
          className={toMemberClassName(member, isSelected)}
          title={member.text}
        >
          {member.text}
        </div>
      ))}
    </div>
  );
}

function toMemberClassName(member: ClassMemberView, isSelected: boolean): string {
  const classNames = [styles.memberRow];
  if (isSelected) classNames.push("nodrag");
  if (member.isStatic) classNames.push(styles.isStatic);
  if (member.isAbstract) classNames.push(styles.isAbstract);
  return classNames.join(" ");
}
