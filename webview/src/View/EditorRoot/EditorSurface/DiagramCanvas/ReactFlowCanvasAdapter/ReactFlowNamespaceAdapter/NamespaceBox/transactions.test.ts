/**
 * @behavior Namespace inline-name transaction derivation tests.
 */

import { describe, expect, it } from "vitest";
import { toNamespaceId } from "../../../../../../../shared/ids";
import { toNamespaceNameCommitTransaction } from "./transactions";

describe("toNamespaceNameCommitTransaction", () => {
  it("sets the edited namespace name", () => {
    const namespaceId = toNamespaceId("OldName");
    expect(toNamespaceNameCommitTransaction(namespaceId, "NewName")).toEqual([
      {
        type: "namespace.name.set",
        namespaceId,
        name: "NewName",
      },
    ]);
  });
});
