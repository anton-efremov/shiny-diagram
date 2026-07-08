# Notes — Behavior Spec draft v1

## Note kinds and source

| Kind     | Mermaid source              | Display                                                        | Spatial                          |
| -------- | --------------------------- | -------------------------------------------------------------- | -------------------------------- |
| Free     | `note "text"`               | Note box at its own position                                   | `x y w h`                        |
| Attached | `note for Class "text"`     | Same note box + dashed link line to the class (Mermaid-style)  | `x y w h` — same as free         |

- Attachment is purely semantic: attaching or detaching rewrites the statement, never the position. A note keeps its location through attach/detach
- Note text is a Mermaid quoted string. Exact expressibility limits (quotes inside text, escapes, multiline) to be checked with the Mermaid compiler; valid Mermaid note source MUST be a valid Shiny visual state

## Shiny annotation — statement-bound binding

Notes are anonymous in Mermaid — no name exists to reference. Their spatial annotation therefore binds by adjacency, not identity:

```
%% @note: x=120 y=340 w=200 h=80
note "Remember to validate"
```

Binding rule (general rule of the Shiny annotation language):

- An annotation is either **identity-bound** (`@spatial:<identity>`) or **statement-bound** (`@note:`)
- A statement-bound annotation binds to the statement on the immediately following line; no blank lines or other statements may intervene
- At most one statement-bound annotation per statement
- A statement-bound annotation not followed by a statement of the matching kind is orphaned → diagnostic (missing-annotation flow)
- Statement-bound binding is reserved for anonymous statement kinds; anything nameable stays identity-bound

Consequences:

- Same `@note:` payload for free and attached notes (position is attachment-independent)
- Shiny always writes, moves, and deletes the annotation + note statement as a pair
- A note statement without an annotation (e.g. hand-added or agent-added) → missing-annotation flow assigns a position; existing notes are never affected
- Runtime `NoteId` is session-scoped (`note:<line>`, as with members); no identity is ever persisted in the file

## Create note

One button in ToolPane.

**Happy path:**
→ click note tool
→ place on canvas (same placement flow as class creation)
→ note box appears at placed position with default size, in text edit mode
→ type text
→ "Enter"
Note is created (statement + annotation pair). Note is selected

**Cancel path:**
→ "Esc" OR commit of empty text
Nothing is created

## Select note

One click selects the note. StylePane shows the Note pane with exactly three buttons:

- **Attach to class** (label flips to **Detach from class** when attached)
- **Duplicate**
- **Delete**

## Attach to class

**Happy path:**
→ click "Attach to class"
→ ghost line appears from the note, following the cursor (same mechanics as drag-to-connect for relationships)
→ click on a class
Statement becomes `note for Class "text"`. Link line renders. Note position unchanged. Selection remains on the note

**Cancel path:**
→ "Esc" OR click on empty canvas
Nothing changes

**Detach from class:**
→ click "Detach from class"
Statement becomes `note "text"`. Link line disappears. Position unchanged

## Duplicate

→ click "Duplicate"
New note with the same text and attachment, offset from the original (same offset convention as class duplicate). New note is selected

## Delete

→ click "Delete"
Note statement and its annotation are removed

## Move / resize

Drag the note box to move; resize with handles — same interaction as class boxes. Both update the `@note:` annotation only

## Edit text

Same direct-edit machinery as class text blocks:

- Second click on a selected note, or double click, enters text edit
- Enter → commit if valid; popup + stay if invalid
- Click outside → commit if valid; popup + discard + exit if invalid
- Esc → cancel
- Commit of empty text → delete the note

## Validation

- Note text validity ≡ Mermaid expressibility, enforced by the round-trip rule through the note grammar-spelling module
- Exact quote/escape behavior pinned against the Mermaid compiler before rules are enforced (BIG FAT NOTE discipline)
