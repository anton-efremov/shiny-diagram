import type { ReactElement } from "react";
import type { ClassBoxMemberView } from "./views";
import styles from "../ClassBox.module.css";

type MemberTableProps = {
  fields: readonly ClassBoxMemberView[];
  methods: readonly ClassBoxMemberView[];
};

/**
 * Renders class fields and methods inside a class box.
 */
export default function MemberTable({ fields, methods }: MemberTableProps): ReactElement {
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

  return (
    <div className={styles.body}>
      <MemberList members={fields} />
      {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
      <MemberList members={methods} />
    </div>
  );
}

function MemberList({ members }: { members: readonly ClassBoxMemberView[] }): ReactElement {
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={member.memberId}
          className={styles.memberRow}
          title={`${member.prefix} ${member.text}`}
        >
          {member.prefix} {member.text}
        </div>
      ))}
    </div>
  );
}
