# Refactor brief — migrate the Shiny webview to the Sprint 2 architecture

## Objective

Restructure the existing PoC webview into the Sprint 2 architecture **without changing any observable behavior**. This is a behavior-preserving migration that introduces the read pipeline (Parser → Derivator → Editor UI) and the write pipeline (Interaction Controllers → Command Handlers → Source Writer), reorganizing existing PoC logic into those slots.

This is restructuring, not feature work. No new product behavior. No features from the feature map.

## Inputs (read in this order)

- `specification.md` — product behavior. **This is the behavior oracle**: anything it describes that works today must work identically after.
- `feature-map.md` — exact element + event + state behaviors, and the MVP scope decisions.
- `sprint2-architecture.md` — the target component contracts: each component's role, APIs, types, `Passes`/`Receives`/`Returns`, read rules, write rules, and invariants. **The authoritative architecture spec.**
- `logical-dataflow-view.md` — the mental model: the read/write loop, the five core artifacts and their shapes, what each carries.
- `target-structure.md` — the target `src/` tree and the logical-box → code mapping.

Where these conflict, `specification.md` defines behavior and `sprint2-architecture.md` defines structure.

## First step

Inventory the current PoC `src/` and map each existing piece of behavior to its target home in `target-structure.md` before moving anything. Produce that mapping; do not start moving files until current → target is explicit.

## Hard invariants (must hold at every commit)

- `Editor UI` never writes source and never derives geometry or decides product behavior. It renders what it receives and owns local interaction state only.
- `Interaction Controllers` never format Mermaid. They translate component events into named `EditorCommand`s and dispatch; they emit `SelectionChange` on the selection channel.
- `Command Handlers` are pure: no React, no DOM, no VS Code API, no side effects. `(command, CommandContext) → CommandResult`.
- `Source Writer` only builds Mermaid/Shiny strings and `SourceEdit` values, only when called by Command Handlers. It never decides product behavior.
- `App` is the only code that crosses the host boundary.
- `Parser` owns source interpretation; `Derivator` owns derived render facts; `Editor Coordinator` wires the flow and owns read + selection/tool state but implements no product command behavior.
- `SelectionChange` does not enter the command pipeline.
- Read gating: `invalidSyntax` → do not call Derivator; `missingAnnotations` → model exists, Derivator may run for diagnostics/Generate but canvas rendering is blocked; `ready` → derive and render.
- The entire `domain/classDiagram/` layer (`model`, `parse`, `derive`, `commands`, `source`) is framework-free — no React, DOM, or VS Code imports.
- Source-first: the `.mmd` file stays the durable artifact; edits are applied through the host as undoable text edits; Mermaid compatibility is preserved (Shiny annotations remain comments).

## Migration approach

Incremental, behavior-preserving slices. Keep the example working at every commit; do not big-bang.

Suggested order:

1. **Domain core types** — `model/` (`DiagramTree`), `model/diagnostics.ts`. Foundation, no behavior change.
2. **Read pipeline** — consolidate existing parse/render logic into `Parser` (`sourceText → ParseResult`), `Derivator` (`DiagramTree → ElementViews`), and `Editor UI` rendering `ElementViews`. Rendering already works today; this reshapes it into the three boxes. Verify the example renders identically.
3. **Write foundation** — `source/` (`SourceEdit` types + Source Writer), `commands/` (`EditorCommand`, `CommandContext`, `CommandResult`).
4. **Write behaviors, one at a time** — for each behavior that works in the PoC today (start with move-a-class), route it through its Interaction Controller → Command Handler → Source Writer → App. After each, confirm the example produces the same source result as before.
5. **Coordinator + App wiring** — finalize both pipelines through `Editor Coordinator`; confirm the App host-message protocol (`sourceUpdate` in, `applyEdits` out).

## Deferred decisions — do not redesign

The `EditorCommand` union in `logical-dataflow-view.md` / `sprint2-architecture.md` is the **target vocabulary**, not a finished contract. Known-open items:

- no add/create member command variant yet,
- `class.move` carries no resulting-namespace field (spec defines geometric namespace membership by containment drag),
- `namespace.move` membership behavior under the containment rule.

For these: implement to **preserve current behavior**, using the spec'd commands as the vocabulary. Where a working behavior needs a command shape not yet in the union, add the minimal variant needed to preserve behavior and **flag it** in your output — do not invent new product semantics or change how a behavior works.

## Definition of done

- Every behavior that works in the example today works identically.
- Code is organized exactly per `target-structure.md`.
- Every hard invariant above holds.
- `domain/classDiagram/` has zero React / DOM / VS Code imports.
- A list of any command-shape gaps you had to fill or flag.

## Out of scope

- New features or any feature-map behavior not already working in the PoC.
- Changing product behavior, command semantics, or the annotation syntax.
- Breaking Mermaid compatibility.
