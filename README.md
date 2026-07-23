# BlueprintJS Development Skill

[![skills.sh](https://skills.sh/b/Daniil-Hirchyts/blueprintjs-development-skill)](https://skills.sh/Daniil-Hirchyts/blueprintjs-development-skill/blueprintjs)

> Unofficial community skill for BlueprintJS development. BlueprintJS is maintained by Palantir Technologies.

A comprehensive development skill for Blueprint v6.x, based on the official Blueprint documentation and public package source.

## Target

- Blueprint: v6.x
- React: 18 or 19
- TypeScript: recommended
- Primary use case: complex, data-dense desktop web applications
- Review date: 2026-07-23

## Contents

- `SKILL.md` — agent instructions, workflow, package selection, implementation rules, quality gates, and routing to deeper references.
- `references/01-foundations-and-styling.md` — installation, CSS, themes, classes, variables, colors, typography, layout, and accessibility.
- `references/02-core-components.md` — every documented Core content, navigation, feedback, data-display, and utility component.
- `references/03-forms-and-inputs.md` — all Core form controls and input components, controlled/uncontrolled patterns, validation, and accessibility.
- `references/04-overlays-context-hotkeys.md` — portals, overlays, dialogs, drawers, popovers, tooltips, toasts, context menus, providers, and hooks.
- `references/05-datetime.md` — date, range, time, timezone, parsing, formatting, constraints, shortcuts, and migration notes.
- `references/06-select.md` — Select, Suggest, MultiSelect, Omnibar, QueryList, generic item contracts, filtering, creation, and performance.
- `references/07-table.md` — Table architecture, renderers, regions, selection, editing, sorting, reordering, copying, loading, freezing, and performance.
- `references/08-icons-colors-labs.md` — icon loading strategies, icon APIs, color usage, Box/Flex labs primitives, and bundle-size guidance.
- `references/09-recipes.md` — complete TypeScript/React implementation patterns.
- `references/10-testing-performance-migration.md` — testing, SSR, performance, version audits, v6 modernization, and deprecated API handling.
- `references/11-public-api-inventory.md` — public exports and a documentation coverage checklist.
- `references/12-official-source-map.md` — authoritative documentation links and verification rules.
- `scripts/audit-blueprint.mjs` — audits installed Blueprint/React versions and major alignment.
- `scripts/scan-blueprint-usage.mjs` — reports migration/deprecation candidates without modifying code.

## Install

Install with the skills.sh CLI:

```bash
npx skills add https://github.com/Daniil-Hirchyts/blueprintjs-development-skill --skill blueprintjs
```

The repository is structured as a single installable skill at the repository root. The main skill loads deeper references only when the task requires them.

## Manual usage

Place this repository in the skills location used by your development agent, or copy `SKILL.md`, `references/`, and `scripts/` into an existing skill package.

## Scope and limitations

This skill covers the official documented surface and public exports of the current Blueprint v6 source line. Blueprint changes over time. For code that depends on an exact patch version, the installed TypeScript declarations and the official current documentation remain the final authority.
