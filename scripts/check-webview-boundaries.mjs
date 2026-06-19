/**
 * @fileoverview Checks webview import boundaries for Controller components.
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

  checkControllerSiblings(file, specifier, target);
  checkPublicFacades(file, specifier, target);
  checkViewImports(file, specifier, target);
  checkExtensionBridgeImports(file, specifier, target);
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

function checkViewImports(file, specifier, target) {
  if (!file.startsWith("view/") || !target.startsWith("controller/")) return;

  const targetComponent = controllerComponent(target);
  const allowedTypeFacade =
    specifier.isTypeOnly &&
    (targetComponent === "deriveViews" || targetComponent === "commands") &&
    isControllerFacade(target, targetComponent);

  if (!allowedTypeFacade) {
    report(
      file,
      specifier.value,
      "view may only type-import controller/deriveViews or controller/commands facades"
    );
  }
}

function checkExtensionBridgeImports(file, specifier, target) {
  if (!file.startsWith("extensionBridge/") || !target.startsWith("controller/")) return;

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
  if (relativePath.startsWith("controller/model/")) return "model";
  if (relativePath.startsWith("controller/")) return "controller";
  if (relativePath.startsWith("shared/")) return "shared";
  if (relativePath.startsWith("view/")) return "view";
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

function report(file, specifier, message) {
  errors.push(`${file}: ${specifier}: ${message}`);
}
