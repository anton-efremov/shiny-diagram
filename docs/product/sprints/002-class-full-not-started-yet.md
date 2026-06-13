# Sprint 002 — Full Class Diagram Editor

> **Status: STUB** — captured from architecture discussion, to be completed before sprint starts.

## Goal

Complete the class diagram editor to full Mermaid class diagram spec coverage.

## Parser gaps (missing syntax)

- Old colon member syntax: `ClassName : member` (outside class body)
- Namespaces — stub exists, tokenizer already groups blocks, needs `parseNamespaces` implemented and `DiagramModel` updated with namespace membership
- Notes — `note for ClassName "text"` and `note "text"`
- Backtick-escaped class names — `` `Class Name With Spaces` ``
- Direction — `direction LR/TB` etc.
- `style` keyword — inline per-class style, distinct from `classDef`
- Links — `link ClassName "url"` (likely out of editor scope but should parse)

## UI gaps

- Namespace rendering in React Flow via `parentId`
- ToolPane — currently placeholder, needs actual drag-to-create functionality

## Architecture note — parser longevity

Before scaling beyond class diagrams, do a focused spike:
- Evaluate Mermaid's JISON grammars with `yyloc` location wiring
- Check `@mermaid-js/parser` (Langium rewrite) maturity and whether AST nodes carry source location
- Decision: stay hand-written per diagram type, or re-foundation on Mermaid's own parser

This decision gates whether Sprint 3 is "new diagram type" or "re-foundation first."
