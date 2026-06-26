/**
 * @fileoverview StylePane direct-child scenario view derivation.
 */

import type { ClassStylePaneView } from "./ClassStylePane/views";
import type { EmptyStylePaneView } from "./EmptyStylePane/views";
import type { StylePaneView } from "./views";

// @job logic:child:view
export function toEmptyStylePaneView(view: StylePaneView): EmptyStylePaneView {
  void view;
  return {};
}

// @job logic:child:view
export function toClassStylePaneView(view: StylePaneView): ClassStylePaneView {
  return view.classStylePane;
}
