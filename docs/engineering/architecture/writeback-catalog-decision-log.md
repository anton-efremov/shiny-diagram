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
- **Resolved — class member create/move placement:** the selected anchor now carries its written form into payload composition. A short-member sibling produces `<class name> : <member text>` in the diagram body; a block-member sibling or class-body opening produces bare member text in the class body. Move always copies only the member-text span and re-dresses it for the target form, independently of its source form. Focused translator tests cover create after both forms, both move conversions, an all-short append, and the no-preceding-member block opening.

## Annotation backfill command log

- `class.create` — retained the canonical two-statement declaration/spatial write list.
- `class.duplicate` — modeled declaration and spatial writes as unconditional groups and the mutually exclusive direct-style/application copies as conditional groups.
- `class.delete` — retained the canonical five conditional deletion groups.
- `class.name.set` — recorded the always-written class name plus conditional generic and rename-cascade value groups.
- `class.label.set` — separated existing-label replacement from label insertion through the generic or name value span.
- `class.annotation.set` — recorded the resolved statement insertion and blockless header-value branches.
- `class.spatial.set` — separated four coordinate replacements, statement insertion, and statement deletion.
- `class.parentNamespace.set` — recorded delete plus verbatim declaration insertion through the shared placement waterfall.
- `class.directStyle.property.set` — retained the canonical value/entry/statement options.
- `class.directStyle.set` — used conditional groups for statement creation and per-property delete, replace, and insert operations.
- `class.directStyle.clear` — recorded the conditional direct-style statement deletion.
- `class.appliedStyle.set` — separated statement deletion, application-name replacement, and statement creation.
- `class.attribute.create` — separated unchanged blockless header-value writes from short-form and block-form statement insertion selected by the anchor sibling.
- `class.attribute.set` — recorded one member-text value replacement.
- `class.attribute.delete` — selected block-member or short-member deletion by written form.
- `class.attribute.move` — recorded source-form deletion and target-anchor-form insertion, including owner dressing for short form.
- `class.method.create` — separated unchanged blockless header-value writes from short-form and block-form statement insertion selected by the anchor sibling.
- `class.method.set` — recorded one member-text value replacement.
- `class.method.delete` — selected block-member or short-member deletion by written form.
- `class.method.move` — recorded source-form deletion and target-anchor-form insertion, including owner dressing for short form.
- `relationship.create` — recorded one relationship statement with the complete diagram-body anchor waterfall.
- `relationship.delete` — recorded one relationship statement deletion.
- `relationship.source.class.set` — recorded the source endpoint value replacement.
- `relationship.target.class.set` — recorded the target endpoint value replacement.
- `relationship.source.endpointKind.set` — recorded the composed relationship-operator value replacement.
- `relationship.target.endpointKind.set` — recorded the composed relationship-operator value replacement.
- `relationship.lineKind.set` — recorded the composed relationship-operator value replacement.
- `relationship.source.multiplicity.set` — separated in-place multiplicity replacement from whole-statement rewrite.
- `relationship.target.multiplicity.set` — separated in-place multiplicity replacement from whole-statement rewrite.
- `relationship.label.set` — retained the canonical in-place label or whole-statement rewrite options.
- `note.create` — described the combined insertion payload as its semantic note-annotation/note statement pair.
- `note.delete` — recorded deletion of the note and its conditional bound annotation.
- `note.text.set` — recorded one note-text value replacement.
- `note.spatial.set` — recorded the four note-annotation coordinate value replacements.
- `note.attachment.set` — recorded note deletion and insertion at the paired old location without moving the bound annotation.
- `note.duplicate` — described the combined insertion payload as a new note-annotation/note statement pair after the source note.
- `namespace.create` — recorded deletion of each selected declaration and insertion of one namespace block carrying their source blocks.
- `namespace.delete` — separated direct class/namespace unwrap insertions from namespace and optional style-annotation deletions.
- `namespace.name.set` — recorded declaration-name and style-target rename cascades only where written spelling changes.
- `namespace.style.set` — separated annotation deletion, properties replacement, and statement creation.
- `namespace.parentNamespace.set` — retained the canonical declaration move and descendant style-target rename description.
- `style.definition.create` — recorded one style-definition insertion plus style applications for requested classes; observed that `sourceKind` is ignored and the translator always emits `classDef`, although current UI callers send only `classDef`.
- `style.definition.delete` — recorded conditional definition deletion and application deletions.
- `style.definition.name.set` — recorded definition-name replacement and application-name cascade.
- `style.definition.property.set` — separated property value replacement, entry insertion, and entry deletion.
