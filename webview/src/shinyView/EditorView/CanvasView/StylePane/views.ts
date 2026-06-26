/**
 * @fileoverview Render contract for the style pane.
 */

import type { ClassBoxView } from "../ClassDiagram/views";
import type { EmptyStylePaneView } from "./EmptyStylePane/views";
import type { MultiClassStylePaneView } from "./MultiClassStylePane/views";
import type { SingleClassStylePaneView } from "./SingleClassStylePane/views";

export type StylePaneView = {
  readonly selectedClassViews: readonly ClassBoxView[];
};

export type StylePaneScenarioView =
  | {
      readonly kind: "empty";
      readonly view: EmptyStylePaneView;
    }
  | {
      readonly kind: "singleClass";
      readonly view: SingleClassStylePaneView;
    }
  | {
      readonly kind: "multiClass";
      readonly view: MultiClassStylePaneView;
    };
