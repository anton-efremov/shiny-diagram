/**
 * @fileoverview Typed preset catalogs for the closed set of editable style properties.
 */

import type { StylePropertyName } from "../../shared/style";

type ColorPresetCatalog = {
  readonly hues: readonly {
    readonly name: string;
    readonly shades: readonly [
      { readonly name: string; readonly value: string },
      { readonly name: string; readonly value: string },
      { readonly name: string; readonly value: string },
    ];
  }[];
  readonly neutrals: readonly { readonly name: string; readonly value: string }[];
};

export const COLOR_PRESETS: ColorPresetCatalog = {
  hues: [
    {
      name: "Rose",
      shades: [
        { name: "Light rose", value: "#ffd9e1" },
        { name: "Rose", value: "#e85d75" },
        { name: "Deep rose", value: "#8f2942" },
      ],
    },
    {
      name: "Orange",
      shades: [
        { name: "Light orange", value: "#ffe0c2" },
        { name: "Orange", value: "#ed8936" },
        { name: "Deep orange", value: "#9c4f12" },
      ],
    },
    {
      name: "Yellow",
      shades: [
        { name: "Light yellow", value: "#fff2b8" },
        { name: "Yellow", value: "#d6a817" },
        { name: "Deep yellow", value: "#7a5d00" },
      ],
    },
    {
      name: "Green",
      shades: [
        { name: "Light green", value: "#d5f2df" },
        { name: "Green", value: "#43a66b" },
        { name: "Deep green", value: "#24613d" },
      ],
    },
    {
      name: "Teal",
      shades: [
        { name: "Light teal", value: "#ccefeb" },
        { name: "Teal", value: "#319b92" },
        { name: "Deep teal", value: "#175d58" },
      ],
    },
    {
      name: "Blue",
      shades: [
        { name: "Light blue", value: "#d9e8ff" },
        { name: "Blue", value: "#4f83cc" },
        { name: "Deep blue", value: "#28518c" },
      ],
    },
    {
      name: "Purple",
      shades: [
        { name: "Light purple", value: "#e8dcff" },
        { name: "Purple", value: "#8a63c7" },
        { name: "Deep purple", value: "#50317f" },
      ],
    },
    {
      name: "Magenta",
      shades: [
        { name: "Light magenta", value: "#f5d7f1" },
        { name: "Magenta", value: "#bd5cad" },
        { name: "Deep magenta", value: "#743368" },
      ],
    },
  ],
  neutrals: [
    { name: "White", value: "#ffffff" },
    { name: "Light grey", value: "#c9cdd2" },
    { name: "Medium light grey", value: "#969ca3" },
    { name: "Medium dark grey", value: "#6f757d" },
    { name: "Dark grey", value: "#555b63" },
    { name: "Black", value: "#111111" },
  ],
};

export const WIDTH_PRESETS = ["1", "2", "4"] as const;
export const DASH_PRESETS = ["0", "4 4", "1 3"] as const;

export const STYLE_PRESETS = {
  fill: COLOR_PRESETS,
  stroke: COLOR_PRESETS,
  strokeWidth: WIDTH_PRESETS,
  strokeDasharray: DASH_PRESETS,
  color: COLOR_PRESETS,
} as const satisfies Readonly<Record<StylePropertyName, unknown>>;
