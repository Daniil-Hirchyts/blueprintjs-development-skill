#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".less"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "lib",
  "node_modules",
  "out",
]);

const CHECKS = [
  {
    id: "hardcoded-namespace",
    description: "Hardcoded Blueprint major-version class; prefer Classes or Sass $ns where possible.",
    regex: /\bbp[1-9][0-9]*-[a-z0-9-]+/g,
  },
  {
    id: "legacy-overlay-component",
    description: "Legacy Overlay candidate; verify whether Overlay2 should be used.",
    regex: /<(?:Overlay)(?:\s|>)/g,
  },
  {
    id: "legacy-popover-component",
    description: "Legacy Popover candidate; verify whether PopoverNext should be used.",
    regex: /<(?:Popover)(?:\s|>)/g,
  },
  {
    id: "right-icon-prop",
    description: "Compatibility rightIcon prop candidate; prefer endIcon when supported.",
    regex: /\brightIcon\s*=/g,
  },
  {
    id: "boolean-size-prop",
    description: "Boolean small/large prop candidate; prefer size when supported.",
    regex: /\b(?:small|large)\s*=\s*(?:\{|"|')/g,
  },
  {
    id: "boolean-variant-prop",
    description: "Boolean minimal/outlined prop candidate; prefer variant when supported.",
    regex: /\b(?:minimal|outlined)\s*=\s*(?:\{|"|')/g,
  },
  {
    id: "old-react-render",
    description: "Legacy ReactDOM.render candidate; React 18/19 uses createRoot/hydrateRoot.",
    regex: /\bReactDOM\.render\s*\(/g,
  },
  {
    id: "internal-blueprint-import",
    description: "Blueprint internal/subpath import candidate; verify the symbol is exported from the package root.",
    regex: /from\s+["']@blueprintjs\/(?:core|select|datetime|table|icons|colors|labs)\/(?!lib\/css)[^"']+["']/g,
  },
];

function walk(target, files) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (SOURCE_EXTENSIONS.has(path.extname(target))) files.push(target);
    return;
  }

  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    walk(path.join(target, entry.name), files);
  }
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function lineText(text, line) {
  return text.split("\n")[line - 1]?.trim() ?? "";
}

const positional = process.argv.slice(2).filter(argument => !argument.startsWith("--"));
const targets = positional.length > 0
  ? positional.map(item => path.resolve(item))
  : ["src", "app", "components"].map(item => path.resolve(item)).filter(fs.existsSync);

if (targets.length === 0) {
  console.error("No scan targets found. Pass one or more files/directories.");
  process.exit(2);
}

const files = [];
for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.error(`Target does not exist: ${target}`);
    process.exit(2);
  }
  walk(target, files);
}

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const check of CHECKS) {
    check.regex.lastIndex = 0;
    let match;
    while ((match = check.regex.exec(text)) != null) {
      const location = lineAndColumn(text, match.index);
      findings.push({
        check: check.id,
        description: check.description,
        file: path.relative(process.cwd(), file),
        ...location,
        match: match[0],
        source: lineText(text, location.line),
      });
      if (match[0].length === 0) check.regex.lastIndex += 1;
    }
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ scannedFiles: files.length, findings }, null, 2));
} else {
  console.log(`Scanned ${files.length} source files.`);
  if (findings.length === 0) {
    console.log("No migration candidates detected by the heuristic checks.");
  } else {
    console.log(`Found ${findings.length} candidate(s). Review manually; matches are not guaranteed defects.\n`);
    for (const finding of findings) {
      console.log(`${finding.file}:${finding.line}:${finding.column} [${finding.check}]`);
      console.log(`  ${finding.description}`);
      console.log(`  ${finding.source}\n`);
    }
  }
}

process.exitCode = findings.length === 0 ? 0 : 1;
