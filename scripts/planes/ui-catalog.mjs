import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

export const name = "ui-catalog";
export const outputPath = "webview/src/ui/UI-CATALOG.md";

const modulePath = "scripts/planes/ui-catalog.mjs";
const fragmentPath = fileURLToPath(new URL("./fragments/ui-catalog-preamble.md", import.meta.url));
const wings = ["chrome", "canvas"];
const tiers = ["primitives", "composites", "templates"];

export async function generate({ repoRoot }) {
  const preamble = await readFile(fragmentPath, "utf8");
  const components = await scanComponents(repoRoot);
  const sections = [
    generatedMarker(),
    normalizeFragment(preamble),
    renderCoverage(components),
    renderContents(components),
    renderCatalog(components),
  ];
  const outputFile = path.join(repoRoot, outputPath);
  const prettierOptions = (await resolveConfig(outputFile)) ?? {};
  return format(`${sections.filter((section) => section.length > 0).join("\n\n")}\n`, {
    ...prettierOptions,
    filepath: outputFile,
  });
}

async function scanComponents(repoRoot) {
  const uiRoot = path.join(repoRoot, "webview", "src", "ui");
  const components = [];

  for (const wing of wings) {
    for (const tier of tiers) {
      const tierRoot = path.join(uiRoot, wing, tier);
      const entries = await readdir(tierRoot, { withFileTypes: true });
      const componentNames = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(compareText);

      for (const componentName of componentNames) {
        const relativeSourcePath = `${wing}/${tier}/${componentName}/${componentName}.tsx`;
        const absoluteSourcePath = path.join(uiRoot, relativeSourcePath);
        let source = "";
        try {
          source = await readFile(absoluteSourcePath, "utf8");
        } catch {
          // A malformed component folder remains visible as an incomplete catalog entry.
        }

        const documentation = extractDocumentation(source);
        components.push({
          name: componentName,
          wing,
          tier,
          sourcePath: `./${relativeSourcePath}`,
          documentation,
          propsType: extractPropsType(source, componentName) ?? describeAbsentProps(source),
        });
      }
    }
  }

  return components;
}

function extractDocumentation(source) {
  const exportIndex = source.search(/\bexport\s+default\b/);
  if (exportIndex < 0) return null;

  let nearestBlock = null;
  for (const match of source.slice(0, exportIndex).matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    nearestBlock = match[0];
  }
  if (nearestBlock === null) return null;

  const lines = cleanTSDocLines(nearestBlock);
  const summaryIndex = lines.findIndex((line) => line.trim().length > 0);
  if (summaryIndex < 0) return null;
  const summary = lines[summaryIndex].trim();

  // Legacy implementation tags are not public catalog annotations.
  if (summary.startsWith("@")) return null;

  if (lines[summaryIndex + 1]?.trim() !== "") return null;
  const body = trimBlankLines(lines.slice(summaryIndex + 1));
  if (body.length === 0) return null;
  return { summary, body };
}

function cleanTSDocLines(block) {
  const inner = block.slice(3, -2);
  return inner.split(/\r?\n/).map((line) => line.replace(/^\s*\* ?/, "").trimEnd());
}

function extractPropsType(source, componentName) {
  const escapedName = escapeRegExp(`${componentName}Props`);
  const typePattern = new RegExp(`(?:^|\\n)(?:export\\s+)?type\\s+${escapedName}\\s*=`, "m");
  const typeMatch = typePattern.exec(source);
  if (typeMatch) {
    const start = typeMatch.index + (typeMatch[0].startsWith("\n") ? 1 : 0);
    return scanTypeDeclaration(source, start);
  }

  const interfacePattern = new RegExp(
    `(?:^|\\n)(?:export\\s+)?interface\\s+${escapedName}\\b`,
    "m"
  );
  const interfaceMatch = interfacePattern.exec(source);
  if (interfaceMatch) {
    const start = interfaceMatch.index + (interfaceMatch[0].startsWith("\n") ? 1 : 0);
    return scanInterfaceDeclaration(source, start);
  }

  return null;
}

function describeAbsentProps(source) {
  return /\bexport\s+default\s+function\s+\w+\s*\(\s*\)/.test(source)
    ? "// This component accepts no props."
    : null;
}

function scanTypeDeclaration(source, start) {
  const equalsIndex = source.indexOf("=", start);
  if (equalsIndex < 0) return null;
  const end = findTopLevelSemicolon(source, equalsIndex + 1);
  return end < 0 ? null : source.slice(start, end + 1);
}

function scanInterfaceDeclaration(source, start) {
  const openBrace = source.indexOf("{", start);
  if (openBrace < 0) return null;
  const closeBrace = findMatchingBrace(source, openBrace);
  return closeBrace < 0 ? null : source.slice(start, closeBrace + 1);
}

function findTopLevelSemicolon(source, start) {
  const delimiters = [];
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote !== null) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{" || character === "[" || character === "(") {
      delimiters.push(character);
      continue;
    }
    if (character === "}" || character === "]" || character === ")") {
      delimiters.pop();
      continue;
    }
    if (character === ";" && delimiters.length === 0) return index;
  }
  return -1;
}

function findMatchingBrace(source, openBrace) {
  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }
  return -1;
}

function renderCoverage(components) {
  const rows = ["# Coverage", "", "| Wing | Tier | Annotated | Total |", "|---|---|---:|---:|"];
  let annotatedTotal = 0;

  for (const wing of wings) {
    for (const tier of tiers) {
      const matching = components.filter(
        (component) => component.wing === wing && component.tier === tier
      );
      const annotated = matching.filter((component) => component.documentation !== null).length;
      annotatedTotal += annotated;
      rows.push(`| ${titleCase(wing)} | ${titleCase(tier)} | ${annotated} | ${matching.length} |`);
    }
  }
  rows.push(`| **Overall** |  | **${annotatedTotal}** | **${components.length}** |`);
  return rows.join("\n");
}

function renderContents(components) {
  const lines = ["# Contents", ""];
  for (const wing of wings) {
    lines.push(`- [${titleCase(wing)}](#${wing})`);
    for (const tier of tiers) {
      lines.push(`  - [${titleCase(tier)}](#${wing}-${tier})`);
      for (const component of componentsFor(components, wing, tier)) {
        lines.push(`    - [${component.name}](#${component.name.toLowerCase()})`);
      }
    }
  }
  return lines.join("\n");
}

function renderCatalog(components) {
  const sections = [];
  for (const wing of wings) {
    sections.push(`# ${titleCase(wing)}`);
    for (const tier of tiers) {
      sections.push(`## ${titleCase(wing)} ${tier}`);
      for (const component of componentsFor(components, wing, tier)) {
        sections.push(renderComponent(component));
      }
    }
  }
  return sections.join("\n\n");
}

function renderComponent(component) {
  const lines = [`### [${component.name}](${component.sourcePath})`, ""];
  if (component.documentation === null) {
    lines.push("_not yet annotated_");
  } else {
    lines.push(component.documentation.summary);
    if (component.documentation.body.length > 0) {
      lines.push("", component.documentation.body.join("\n"));
    }
  }
  lines.push("", "```ts", component.propsType ?? "// props type not found", "```");
  return lines.join("\n");
}

function componentsFor(components, wing, tier) {
  return components.filter((component) => component.wing === wing && component.tier === tier);
}

function generatedMarker() {
  return `<!-- Generated by ${modulePath} (plane: ${name}). Never edit by hand. Regenerate with: npm run planes -- ${name} -->`;
}

function normalizeFragment(fragment) {
  return fragment.replace(/\r\n/g, "\n").trimEnd();
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim().length === 0) start += 1;
  while (end > start && lines[end - 1].trim().length === 0) end -= 1;
  return lines.slice(start, end);
}

function titleCase(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
