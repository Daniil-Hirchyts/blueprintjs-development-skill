# Skill utilities

These scripts are dependency-free Node.js utilities intended to be run from a target project.

## Audit installed packages

```bash
node /path/to/blueprintjs-development-skill/scripts/audit-blueprint.mjs
node /path/to/blueprintjs-development-skill/scripts/audit-blueprint.mjs --json
```

The audit finds the nearest `package.json`, resolves Blueprint/React packages, and reports mixed majors, unsupported target versions, and declared-but-unresolved dependencies. A warning produces exit code 1 so the script can be used as an advisory CI check.

## Scan migration candidates

```bash
node /path/to/blueprintjs-development-skill/scripts/scan-blueprint-usage.mjs
node /path/to/blueprintjs-development-skill/scripts/scan-blueprint-usage.mjs src test --json
```

The scanner reports heuristic candidates such as hardcoded `bpN-` classes, legacy Overlay/Popover JSX, compatibility props, old ReactDOM rendering, and internal Blueprint subpath imports. It does not modify files. Every result requires manual review.
