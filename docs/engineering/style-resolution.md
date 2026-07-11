# Style resolution

This document is the normative definition of class style resolution in Shiny Diagram.

## Resolution chain

Each class style property resolves independently through this chain:

1. direct class style;
2. applied named style;
3. base style customization;
4. the pure application default.

Missing properties continue down the chain. Editing one layer never copies values into, or rewrites, another layer.

## Base style

The UI term **base style** corresponds to Mermaid's `classDef default` syntax. The source keyword remains `default`.

Base style always exists. Without a `classDef default` statement it has no customizations and resolves entirely from the pure defaults in `View/config/stylePresets.ts`. The first base-property edit materializes `classDef default`; clearing its last property or choosing **Reset base** removes the statement.

Base declarations are position-independent and behave as though hoisted before the diagram. When several `classDef default` declarations occur, source order resolves them per property: a later written property replaces that property, while earlier properties not rewritten remain effective.

The View keeps both truths separately: `styles` is the source-ordered occurrence list, including every default declaration; `baseStyle` is the position-free resolved customization.

## UI vocabulary

- **Base style** is the diagram-wide fallback layer for every class property.
- **No style** means that a class has no named style applied. It does not disable or replace base style.
- Selector **Base** rows clear the property at the current editing layer and show the value inherited from base. Inside the base editor, they show the pure application default.
