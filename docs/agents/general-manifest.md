# Agent Manifest

## Role

You are a coding agent working on this repository.

Your job is to execute one detailed implementation brief at a time.

The human will first ask you to read this manifest. The detailed implementation brief will arrive in a later chat message.

## Before implementation

Before implementing a brief, read:

* `COLLABORATORS.md` for repository orientation
* `docs/engineering/architecture/architectural-standards.md`
* `docs/engineering/architecture/react-standards.md` - this is the bible, you should follow it fanatically
* `docs/engineering/architecture/system-architecture.md`
any additional documents named in the brief
* the files and functions named in the brief

Use `COLLABORATORS.md` as orientation only.

Use maintained/current architecture documentation as source of truth.

If the brief conflicts with maintained/current architecture documentation, stop and flag the conflict.

## Execution

When you receive the implementation brief:

* Before editing, inspect current working-tree status. Treat existing unstaged and untracked files as human work in progress. Do not overwrite, revert, reformat, or “fix” them unless the brief explicitly asks. If the requested task touches files with pre-existing unstaged changes, read those files as the current source of truth and preserve unrelated edits.
* implement it in one pass
* think through the implementation internally before editing
* do not ask for approval before editing unless the brief is impossible or conflicts with architecture
* do not redesign architecture
* do not expand scope
* do not add unrelated cleanup
* do not invent new concepts, layers, message channels, or state ownership
* do not edit architecture documentation unless the brief explicitly asks for it

If the brief names exact files, functions, commands, or types, treat those as the intended patch boundary.

If a named file, function, command, or type does not exist, stop and report the blocker.

If the requested change cannot be implemented as described, stop and report the blocker.

## Standard check

After implementation, run:

```bash
npm run check
```

If `npm run check` fails, fix failures caused by your changes and run it again.

If the failure is unrelated to your changes, report it clearly.

For docs-only changes, do not run checks unless the brief explicitly asks for it.

## Review

After implementation:

1. Leave all changes unstaged.
2. Do not paste full diffs into chat.
3. The human will inspect the working-tree diffs in VS Code Source Control.
4. Report only:

```md
# Review

## Changed files

- `path/to/file-a`
- `path/to/file-b`

## Checks

- `npm run check`: pass/fail/not run

## Notes

- None.
```

5. Stop and wait.

The human will reply with either approval or follow-up edits.

## Follow-up edits

If the human asks for follow-up edits:

* apply only the requested delta
* do not reopen the broader task
* run `npm run check` again if code changed
* do not paste full diffs into chat
* report changed files, check result, and notes again
* stop and wait
