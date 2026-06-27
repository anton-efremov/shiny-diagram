/**
 * @role [P] Presentational
 * @presents Member table sections inside a class box.
 */
import type { ReactElement } from "react";
import type { ClassMemberView, ClassView } from "../../../../../../../views/schema";
import styles from "../ClassBox.module.css";

type MemberTableProps = {
  readonly view: Pick<ClassView, "members">;
  readonly isSelected: boolean;
};

export default function MemberTable({ view, isSelected }: MemberTableProps): ReactElement {
  // @job render:structure
  const fields = view.members.filter((member) => member.kind === "field");
  const methods = view.members.filter((member) => member.kind === "method");
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  return (
    <div className={styles.body}>
      <MemberList members={fields} isSelected={isSelected} />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList members={methods} isSelected={isSelected} />
    </div>
  );
}

function MemberList({
  members,
  isSelected,
}: {
  members: readonly ClassMemberView[];
  isSelected: boolean;
}): ReactElement {
  // @job render:structure
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={member.memberId}
          className={isSelected ? `${styles.memberRow} nodrag` : styles.memberRow}
          title={`${member.prefix ?? ""} ${member.text}`.trim()}
        >
          {member.prefix ? `${member.prefix} ` : ""}
          {member.text}
        </div>
      ))}
    </div>
  );
}
