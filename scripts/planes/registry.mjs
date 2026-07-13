import * as uiCatalog from "./ui-catalog.mjs";

export const planes = [uiCatalog];

export const planesByName = new Map(planes.map((plane) => [plane.name, plane]));
