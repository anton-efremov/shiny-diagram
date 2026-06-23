/**
 * @role [P] Presentational
 * @presents Member table sections inside a class-box node.
 */
import type { ReactElement } from "react";
import type { ClassBoxMemberView } from "./views";
import styles from "../ClassBox.module.css";

type MemberTableProps = {
  fields: readonly ClassBoxMemberView[];
  methods: readonly ClassBoxMemberView[];
  selected: boolean;
};

/**
 * Renders class fields and methods inside a class box.
 */
export default function MemberTable({ fields, methods, selected }: MemberTableProps): ReactElement {
  // @job render:ui
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  // @job render:layout
  return (
    <div className={styles.body}>
      <MemberList members={fields} selected={selected} />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList members={methods} selected={selected} />
    </div>
  );
}

function MemberList({
  members,
  selected,
}: {
  members: readonly ClassBoxMemberView[];
  selected: boolean;
}): ReactElement {
  // @job render:ui
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={member.memberId}
          className={selected ? `${styles.memberRow} nodrag` : styles.memberRow}
          title={`${member.prefix} ${member.text}`}
        >
          {member.prefix} {member.text}
        </div>
      ))}
    </div>
  );
}
