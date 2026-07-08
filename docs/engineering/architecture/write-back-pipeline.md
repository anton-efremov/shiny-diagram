# Write-Back Pipeline (translate → resolve)

> **Implementation state:** Current
> **Document state:** Current
> **Last reviewed:** 2026-07-04
> **Scope:** How a semantic `EditorCommand` becomes a `SourceEdit[]` transaction — the model it reads, the intent vocabulary between the two layers, and each layer's responsibilities.

This document replaces the stale command model in `system-architecture.md` §7.1 and §7.4 (`DiagramTree` / `applyCommand` / per-command handlers), which describe a superseded architecture. See the staleness report for the remaining drift in that document.

## 1. Pipeline shape

A single semantic dispatch runs on one frozen parse snapshot:

```
parseDiagram(sourceText)
  → { graph: DiagramGraph, provenance: ProvenanceIndex }

translateCommands(transaction, graph, provenance[, sourceText])
  → WriteIntent[]        // logical operations in the reference domain

resolveIntents(intents, provenance, sourceText)
  → SourceEdit[]         // concrete range replacements
```

Invariants:

- **Single snapshot.** Every intent is translated and resolved against the same pre-edit `graph`/`provenance`. Intents never see each other's output; a whole-statement rewrite is `delete` + `insert` resolved atomically, not a mutate-then-reparse.
- **Ordered, not order-independent.** Intents are a sequence, not a set: co-located insertions are concatenated in intent order during resolution (see §5).
- **Layer boundary.** Translate owns Mermaid *content* — it produces `payload` text that is normalized to relative indentation, `\n`-joined, no EOL. Resolve owns *presentation* — coordinates, absolute indentation, EOL, and entry separators. `sourceText` is passed to translate only for workers that copy existing source (currently only class-duplicate); workers that allocate source identities additionally receive a transaction-scoped allocator (`TranslateContext`) that exposes only this transaction's claim bookkeeping and never graph state modified by earlier commands; all other workers operate purely on `graph` + `provenance`.

## 2. Model the pipeline reads

Two derived structures from parse, plus the source-coordinate primitives.

**`DiagramGraph`** (`Controller/model/diagramGraph.ts`) — the *semantic* structure. Answers "what exists and how it relates": classes (with typed members, visibility, static/abstract, optional spatial data, `parentNamespaceId`), namespaces, relationships, notes, style definitions, and style-application edges. It carries no source positions.

**`ProvenanceIndex`** (`Controller/model/provenanceIndex.ts`) — the *syntactic* structure. Answers "where is each written statement, and does it exist explicitly": per-kind maps from id to a record of `SourceSpan`s (`self`, `header`, `body`, `fields`). A missing record means the entity is implicit (e.g. a class that appears only in a relationship) and is therefore not anchorable. Members are split by source form into two maps — `blockMembers` (`+name` inside a class block) and `shortMembers` (`User : +name`, a top-level line) — so a member's form is structural, not a discriminant field.

**Source-coordinate primitives** (`Controller/model/sourceEdit.ts`):

```ts
type SourcePosition = { line: number; character: number };
type SourceSpan     = { start: SourcePosition; end: SourcePosition };
type SourceEdit     = { start: SourcePosition; end: SourcePosition; replacementText: string };
```

`SourceSpan` (formerly `SourceLocation`) is a span expressed through `SourcePosition`; it carries no cached `raw` text — substrings are sliced from `sourceText` when needed.

## 3. The intent vocabulary (`Controller/translate/writeIntent.ts`)

`WriteIntent` is the contract between the two layers. It is organized by the grammar unit each operation touches:

| Grammar unit | Meaning | Operations |
|---|---|---|
| **statement** | a self-contained line or block (class, namespace, member, relationship, style line, identity-bound spatial annotation, note, statement-bound note annotation) | `insertStatement`, `deleteStatement` |
| **entry** | a `key:value` pair inside a list (a style property) | `insertEntry`, `deleteEntry` |
| **value** | a single overwrite-able span (a name, endpoint, coordinate, property value) | `replaceValue` |

Rule: standalone units (statement, entry) can be inserted or deleted; a value can only be replaced — it cannot exist without its key nor be removed without removing its entry. There is **no** `replaceStatement`.

Pairing invariant: a statement-bound annotation (`@note:`) binds to the statement on the immediately following line and is written, moved, and deleted **as a pair** with it — translate emits both statement operations in the same transaction, and no operation may separate the pair.

The five intents:

```ts
InsertStatementIntent = { kind: "insertStatement"; payload: string; anchor: StatementAnchor };
DeleteStatementIntent = { kind: "deleteStatement"; target: StatementRef };
InsertEntryIntent     = { kind: "insertEntry";     payload: string; anchor: EntryAnchor };
DeleteEntryIntent     = { kind: "deleteEntry";     target: EntryRef };
ReplaceValueIntent    = { kind: "replaceValue";    payload: string; target: ValueRef };
```

**References** name parsed provenance areas in the logical domain (no coordinates):

- `StatementRef` — a whole statement (delete target / anchor sibling), e.g. `{ kind: "class", classId }`, `{ kind: "blockMember", memberId }`.
- `EntryRef` — a style property, e.g. `{ kind: "directStyleProperty", classId, property }`.
- `ValueRef` — an overwrite-able span, e.g. `{ kind: "className", classId }`, `{ kind: "spatialCoord", target, coord }`.
- `BlockRef` — a container whose opening a first child inserts under: `diagram` | `class` | `namespace`.
- `StyleListRef` — a property list a first entry inserts into: `directStyle` | `styleDef`.

**Anchors** name where a new unit lands — always *after a point*:

```ts
StatementAnchor =
  | { kind: "afterSameKind";      statement: StatementRef }  // sibling, same kind → no blank line
  | { kind: "afterDifferentKind"; statement: StatementRef }  // sibling, other kind → blank line before
  | { kind: "atBlockOpening";     block: BlockRef };         // first child of a block

EntryAnchor =
  | { kind: "afterEntry";        entry: EntryRef }
  | { kind: "afterListOpening";  list: StyleListRef };
```

The same/different-kind distinction is a translate-time fact that drives resolve's blank-line policy — it lets resolve decide spacing without re-inspecting the payload.

## 4. Translate (`Controller/translate/`)

`translateCommands` (dispatcher) fans each `EditorCommand` out to a per-command worker in `workers/`:

- `translateClassCreate`, `translateClassDuplicate`, `translateClassDelete`, `translateClassSpatialSet`, `translateClassDirectStylePropertySet`.

Workers emit intents by:

- **Composing content** — bare Mermaid syntax via `syntax/` composers (`spatialSyntax`, `styleSyntax`) and inline builders, normalized to relative indentation. Class-duplicate additionally slices the source block from `sourceText` and splices the new name at the `declaredName` span — a source copy, not a graph re-render, so all member fields and formatting are preserved.
- **Choosing anchors** via thin providers in `anchors/statementAnchors.ts` and `anchors/entryAnchors.ts`, composed by the worker with `??` fallback:
  - **Builders** locate a statement and return a raw `StatementRef | null`: `anchorAfterKindList(graph, provenance, scope, kinds)` (latest of a union of kinds in a scope), `anchorExactStatement` (a specific ref if it has a record).
  - **Labelers** tag a located ref with the blank-line policy: `asSameKind`, `asDifferentKind` (pass `null` through so they chain).
  - **Terminal** `anchorBlockOpening(scope)` returns `atBlockOpening`, never null.
  - Membership ("which block is a statement written in") is a pure function of the graph: classes/namespaces nest by `parentNamespaceId`, block-members live in their class, everything else is diagram-level (a Mermaid namespace body accepts only class declarations).

## 5. Resolve (`Controller/resolve/`)

`resolveIntents` (orchestrator) is a three-stage pipeline:

1. **Materialize** — each intent dispatched to its per-kind worker in `workers/` (`insertStatement`, `deleteStatement`, `insertEntry`, `deleteEntry`, `replaceValue`), producing one `SourceEdit`.
2. **Coalesce** — insertions sharing an exact position are concatenated in intent order (`coalesceInsertions`). This is required because the sink (`vscode.WorkspaceEdit`) applies the whole batch atomically against original coordinates; two zero-width edits at one offset would be an overlap. Concatenation makes their order deterministic (e.g. first-class-in-empty-diagram: declaration then spatial annotation).
3. **Assert** — the result is proven pairwise non-overlapping (`assertNoOverlaps`) before returning.

Workers delegate to helpers in `workers/helpers/`:

- **`resolveRefs.ts`** — resolves the `*Ref` family to a `SourceSpan` via provenance (`requireRecord(map.get(id)).span`); a missing record is a translate/provenance contract breach and throws.
- **`resolveAnchors.ts`** — resolves the `*Anchor` family to a concrete insertion *point*: position (folding the start/end choice in), the block indent, and `blankBefore` for statements; the separator for entries. Workers receive a ready insertion point and never re-inspect the anchor.
- **`textUtils.ts`** — string/position mechanics: line reads, indentation, EOL detection, position conversion, span slicing.

`resolveInsertStatement` prefixes each non-empty payload line with the anchor's absolute `indent` (the payload arrives relative), leads with EOL, and adds one extra EOL when `blankBefore`. `resolveDeleteStatement` removes the whole line/block and its trailing EOL; `resolveDeleteEntry` absorbs an adjacent separator comma; `resolveReplaceValue` overwrites the target span in place.

## 6. Worked example

Duplicating the first class in

```
classDiagram
    class ConversationThread {
        +UUID id
        +addMessage(TextMessage message) void
    }
```

- **Translate** emits an `insertStatement` whose `payload` is the source block sliced from `sourceText` with `ConversationThread` → `ConversationThread_1` (members verbatim, normalized to relative indent), anchored `afterSameKind` on the source class; plus a spatial-annotation `insertStatement` and, if present, a style `insertStatement`.
- **Resolve** re-indents the payload to the anchor base, leads with EOL, and (since the anchor is a same-kind sibling) adds no blank line. The result is a `ConversationThread_1` block byte-identical to the source except the name — visibility markers, `~TextMessage~`, and `void` all preserved.
