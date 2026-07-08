import { describe, expect, it } from "vitest";
import { readIdentity, spellIdentity } from "./identitySpelling";

describe("identitySpelling", () => {
  it("strips one balanced pair of backticks", () => {
    expect(readIdentity("`Animal Class!`")).toBe("Animal Class!");
    expect(readIdentity("User")).toBe("User");
  });

  it("quotes identities only when plain Mermaid spelling cannot carry them", () => {
    expect(spellIdentity("User_1")).toBe("User_1");
    expect(spellIdentity("Animal Class!")).toBe("`Animal Class!`");
  });
});
