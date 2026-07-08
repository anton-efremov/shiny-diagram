## List of text blocks

Rule: Mermaid source and display syntax are different (e.g. no colon separating return types in source or tilda instead of angle brackets for generic types). Shiny editor displays **displayed Mermaid syntax**. Controller translate it into/from Mermaid source


| ClassBox area | Text block | Display                                                                            | Format                                                                                                                                                                                                                                                            |
| ------------- | ---------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Class Header  | annotation | Optional<br>Area in header is not reserved if empty<br>Displayed in `<< >>`        | No whitespaces                                                                                                                                                                                                                                                    |
|               | name       | Always                                                                             | Generic types are written and edited with `<>` but written/read in source with tilda (Mermaid syntax)<br>Whitespaces and special symbols **are allowed** (as with backticks in Mermaid)<br>Generics that include a comma not allowed (such as `List<List<K, V>>`) |
|               | Label      | Optional<br>Area in header is not reserved if empty<br>Displayed as `as label`     |                                                                                                                                                                                                                                                                   |
| Attribute box | attribute  | Optional<br>If no attributes, box is still visible with `[+ attribute]` affordance | Any line without `(..)` (in any place with anything between them)                                                                                                                                                                                                 |
| Method box    | method     | Optional<br>If no attributes, box is still visible with `[+ method]` affordance    | Return types are written after colon, but written/read in source without colon (see note)<br>As a result, closing parenthesis after colon are not allowed<br>Any line with `(..)` (in any place with anything between them)                                       |
Note: for method declaration, Mermaid source separates return type from the method name with whitespace, but in render it inserts colon after the last closing parenthesis

**BIG FAT NOTE:** Mermaid de-facto is much more permissive than in documentation, e.g. visibility symbols don't mean shit, you can put "?" in front of member and it will render. Or you can put "\*" which is supposed to mean "abstract" as modifier to attribute. Thus exact Mermaid behavior to be checked with Mermaid compiler. But valid Mermaid source MUST be a valid Shiny visual state

## Editing text block
#### General editing rules

There is no separate style pane for text block
Text blocks of class header are editable from Style pane and with direct edits
Member blocks are editable only with direct edits
#### Enter direct editing mode

One click anywhere or drag and stop - select box; second click on text block - editing text block
Double click on text area in selected on unselected box - editing text area
Only one text block can be in direct editing mode; at that time its parent box remains selected

#### Editing in direct editing mode
- WYSIWYG, particularly modifiers "\*" and "$" are not typed or visible in text fields
- For member blocks underline and italics (how "\*" and "$" modifiers are rendered by Mermaid) are implemented through two buttons shown on top of direct editing field 

#### Exit editing mode

Enter -> 
- If text is invalid - popup with comment and stay in direct editing mode
- If text is valid - commit change, exit direct editing mode, box remains selected

Click outside of edited text block -> exit editing mode but doesn't change selection (click on another text block in the same parent box in this case doesn't enter editing mode)
- If text is invalid - popup with comment + discard changes + leave direct editing mode
- If text is valid - commit
- If no text - delete current member
Escape -> cancel change

#### Edit through StylePane (Header blocks only)

- annotation - Combobox with common values: e.g. interface, custom. Common values are committed on selection, custom - on enter
- name - text area, commit on enter or click outside with validity check
- label -  text area, commit on enter or click outside with validity check + button "Clear"
if text is invalid on click outside - stay open
  
## Add member

Selected class box shows two affordances, one at the bottom of each box: `[+ attribute]`, `[+ method]`.

**Happy path:**
→ click `[+ attribute]` or `[+ method]`
→ empty editor row appears at the bottom of that box, in edit mode
→ type full member text (all facets allowed: visibility, type/parameters/return type, classifiers)let'
→ "Enter"
Member is created in that box, as the last member of its kind. Selection remains

**Cancel path:**
→ "Esc" OR commit of empty text
Editor row is removed. Nothing is created

Validation is identical to Edit member; the kind expected by the affordance's box applies.

---
## Delete member

**Happy path:**
→ enter member edit
→ clear all text
→ "Enter"
Member is deleted  Selection remains

Deletion is available only through the empty-text commit; members are not independently selectable objects and have no delete button.

---
## Drag member

**Happy path:**
→ press on a member line and drag past the drag threshold
→ drop indicator appears between member lines **of the same box**
→ drop