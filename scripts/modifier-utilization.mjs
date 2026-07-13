import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function analyzeModifierUtilization({ repoRoot, components }) {
  const sourceRoot = path.join(repoRoot, "webview", "src");
  const sourceFiles = await listFiles(sourceRoot, ".tsx");
  const sources = await Promise.all(
    sourceFiles.map(async (filePath) => ({ filePath, source: await readFile(filePath, "utf8") }))
  );
  const reports = [];

  for (const component of components) {
    const componentSource = await readFile(path.join(repoRoot, component.filePath), "utf8");
    const modifierNames = sectionSubjects(component.annotation?.contentLines ?? [], "Modifiers:");
    const props = extractPropMetadata(component.propsType, componentSource);
    const defaults = extractDestructuringDefaults(componentSource, component.name);
    const modifierProps = modifierNames.map((name) => {
      const prop = props.get(name);
      if (prop === undefined) {
        return { name, optional: false, values: [], error: "prop declaration not found" };
      }
      const declaredValues = resolveValues(prop.type, componentSource);
      const defaultValue = defaults.get(name) ?? null;
      const values =
        prop.optional && defaultValue === null ? [...declaredValues, "<absent>"] : declaredValues;
      const error =
        declaredValues.length === 0
          ? `closed value set not found for ${JSON.stringify(prop.type)}`
          : defaultValue !== null && !declaredValues.includes(defaultValue)
            ? `default ${JSON.stringify(defaultValue)} is outside the declared value set`
            : null;
      return { ...prop, declaredValues, defaultValue, values, error };
    });
    const sites = [];
    for (const source of sources) {
      for (const attributes of findJsxOpeningTags(source.source, component.name)) {
        sites.push({ filePath: source.filePath, attributes });
      }
    }

    const combinations = new Set();
    if (modifierProps.every((prop) => prop.error === null)) {
      for (const site of sites) {
        const siteValues = modifierProps.map((prop) => valuesAtSite(site.attributes, prop));
        for (const combination of cartesian(siteValues))
          combinations.add(combination.join("\u0000"));
      }
    }

    const valueCounts = Object.fromEntries(
      modifierProps.map((prop) => [prop.name, prop.values.length])
    );
    const product = modifierProps.reduce((result, prop) => result * prop.values.length, 1);
    if (combinations.size > product) {
      throw new Error(
        `${component.name}: modifier utilization assertion failed: |U|=${combinations.size} exceeds P=${product}`
      );
    }
    reports.push({
      component: component.name,
      filePath: component.filePath,
      consumers: sites.length,
      modifierProps,
      valueCounts,
      product,
      utilization: combinations.size,
      verdict:
        sites.length === 0
          ? "skipped"
          : modifierProps.some((prop) => prop.error !== null)
            ? "invalid"
            : product > 2 * combinations.size
              ? "fail"
              : "pass",
    });
  }

  return reports;
}

function sectionSubjects(lines, heading) {
  const start = lines.indexOf(heading);
  if (start < 0) return [];
  const subjects = [];
  for (const line of lines.slice(start + 1)) {
    if (line === "Lifecycle:" || line === "Modifiers:") break;
    const match = /^- `([^`]+)`(?:\s|$)/.exec(line);
    if (match) subjects.push(match[1]);
  }
  return subjects;
}

function extractPropMetadata(propsType, source) {
  const props = new Map();
  if (propsType === null || propsType.startsWith("//")) return props;
  for (const match of propsType.matchAll(
    /^\s*readonly\s+([A-Za-z_$][\w$]*)(\?)?\s*:\s*([^;]+);/gm
  )) {
    props.set(match[1], { name: match[1], optional: match[2] === "?", type: match[3].trim() });
  }

  // Intersections can carry a local data shape before the component's object type.
  for (const alias of propsType.matchAll(/\b([A-Za-z_$][\w$]*)\s*&/g)) {
    const declaration = extractTypeAlias(source, alias[1]);
    if (declaration === null) continue;
    for (const match of declaration.matchAll(
      /^\s*readonly\s+([A-Za-z_$][\w$]*)(\?)?\s*:\s*([^;]+);/gm
    )) {
      props.set(match[1], {
        name: match[1],
        optional: match[2] === "?",
        type: match[3].trim(),
      });
    }
  }
  return props;
}

function extractDestructuringDefaults(source, componentName) {
  const defaults = new Map();
  const pattern = new RegExp(
    `export\\s+default\\s+function\\s+${escapeRegExp(componentName)}\\s*\\(`
  );
  const match = pattern.exec(source);
  if (match === null) return defaults;
  const openBrace = source.indexOf("{", match.index + match[0].length);
  if (openBrace < 0) return defaults;
  const closeBrace = findMatching(source, openBrace, "{", "}");
  for (const entry of splitTopLevel(source.slice(openBrace + 1, closeBrace), ",")) {
    const defaultMatch = /^\s*([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+?)\s*$/.exec(entry);
    if (defaultMatch === null) continue;
    const value = literalValue(defaultMatch[2]);
    if (value !== null) defaults.set(defaultMatch[1], value);
  }
  return defaults;
}

function literalValue(expression) {
  const stringMatch = /^(?:"([^"]*)"|'([^']*)')$/.exec(expression.trim());
  if (stringMatch) return stringMatch[1] ?? stringMatch[2];
  if (expression.trim() === "true" || expression.trim() === "false") return expression.trim();
  if (/^-?(?:\d+|\d*\.\d+)$/.test(expression.trim())) return expression.trim();
  return null;
}

function resolveValues(type, source) {
  const normalized = type.trim();
  if (normalized === "boolean") return ["false", "true"];
  const direct = literalUnionValues(normalized);
  if (direct.length > 0) return direct;
  if (/^[A-Za-z_$][\w$]*$/.test(normalized)) {
    const declaration = extractTypeAlias(source, normalized);
    return declaration === null ? [] : literalUnionValues(declaration);
  }
  return [];
}

function literalUnionValues(type) {
  const values = [];
  for (const part of splitTopLevel(type, "|")) {
    const value = part.trim();
    const stringMatch = /^(?:"([^"]*)"|'([^']*)')$/.exec(value);
    if (stringMatch) {
      values.push(stringMatch[1] ?? stringMatch[2]);
      continue;
    }
    if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) values.push(value);
  }
  return values.length === splitTopLevel(type, "|").length ? values : [];
}

function extractTypeAlias(source, name) {
  const pattern = new RegExp(`(?:^|\\n)(?:export\\s+)?type\\s+${escapeRegExp(name)}\\s*=`, "m");
  const match = pattern.exec(source);
  if (match === null) return null;
  const equals = source.indexOf("=", match.index);
  const end = findTopLevelSemicolon(source, equals + 1);
  return end < 0 ? null : source.slice(equals + 1, end).trim();
}

function findJsxOpeningTags(source, componentName) {
  const tags = [];
  const pattern = new RegExp(`<${escapeRegExp(componentName)}\\b`, "g");
  for (const match of source.matchAll(pattern)) {
    const end = findTagEnd(source, match.index + match[0].length);
    if (end >= 0) tags.push(source.slice(match.index + match[0].length, end));
  }
  return tags;
}

function findTagEnd(source, start) {
  let braces = 0;
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
    if (character === "{") braces += 1;
    else if (character === "}") braces -= 1;
    else if (character === ">" && braces === 0) return index;
  }
  return -1;
}

function valuesAtSite(attributes, prop) {
  const attribute = findAttribute(attributes, prop.name);
  if (attribute === null) {
    return /\{\.\.\./.test(attributes)
      ? prop.values
      : [prop.optional ? (prop.defaultValue ?? "<absent>") : "<missing>"];
  }
  if (attribute.kind === "bare") return ["true"];
  if (attribute.kind === "string") return [attribute.value];
  const expression = attribute.value.trim();
  if (expression === "true" || expression === "false") return [expression];
  const stringMatch = /^(?:"([^"]*)"|'([^']*)')$/.exec(expression);
  if (stringMatch) return [stringMatch[1] ?? stringMatch[2]];
  if (/^-?(?:\d+|\d*\.\d+)$/.test(expression)) return [expression];
  return prop.values;
}

function findAttribute(attributes, propName) {
  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(propName)}(?=\\s|=|$)`, "g");
  const match = pattern.exec(attributes);
  if (match === null) return null;
  let index = match.index + match[0].length;
  while (/\s/.test(attributes[index] ?? "")) index += 1;
  if (attributes[index] !== "=") return { kind: "bare", value: "true" };
  index += 1;
  while (/\s/.test(attributes[index] ?? "")) index += 1;
  if (attributes[index] === '"' || attributes[index] === "'") {
    const quote = attributes[index];
    const end = attributes.indexOf(quote, index + 1);
    return { kind: "string", value: attributes.slice(index + 1, end) };
  }
  if (attributes[index] === "{") {
    const end = findMatching(attributes, index, "{", "}");
    return { kind: "expression", value: attributes.slice(index + 1, end) };
  }
  return { kind: "expression", value: "" };
}

function cartesian(valueSets) {
  return valueSets.reduce(
    (combinations, values) =>
      combinations.flatMap((combination) => values.map((value) => [...combination, value])),
    [[]]
  );
}

async function listFiles(root, extension) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath, extension)));
    else if (entry.isFile() && entry.name.endsWith(extension)) files.push(entryPath);
  }
  return files.sort();
}

function splitTopLevel(value, separator) {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote !== null) {
      if (character === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(" || character === "{" || character === "[") depth += 1;
    else if (character === ")" || character === "}" || character === "]") depth -= 1;
    else if (character === separator && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

function findTopLevelSemicolon(source, start) {
  let depth = 0;
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote !== null) {
      if (character === quote && source[index - 1] !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") quote = character;
    else if (character === "(" || character === "{" || character === "[") depth += 1;
    else if (character === ")" || character === "}" || character === "]") depth -= 1;
    else if (character === ";" && depth === 0) return index;
  }
  return -1;
}

function findMatching(source, start, open, close) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    else if (source[index] === close) depth -= 1;
    if (depth === 0) return index;
  }
  return source.length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
