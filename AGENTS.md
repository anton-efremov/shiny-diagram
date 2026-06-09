# AGENTS.md

# Shiny PoC agent instructions

This repo is a one-day proof-of-concept for **Shiny**, a VS Code extension for source-backed visual editing of Mermaid diagrams.

The product requirements live in:

```txt
docs/poc-spec.md
```

Read that file before proposing or implementing any milestone.

## Working mode

Do not do a big-bang implementation.

Work in small, physically checkable milestones.

For every milestone, follow this cycle:

1. Propose the next smallest useful milestone.
2. Explain exactly what files you will touch.
3. Explain how I can verify it manually.
4. Wait for approval before implementing.
5. Implement only that milestone.
6. Run build/typecheck.
7. Report:

   * what changed;
   * how to run/check it;
   * what remains intentionally unimplemented.

A milestone is too large if it combines unrelated behaviors.

Prefer milestones that can be verified by opening VS Code, running the extension, compiling, or observing one visible behavior.

## Milestone sizing examples

Good milestones:

* VS Code command opens a webview with placeholder text.
* Webview shows two buttons: `Autorender` and `Editor`.
* Clicking buttons changes visible mode label.
* Autorender mode renders hardcoded Mermaid.
* Extension sends active document text to webview.
* Autorender mode renders active `.mmd` source.
* Parser extracts class names from example file.
* Editor mode renders static boxes for parsed classes.
* Spatial annotations control box positions.
* Dragging a box changes in-memory position.
* Dragging a box patches the source annotation.
* Manual source edit marks webview stale.
* Render button refreshes stale view.
* Resizing a box patches `w/h`.

Bad milestones:

* Build the full extension.
* Implement parser, webview, React Flow, and source patching together.
* Refactor architecture before visible behavior works.
* Add generic Mermaid support.
* Add styling/editor features not required by the PoC.

## Implementation priorities

Prioritize:

1. Working vertical slice.
2. Simple code.
3. TypeScript correctness.
4. Manual verifiability.
5. Preserving valid Mermaid syntax.
6. Source file as source of truth.

Avoid:

* overengineering;
* full Mermaid parser;
* generic diagram architecture;
* premature abstraction;
* Docker;
* backend services;
* complex state management;
* features outside `docs/poc-spec.md`.

## Communication style

Be concrete.

Before implementation, say:

```txt
Next milestone:
What I will build:
Files I will touch:
How you will verify:
Out of scope:
```

After implementation, say:

```txt
Implemented:
Build/typecheck result:
Manual verification:
Known limitations:
Suggested next milestone:
```

Do not silently expand scope.
