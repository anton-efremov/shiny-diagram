# Write-back catalog implementation decision log

## Confirmed decisions

- Superseded the original statement-family placement rule with mechanical command-prefix placement. `translateClassAppliedStyleSet.ts`, `translateClassDirectStyleSet.ts`, and `translateClassDirectStylePropertySet.ts` therefore live in `workers/Class/`; `workers/Style/` contains only `translateStyleDefinition.ts`.
- Superseded the original decision to keep `translateParentNamespaceSet.ts` intact. The class and namespace commands now have one worker file each, while their shared delete/reinsert and ancestor-exclusion core lives in `placement/parentNamespacePlacement.ts` and is not exported from either worker.
- Kept namespace rename-cascade bookkeeping and namespace-style target replacement in `translateNamespaceParentNamespaceSet.ts`; they are command-specific behavior, not shared placement behavior.
- Kept `anchors/`, `syntax/`, `placement/`, and all other translate-layer directories in place.
- Parsed dispatcher imports by local binding and retained the exported binding separately. This resolves the aliased `translateClassFullDirectStyleSet` dispatcher call to the exported `translateClassDirectStyleSet` annotation.
- Counted and ordered catalog entries from dispatcher cases. Repeated labels for the same command would share the first entry rather than increasing coverage.
- Made missing annotations warnings behind `WRITEBACK_ANNOTATION_PRESENCE_IS_VIOLATION`; valid annotations still require a §7.2 header and invalid headers are violations.
- Emit `WRITEBACK-CATALOG.md` without Markdown reformatting and exclude that generated artifact from Prettier. Formatting the complete document changed annotation list indentation, conflicting with the catalog requirement to preserve annotation line structure.
- Corrected annotation extraction for multi-command files to select the last TSDoc block immediately adjacent to each exported translator. The previous non-greedy expression could begin at a file-level block, span intervening code, and then reject a valid function annotation as `@fileoverview` content.

## Observations

- The only documentation path into `translate/workers/` was the canonical-example line in `write-back-pipeline.md`; its affected links were updated after both placement passes. No other documentation links required changes.
- No documentation content was found to be made stale by the family-folder split.
- Unrelated workspace edits, including `examples/thread.mmd` and concurrently changed React Flow UI files, were left untouched. `UI-CATALOG.md` was regenerated because the registry-wide plane check found that existing generated plane stale against those UI sources.

## Annotation backfill findings

- **Resolved — `class.annotation.set`:** the amended vocabulary defines the independently written `<<…>>` line as a class annotation statement, so the existing-body insertion maps directly to that statement at the class-body opening. The in-place path targets the class annotation literal. For a blockless class, the placement helper replaces the last written header value—class label, then class generic, otherwise class name—with that original value plus a new body containing the annotation statement; the five-option annotation records those distinct write targets. No translator test directly covers this command.
