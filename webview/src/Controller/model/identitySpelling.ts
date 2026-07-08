/**
 * @fileoverview Mermaid identity spelling helpers.
 *
 * Mermaid class grammar accepts backtick strings (`BQUOTE_STR` in the generated
 * lexer) in class-name positions. Controller identity stores the unquoted name;
 * source composition adds backticks only when plain `\w+` spelling cannot carry
 * the identity.
 */

export const IDENTITY_PATTERN = String.raw`(?:\`[^\`]+\`|\w+(?:\.\w+)*)`;
export const PLAIN_IDENTITY_PATTERN = /^\w+$/;

export function readIdentity(spelled: string): string {
  if (spelled.length >= 2 && spelled.startsWith("`") && spelled.endsWith("`")) {
    return spelled.slice(1, -1);
  }
  return spelled;
}

export function spellIdentity(identity: string): string {
  return PLAIN_IDENTITY_PATTERN.test(identity) ? identity : `\`${identity}\``;
}
