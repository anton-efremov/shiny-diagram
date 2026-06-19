/**
 * @fileoverview Checks strict webview layer and component import boundaries.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, "webview", "src");
const componentNames = new Set(["parse", "deriveViews", "commands"]);
const facadeFiles = [
  "controller/parse/index.ts",
  "controller/deriveViews/index.ts",
  "controller/commands/index.ts",
  "view/index.ts",
  "view/commands/index.ts",
  "view/views/index.ts",
];

const errors = [];

for (const forbidden of ["controller/model/index.ts", "shared/index.ts"]) {
  if (existsSync(path.join(sourceRoot, forbidden))) {
    errors.push(`${forbidden}: forbidden barrel file`);
  }
}

for (const file of listSourceFiles(sourceRoot)) {
  const source = readFileSync(file, "utf8");
  const relativeFile = toSourceRelative(file);

  if (facadeFiles.includes(relativeFile)) {
    checkFacadeOnly(relativeFile, source);
  }

  for (const specifier of readModuleSpecifiers(source)) {
    const resolved = resolveSourcePath(file, specifier.value);
    if (!resolved) continue;
    checkImport(relativeFile, specifier, resolved);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

/**
 * Recursively lists TypeScript source files below a directory.
 */
function listSourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

function toSourceRelative(file) {
  return path.relative(sourceRoot, file).split(path.sep).join("/");
}

function readModuleSpecifiers(source) {
  const specifiers = [];
  const importRegex = /import\s+(type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/g;
  const sideEffectImportRegex = /import\s+["']([^"']+)["']/g;
  const exportRegex = /export\s+(type\s+)?(?:\{[\s\S]*?\}|\*)\s+from\s+["']([^"']+)["']/g;

  for (const match of source.matchAll(importRegex)) {
    specifiers.push({ value: match[2], isTypeOnly: Boolean(match[1]) });
  }
  for (const match of source.matchAll(sideEffectImportRegex)) {
    specifiers.push({ value: match[1], isTypeOnly: false });
  }
  for (const match of source.matchAll(exportRegex)) {
    specifiers.push({ value: match[2], isTypeOnly: Boolean(match[1]) });
  }

  return specifiers;
}

function resolveSourcePath(importerFile, specifier) {
  if (!specifier.startsWith(".")) return null;

  const absolute = path.normalize(path.join(path.dirname(importerFile), specifier));
  const relative = path.relative(sourceRoot, absolute);
  if (relative.startsWith("..")) return null;
  return relative.split(path.sep).join("/");
}

function checkImport(file, specifier, target) {
  const sourceArea = areaFor(file);
  const targetArea = areaFor(target);

  if (sourceArea === "shared" && ["controller", "view", "extensionBridge"].includes(targetArea)) {
    report(file, specifier.value, "shared files must not import webview layers");
  }

  if (sourceArea === "model" && targetArea !== "model" && targetArea !== "shared") {
    report(file, specifier.value, "controller/model may import only model or shared files");
  }

  checkStrictLayerDirection(file, specifier, target);
  checkControllerSiblings(file, specifier, target);
  checkPublicFacades(file, specifier, target);
  checkControllerViewImports(file, specifier, target);
  checkViewSelfFacadeImports(file, specifier, target);
  checkExtensionBridgeImports(file, specifier, target);
}

function checkStrictLayerDirection(file, specifier, target) {
  if (file.startsWith("view/") && target.startsWith("controller/")) {
    report(file, specifier.value, "view must not import controller in any form");
  }

  if (file.startsWith("view/") && target.startsWith("extensionBridge/")) {
    report(file, specifier.value, "view must not import extensionBridge in any form");
  }

  if (file.startsWith("controller/") && target.startsWith("extensionBridge/")) {
    report(file, specifier.value, "controller must not import extensionBridge");
  }
}

function checkControllerSiblings(file, specifier, target) {
  const sourceComponent = controllerComponent(file);
  const targetComponent = controllerComponent(target);
  if (!sourceComponent || !targetComponent || sourceComponent === targetComponent) return;

  report(
    file,
    specifier.value,
    `controller/${sourceComponent} must not import controller/${targetComponent}`
  );
}

function checkPublicFacades(file, specifier, target) {
  const targetComponent = controllerComponent(target);
  if (!targetComponent || controllerComponent(file) === targetComponent) return;
  if (isControllerFacade(target, targetComponent)) return;

  report(
    file,
    specifier.value,
    `external imports must use controller/${targetComponent} public facade`
  );
}

function checkControllerViewImports(file, specifier, target) {
  if (!file.startsWith("controller/") || !isInView(target)) return;

  if (file === "controller/AppController.tsx") {
    if (isAllowedViewFacade(target, ["view", "view/commands", "view/views"])) return;
  } else if (file.startsWith("controller/deriveViews/")) {
    if (isAllowedViewFacade(target, ["view/views"])) return;
  } else if (file.startsWith("controller/commands/")) {
    if (isAllowedViewFacade(target, ["view/commands"])) return;
  }

  report(
    file,
    specifier.value,
    "controller may import view only through the allowed public View facades"
  );
}

function checkViewSelfFacadeImports(file, specifier, target) {
  if (!file.startsWith("view/") || isViewFacadeFile(file) || !isViewFacadeTarget(target)) return;

  report(file, specifier.value, "view implementation files must not import public View facades");
}

function checkExtensionBridgeImports(file, specifier, target) {
  if (!file.startsWith("extensionBridge/")) return;

  if (isInView(target)) {
    report(file, specifier.value, "extensionBridge must not import view directly");
    return;
  }

  if (!target.startsWith("controller/")) return;

  const importsAppController = target === "controller/AppController";
  const importsCommandTypes =
    specifier.isTypeOnly &&
    controllerComponent(target) === "commands" &&
    isControllerFacade(target, "commands");

  if (!importsAppController && !importsCommandTypes) {
    report(
      file,
      specifier.value,
      "extensionBridge may import only AppController or command facade types"
    );
  }
}

function checkFacadeOnly(file, source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  if (withoutComments === "") return;

  for (const statement of withoutComments.split(";")) {
    const trimmed = statement.trim();
    if (trimmed !== "" && !trimmed.startsWith("export ")) {
      errors.push(`${file}: facade files may contain only comments and export declarations`);
      return;
    }
  }
}

function areaFor(relativePath) {
  if (relativePath === "controller/model") return "model";
  if (relativePath.startsWith("controller/model/")) return "model";
  if (relativePath === "controller") return "controller";
  if (relativePath.startsWith("controller/")) return "controller";
  if (relativePath === "shared") return "shared";
  if (relativePath.startsWith("shared/")) return "shared";
  if (relativePath === "view") return "view";
  if (relativePath.startsWith("view/")) return "view";
  if (relativePath === "extensionBridge") return "extensionBridge";
  if (relativePath.startsWith("extensionBridge/")) return "extensionBridge";
  return "other";
}

function controllerComponent(relativePath) {
  const match = /^controller\/(parse|deriveViews|commands)(?:\/|$)/.exec(relativePath);
  return match?.[1] ?? null;
}

function isControllerFacade(relativePath, component) {
  return (
    relativePath === `controller/${component}` || relativePath === `controller/${component}/index`
  );
}

function isInView(relativePath) {
  return relativePath === "view" || relativePath.startsWith("view/");
}

function isAllowedViewFacade(relativePath, allowedFacades) {
  return allowedFacades.some(
    (facade) => relativePath === facade || relativePath === `${facade}/index`
  );
}

function isViewFacadeTarget(relativePath) {
  return isAllowedViewFacade(relativePath, ["view", "view/commands", "view/views"]);
}

function isViewFacadeFile(relativePath) {
  return (
    relativePath === "view/index.ts" ||
    relativePath === "view/commands/index.ts" ||
    relativePath === "view/views/index.ts"
  );
}

function report(file, specifier, message) {
  errors.push(`${file}: ${specifier}: ${message}`);
}
