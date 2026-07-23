#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const PACKAGE_NAMES = [
  "@blueprintjs/core",
  "@blueprintjs/icons",
  "@blueprintjs/datetime",
  "@blueprintjs/select",
  "@blueprintjs/table",
  "@blueprintjs/colors",
  "@blueprintjs/labs",
  "react",
  "react-dom",
  "@types/react",
  "@types/react-dom",
];

function findProjectPackageJson(startDirectory) {
  let current = path.resolve(startDirectory);
  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findPackageJsonFromResolvedEntry(entryPath) {
  let current = path.dirname(entryPath);
  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function resolveInstalledPackage(packageName, projectPackageJson) {
  const projectRequire = createRequire(projectPackageJson);

  try {
    const packageJsonPath = projectRequire.resolve(`${packageName}/package.json`);
    const metadata = readJson(packageJsonPath);
    return { name: packageName, version: metadata.version, path: packageJsonPath };
  } catch {
    try {
      const entryPath = projectRequire.resolve(packageName);
      const packageJsonPath = findPackageJsonFromResolvedEntry(entryPath);
      if (packageJsonPath == null) return { name: packageName, installed: false };
      const metadata = readJson(packageJsonPath);
      return { name: packageName, version: metadata.version, path: packageJsonPath };
    } catch {
      return { name: packageName, installed: false };
    }
  }
}

function major(version) {
  const match = /^(\d+)/.exec(version ?? "");
  return match == null ? null : Number(match[1]);
}

function dependencyDeclarations(project) {
  return {
    ...(project.dependencies ?? {}),
    ...(project.devDependencies ?? {}),
    ...(project.peerDependencies ?? {}),
    ...(project.optionalDependencies ?? {}),
  };
}

const cwd = process.cwd();
const projectPackageJson = findProjectPackageJson(cwd);
if (projectPackageJson == null) {
  console.error(`No package.json found from ${cwd} upward.`);
  process.exit(2);
}

const project = readJson(projectPackageJson);
const declared = dependencyDeclarations(project);
const packages = PACKAGE_NAMES.map(name => {
  const resolved = resolveInstalledPackage(name, projectPackageJson);
  return { ...resolved, declared: declared[name] ?? null };
});

const warnings = [];
const installedBlueprint = packages.filter(
  item => item.name.startsWith("@blueprintjs/") && item.version != null,
);
const blueprintMajors = new Map();
for (const item of installedBlueprint) {
  const itemMajor = major(item.version);
  if (itemMajor == null) continue;
  const names = blueprintMajors.get(itemMajor) ?? [];
  names.push(item.name);
  blueprintMajors.set(itemMajor, names);
}

if (blueprintMajors.size > 1) {
  warnings.push(
    `Mixed Blueprint major versions: ${[...blueprintMajors.entries()]
      .map(([value, names]) => `v${value} (${names.join(", ")})`)
      .join("; ")}.`,
  );
}

const core = packages.find(item => item.name === "@blueprintjs/core");
const extensions = installedBlueprint.filter(item => item.name !== "@blueprintjs/core");
if (extensions.length > 0 && core?.version == null) {
  warnings.push("Blueprint extension packages are installed but @blueprintjs/core could not be resolved.");
}

if (core?.version != null && major(core.version) !== 6) {
  warnings.push(
    `This skill targets Blueprint 6.x, but @blueprintjs/core ${core.version} is installed. Use version-matched documentation.`,
  );
}

const react = packages.find(item => item.name === "react");
if (react?.version != null && ![18, 19].includes(major(react.version))) {
  warnings.push(
    `Current Blueprint 6 Core metadata supports React 18 or 19; detected React ${react.version}. Verify peer dependencies.`,
  );
}

for (const item of packages) {
  if (item.declared != null && item.version == null) {
    warnings.push(`${item.name} is declared as ${item.declared} but could not be resolved from the project.`);
  }
}

const result = {
  project: {
    name: project.name ?? null,
    packageJson: projectPackageJson,
  },
  packages,
  warnings,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Blueprint audit: ${project.name ?? path.basename(path.dirname(projectPackageJson))}`);
  console.log(`Package file: ${projectPackageJson}\n`);
  for (const item of packages) {
    const installed = item.version ?? "not resolved";
    const declaredVersion = item.declared == null ? "not declared" : `declared ${item.declared}`;
    console.log(`${item.name.padEnd(26)} ${installed.padEnd(16)} ${declaredVersion}`);
  }
  console.log("");
  if (warnings.length === 0) {
    console.log("No version-alignment warnings detected.");
  } else {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
}

process.exitCode = warnings.length === 0 ? 0 : 1;
