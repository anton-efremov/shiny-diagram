/**
 * @role [P] Presentational
 * @presents Member table sections inside a class box.
 */
import type { ReactElement } from "react";
import type { MemberRowView, MemberTableView } from "./views";
import styles from "../ClassBox.module.css";

type MemberTableProps = {
  readonly view: MemberTableView;
};

export default function MemberTable({ view }: MemberTableProps): ReactElement {
  // @job render:structure
  const hasFieldsAndMethods = view.fields.length > 0 && view.methods.length > 0;

  return (
    <div className={styles.body}>
      <MemberList members={view.fields} isSelected={view.isSelected} />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList members={view.methods} isSelected={view.isSelected} />
    </div>
  );
}

function MemberList({
  members,
  isSelected,
}: {
  members: readonly MemberRowView[];
  isSelected: boolean;
}): ReactElement {
  // @job render:structure
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={member.memberId}
          className={isSelected ? `${styles.memberRow} nodrag` : styles.memberRow}
          title={`${member.prefix} ${member.text}`}
        >
          {member.prefix} {member.text}
        </div>
      ))}
    </div>
  );
}
