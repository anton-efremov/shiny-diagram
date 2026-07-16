## Add relationship

ToolPane renders relationship buttons (UML presets over the marker/line/marker model — only sensical UML combinations are offered here):

| Button                    | Mermaid syntax           |
| ------------------------- | ------------------------ |
| Association               | `A -- B`                 |
| Directed association      | `A --> B`                |
| Bidirectional association | `A <--> B`               |
| Dependency                | `A ..> B`                |
| Inheritance               | `Child --`\|`> Parent`   |
| Realization               | `Impl ..`\|`> Interface` |
| Aggregation               | `Whole o-- Part`         |
| Composition               | `Whole *-- Part`         |

**Happy path:**
→ pick relationship type
→ click source class box (anywhere inside the box)
→ click target class box (anywhere inside the box)
Relationship is created

Created relationship:
- source marker + line + target marker = selected preset's combination
- source = first clicked class
- target = second clicked class
- source multiplicity = none
- target multiplicity = none
- label = none

**Cancel path:**
→ pick relationship type
→ click not on a class box
Relationship placement mode is canceled. No selection

## EditPane editting

When one relationship is selected Edit Pane shows (full marker/line/marker model — any Mermaid-valid combination is reachable here, including non-UML ones):

| Section                    | How it looks                                                                                  | Behavior                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Change source marker       | Dropdown: none, arrow, triangle, composition, aggregation, lollipop. Current marker selected. | Click on a marker changes the source-end marker. Selection remains                                                           |
| Change line                | Dropdown: solid, dashed. Current line selected.                                               | Click changes the line kind. Selection remains                                                                               |
| Change target marker       | Dropdown: none, arrow, triangle, composition, aggregation, lollipop. Current marker selected. | Click on a marker changes the target-end marker. Selection remains                                                           |
| Reverse relationship       | Button: `[Reverse]`.                                                                          | Source and target classes swap (multiplicities travel with their classes); markers keep their ends, so the relationship direction flips. Selection remains |
| Change source multiplicity | Combobox with common values: none, `1`, `0..1`, `*`, `0..*`, `1..*`, custom.                  | On custom - multiplicity is saved and displayed on press "Enter". Selection remains                                          |
| Change target multiplicity | Combobox with common values: none, `1`, `0..1`, `*`, `0..*`, `1..*`, custom.                  | On custom - multiplicity is saved and displayed on press "Enter". Selection remains                                          |
| Edit label                 | Text input.                                                                                   | No label - shows empty field. Field is editable from the get-go. Label is changed on "Enter". On "Exc" changes are discarded |
| Remove label               | Button: `[Remove Label]`                                                                      | Clears label field and label is removed. Selection remains                                                                   |
| Delete relationship        | Button: `[Delete]`.                                                                           |                                                                                                                              |
| Duplicate relationship     | Button: `[Duplicate]`                                                                         | Enters placement mode with copied markers, line, multiplicities, and label. Selection is                                     |

Multiple relationship cannot be selected

## Direct editing

Click anywhere on relationship + click on text area OR doubleclick on text area allows direct edit of this area:
- Label (on empty text label field disappears)
- Multiplicity

Reconnect endpoint: drag one endpoint of an existing relationship edge to another class box. The dragged end's class changes; the other end does not. Multiplicity and end marker are positional, so they stay with the dragged end and now apply to the new class. Reconnecting an end to the other end's class is allowed.
