/**
 * Checks generated management planes and UI catalog annotation contracts.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectComponents } from "./planes/ui-catalog.mjs";
import { planes } from "./planes/registry.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const violations = [];

await checkPlaneStaleness();
await checkUiCatalogAnnotations();

if (violations.length > 0) {
  console.error(`Plane checks failed with ${violations.length} violation(s):\n`);
  for (const violation of violations) {
    console.error(`${violation.location} [${violation.rule}] ${violation.subject}`);
    console.error(`  ${violation.message}`);
    console.error(`  Fix: ${violation.fix}\n`);
  }
  process.exitCode = 1;
} else {
  console.log(`Plane checks passed (${planes.length} plane(s), annotation contracts valid).`);
}

async function checkPlaneStaleness() {
  for (const plane of planes) {
    const outputFile = path.resolve(repoRoot, plane.outputPath);
    const expected = await plane.generate({ repoRoot });
    let actual;
    try {
      actual = await readFile(outputFile, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      addViolation({
        location: plane.outputPath,
        rule: "plane staleness",
        subject: JSON.stringify(plane.name),
        message: "The committed plane output is missing.",
        fix: "Run `npm run planes` and commit the generated output.",
      });
      continue;
    }

    if (actual !== expected) {
      addViolation({
        location: plane.outputPath,
        rule: "plane staleness",
        subject: JSON.stringify(plane.name),
        message: "The committed plane output does not match its sources.",
        fix: "Run `npm run planes` and commit the generated output.",
      });
    }
  }
}

async function checkUiCatalogAnnotations() {
  const components = await collectComponents({ repoRoot });
  for (const component of components) {
    checkPresence(component);
    checkStructure(component);
    checkSummaryPurity(component);
    checkPropCoverage(component);
    checkReverseDrift(component);
  }
}

function checkPresence(component) {
  if (component.documentation !== null) return;
  componentViolation(
    component,
    "annotation presence",
    "No complete catalog annotation was found; this component would render a placeholder.",
    "Add or repair the TSDoc block immediately before the default export, then run `npm run planes`."
  );
}

function checkStructure(component) {
  if (component.annotation === null) return;
  const lines = component.annotation.contentLines;
  const optionsIndex = lines.indexOf("Options:");
  const paragraphEnd = optionsIndex < 0 ? lines.length : optionsIndex;
  const hasSummary = lines[0]?.trim().length > 0;
  const hasBlankAfterSummary = lines[1] !== undefined && lines[1].trim() === "";
  const hasParagraph = lines.slice(2, paragraphEnd).some((line) => line.trim().length > 0);

  if (!hasSummary || !hasBlankAfterSummary || !hasParagraph) {
    componentViolation(
      component,
      "annotation structure",
      "The block must start with one summary line, a blank line, and at least one contract paragraph.",
      "Restore the required annotation structure, then run `npm run planes`."
    );
  }

  if (optionsIndex < 0) return;
  const entries = topLevelOptionEntries(lines, optionsIndex);
  if (entries.length === 0 || entries.some((entry) => entry.subject === null)) {
    componentViolation(
      component,
      "annotation structure",
      "Every top-level entry under `Options:` must be a bullet beginning with one backticked subject.",
      "Make each `Options:` entry a dash bullet whose first token is one backticked prop name, then run `npm run planes`."
    );
  }
}

function checkSummaryPurity(component) {
  const summary = component.annotation?.contentLines[0];
  if (summary === undefined || !summary.includes("`")) return;
  componentViolation(
    component,
    "summary purity",
    "The summary line contains a backticked member reference.",
    "Move member references into the contract paragraph or options, then run `npm run planes`."
  );
}

function checkPropCoverage(component) {
  if (component.annotation === null) return;
  for (const propName of component.propsMemberNames) {
    if (component.annotation.block.includes(`\`${propName}\``)) continue;
    componentViolation(
      component,
      "prop coverage",
      `Prop ${JSON.stringify(propName)} is not documented as a backticked member.`,
      `Document \`${propName}\` in the annotation, then run \`npm run planes\`.`
    );
  }
}

function checkReverseDrift(component) {
  if (component.annotation === null) return;
  const lines = component.annotation.contentLines;
  const optionsIndex = lines.indexOf("Options:");
  if (optionsIndex < 0) return;
  const props = new Set(component.propsMemberNames);
  for (const entry of topLevelOptionEntries(lines, optionsIndex)) {
    if (entry.subject === null || props.has(entry.subject)) continue;
    componentViolation(
      component,
      "options reverse drift",
      `Option subject ${JSON.stringify(entry.subject)} is not a member of the props type.`,
      "Remove the stale option or name the real prop member, then run `npm run planes`."
    );
  }
}

function topLevelOptionEntries(lines, optionsIndex) {
  const entries = [];
  for (const line of lines.slice(optionsIndex + 1)) {
    if (line.trim().length === 0 || /^\s/.test(line)) continue;
    const match = /^- `([^`]+)`(?:\s|$)/.exec(line);
    entries.push({ line, subject: match?.[1] ?? null });
  }
  return entries;
}

function componentViolation(component, rule, message, fix) {
  addViolation({
    location: component.filePath,
    rule,
    subject: JSON.stringify(component.name),
    message,
    fix,
  });
}

function addViolation(violation) {
  violations.push(violation);
}
