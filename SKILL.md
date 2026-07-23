---
name: blueprintjs
description: Comprehensive Blueprint v6.x development guidance for React and TypeScript applications. Use when installing, configuring, designing, implementing, refactoring, reviewing, testing, debugging, theming, optimizing, or migrating UI built with @blueprintjs/core, @blueprintjs/datetime, @blueprintjs/select, @blueprintjs/table, @blueprintjs/icons, @blueprintjs/colors, or @blueprintjs/labs.
metadata:
  priority: 7
  targetVersion: "Blueprint 6.x"
  lastReviewed: "2026-07-23"
  docs:
    - "https://blueprintjs.com/docs/"
    - "https://github.com/palantir/blueprint"
  pathPatterns:
    - "package.json"
    - "pnpm-lock.yaml"
    - "package-lock.json"
    - "yarn.lock"
    - "src/**/*.tsx"
    - "src/**/*.ts"
    - "src/**/*.scss"
    - "src/**/*.css"
    - "app/**/*.tsx"
    - "components/**/*.tsx"
  bashPatterns:
    - "\\b(pnpm|npm|yarn|bun)\\s+(add|install)\\s+@blueprintjs/"
    - "\\b@blueprintjs/(core|datetime|select|table|icons|colors|labs)\\b"
---

# BlueprintJS v6 Development

You are an expert in Blueprint, Palantir's React UI toolkit for complex, data-dense desktop web applications. Produce implementation-ready React and TypeScript that follows Blueprint v6 APIs, accessibility conventions, styling architecture, overlay behavior, and package boundaries.

Blueprint is optimized for information-dense desktop interfaces. It is not a mobile-first design system. Do not force Blueprint into a consumer-mobile interaction model without explicitly addressing touch targets, responsive simplification, viewport constraints, and alternate mobile flows.

## Operating contract

For every Blueprint task:

1. Inspect the project's installed Blueprint versions before changing code. Do not assume all `@blueprintjs/*` packages are aligned.
2. Identify the correct package and component family before writing JSX.
3. Confirm that the corresponding package CSS and dependency CSS are loaded exactly once.
4. Prefer current v6 APIs over compatibility props and deprecated components.
5. Design controlled state, focus management, keyboard behavior, portal placement, and dark-theme propagation deliberately.
6. Use semantic HTML and accessible labeling. Blueprint improves accessibility but does not infer product semantics.
7. Test user behavior, not Blueprint's internal DOM implementation.
8. For exact patch-version behavior, read installed declaration files or current official documentation instead of guessing.

## Source-of-truth hierarchy

When sources disagree, use this order:

1. Installed `@blueprintjs/*` TypeScript declaration files and package versions.
2. Current official Blueprint v6 documentation.
3. Current public source in `palantir/blueprint` for undocumented exported behavior.
4. This skill's guidance.
5. Historical examples, blog posts, Stack Overflow answers, and old major-version documentation.

Never copy a v3, v4, or v5 example into a v6 codebase without checking its imports, CSS namespace, deprecated props, overlay implementation, icon loading, and React root API.

## Blueprint package map

Use only the packages required by the feature.

| Package | Primary responsibility | CSS |
|---|---|---|
| `@blueprintjs/core` | Core components, forms, overlays, providers, hooks, utilities, typography, and base theme | `@blueprintjs/core/lib/css/blueprint.css` |
| `@blueprintjs/icons` | Icon React components, icon names, dynamic icon loader, SVG paths, and icon font styles | `@blueprintjs/icons/lib/css/blueprint-icons.css` only when icon-font CSS is needed |
| `@blueprintjs/datetime` | Date, date-range, time, and timezone selection | `@blueprintjs/datetime/lib/css/blueprint-datetime.css` |
| `@blueprintjs/select` | Select, Suggest, MultiSelect, Omnibar, and QueryList | `@blueprintjs/select/lib/css/blueprint-select.css` |
| `@blueprintjs/table` | Virtualized spreadsheet-like table UI | `@blueprintjs/table/lib/css/table.css` |
| `@blueprintjs/colors` | Programmatic and Sass color palette | no component stylesheet |
| `@blueprintjs/labs` | Experimental layout primitives such as Box and Flex | inspect installed package; Labs APIs may change faster |

Blueprint packages have independent patch/minor versions. Keep their major versions aligned. When adding an extension package, confirm its peer dependency on Core.

## Installation

Minimum base installation:

```bash
pnpm add @blueprintjs/core react react-dom
```

Typical full-featured desktop application:

```bash
pnpm add \
  @blueprintjs/core \
  @blueprintjs/icons \
  @blueprintjs/datetime \
  @blueprintjs/select \
  @blueprintjs/table \
  react react-dom
```

TypeScript projects should have compatible React types:

```bash
pnpm add -D @types/react @types/react-dom
```

Do not install all packages by default. Add `datetime`, `select`, and `table` only when used.

## Required CSS

For ESM bundlers:

```ts
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css"; // only if icon-font support is needed
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/table/lib/css/table.css";
```

Rules:

- Load `normalize.css` before Blueprint Core.
- Load Core before extension-package CSS.
- Load each stylesheet once at the application entry or global layout.
- Do not import package CSS inside leaf components; it creates ordering and duplication problems.
- Static SVG icon components do not require icon-font CSS. String icon names may use the dynamic SVG loader; icon-font classes require the icons stylesheet.
- If a component renders structurally but looks unstyled, first audit stylesheet presence and order.

Read `references/01-foundations-and-styling.md` for Sass, custom namespaces, dark theme, variables, colors, and typography.

## Root providers

For applications that use overlays, portals, or hotkeys broadly, wrap the root with `BlueprintProvider`:

```tsx
import { BlueprintProvider } from "@blueprintjs/core";

export function AppRoot() {
  return (
    <BlueprintProvider>
      <App />
    </BlueprintProvider>
  );
}
```

`BlueprintProvider` composes portal, overlay-stack, and hotkey providers. Use explicit provider props only when the application needs a custom portal container, portal class, hotkey dialog, or hotkey context value.

Do not assume `BlueprintProvider` toggles dark mode. Dark theme is class-based. Apply `Classes.DARK` to an ancestor that encloses the relevant UI, and ensure portaled content inherits or receives the dark class.

## Focus-style setup

Enable keyboard-sensitive focus outlines once at application startup:

```ts
import { FocusStyleManager } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();
```

This hides most focus outlines during mouse interaction and restores them when keyboard navigation begins. Never remove focus indicators with global CSS. Use `Classes.FOCUS_STYLE_MANAGER_IGNORE` only for a subtree that must always show focus.

## Current v6 modernization rules

Prefer the modern API on new code:

```tsx
<Button size="large" variant="minimal" endIcon="arrow-right" />
```

Avoid compatibility props unless maintaining unchanged legacy code:

```tsx
// Do not introduce these in new v6 code.
<Button large minimal rightIcon="arrow-right" />
```

General migration preferences:

- `size="small" | "medium" | "large"` instead of deprecated `small` or `large` booleans where the component exposes `size`.
- `variant="solid" | "minimal" | "outlined"` instead of deprecated `minimal` or `outlined` booleans where available.
- `endIcon` instead of deprecated `rightIcon`.
- `Overlay2` instead of deprecated `Overlay`.
- `PopoverNext` instead of deprecated `Popover` for new work.
- Prefer current unsuffixed components when source marks legacy aliases or `*2` compatibility APIs deprecated; verify installed declarations because naming transitions differ by package.
- Prefer icon components ending in `Icon`, such as `DownloadIcon`; unsuffixed icon component exports are compatibility aliases planned for removal in a later major.

Do not mechanically replace an overlay or popover without checking focus return, portal container, positioning, backdrop, controlled state, interaction kind, and nested dismiss behavior.

## Shared API vocabulary

Blueprint components repeatedly use these concepts:

### Intent

`Intent` communicates semantic status through color:

- `none`: neutral/default action.
- `primary`: selected or primary action, not merely decorative blue.
- `success`: completed or valid state.
- `warning`: caution, degraded state, or action requiring attention.
- `danger`: destructive action, invalid state, failure, or serious risk.

Use intent as a semantic signal. Do not use multiple competing primary intents in the same local action group.

### Size

Prefer the `Size` model where supported:

- `small`: compact, secondary, or dense control.
- `medium`: default.
- `large`: prominent or touch-friendlier control.

Maintain consistent heights inside `ControlGroup`, toolbars, and button groups.

### Variant

For buttons and related controls:

- `solid`: strongest visual weight and default filled appearance.
- `outlined`: medium emphasis without fill.
- `minimal`: lowest visual weight; useful in toolbars and icon actions.

Variant classes can cascade from parent groups. A descendant may be unable to override a modifier applied by an ancestor. Set group-level modifiers only when every child should share them.

### Elevation

Elevation is a visual hierarchy, not decoration. Use low elevation for cards and panels, higher elevation for floating surfaces. Avoid stacking multiple strong shadows.

### Alignment and position

Use Blueprint enums or supported string unions. Distinguish text alignment from overlay placement. In PopoverNext, prefer `placement` because it matches Floating UI semantics.

### Controlled and uncontrolled state

Use one model consistently:

```tsx
// Controlled
<Tabs selectedTabId={selected} onChange={setSelected} />

// Uncontrolled
<Tabs defaultSelectedTabId="overview" />
```

Do not pass both controlled and default props. Controlled mode is preferred when state affects routing, persistence, validation, analytics, permissions, or other components.

## Component-selection rules

Choose the narrowest component that matches the interaction.

- Native semantic element with Blueprint styling: HTML wrappers or CSS classes.
- One action: `Button` or `AnchorButton`.
- Several related actions: `ButtonGroup`.
- Binary setting: `Switch`; agreement or independent selection: `Checkbox`; exclusive set: `RadioGroup`.
- Small finite exclusive modes: `SegmentedControl`; navigable content sections: `Tabs`.
- Simple native choice with modest options: `HTMLSelect`; searchable custom choice: `Select` or `Suggest`.
- Multiple searchable choices: `MultiSelect`; application-wide command/search: `Omnibar`.
- Brief explanation: `Tooltip`; interactive floating content: `PopoverNext`; blocking workflow: `Dialog`; edge panel: `Drawer`; destructive confirmation: `Alert`.
- Inline notice: `Callout`; temporary notification: `OverlayToaster`/toast.
- Semantic list of actions: `Menu`; global app navigation: `Navbar`; hierarchical data: `Tree`.
- Small semantic HTML table: `HTMLTable`; large interactive grid: `@blueprintjs/table`.
- Empty/error/loading placeholder: `NonIdealState`; content placeholder during fetch: `Skeleton`; operation progress: `ProgressBar` or `Spinner`.

Never use a complex custom component when a native control provides better semantics and adequate UX.

## Core component families

The complete component-by-component guide is split across references:

- Content, navigation, layout, display, feedback, and utilities: `references/02-core-components.md`
- Form controls and inputs: `references/03-forms-and-inputs.md`
- Overlays, portals, context menus, hotkeys, providers, and hooks: `references/04-overlays-context-hotkeys.md`

Load only the relevant reference for the task, but use `references/11-public-api-inventory.md` during broad audits or migrations.

## Forms: implementation standard

Every form control must have:

- A visible label or an explicit accessible name.
- A stable controlled/uncontrolled model.
- Error state that is conveyed through text, not intent color alone.
- Appropriate `disabled`, `required`, `readOnly`, `autoComplete`, and input-mode attributes.
- Validation timing chosen for the workflow; do not show errors before the user has had a reasonable chance to enter a value.
- Keyboard-operable supplementary controls.

Preferred structure:

```tsx
<FormGroup
  label="Project name"
  labelFor="project-name"
  helperText={error ?? "Use a unique, descriptive name."}
  intent={error ? "danger" : "none"}
>
  <InputGroup
    id="project-name"
    value={name}
    onValueChange={setName}
    intent={error ? "danger" : "none"}
    aria-invalid={error != null}
  />
</FormGroup>
```

Use `onValueChange` where the component provides it; it avoids extracting values repeatedly from synthetic events. Use native `onChange` when DOM event data is required.

## Overlay standard

Every overlay design must explicitly decide:

- Trigger and interaction kind.
- Controlled or uncontrolled open state.
- Whether Escape closes it.
- Whether outside clicks close it.
- Whether it auto-focuses and enforces focus.
- Where focus returns after closing.
- Whether a backdrop is required.
- Whether content is portaled and into which container.
- How dark theme reaches the portal.
- How nested popovers dismiss.
- Whether lazy rendering is acceptable.
- Whether the surface is a tooltip, menu, dialog, drawer, or non-modal popover semantically.

`PopoverNext` uses Floating UI. Prefer `placement`, `boundary`, `rootBoundary`, `positioningStrategy`, and `middleware` over legacy Popper-specific tuning.

Read `references/04-overlays-context-hotkeys.md` before migrating `Popover` to `PopoverNext`.

## Select standard

Blueprint Select components are generic and data-agnostic. Define these contracts first:

```tsx
type Item = {
  id: string;
  label: string;
  disabled?: boolean;
};

const itemRenderer: ItemRenderer<Item> = (item, { handleClick, handleFocus, modifiers }) => (
  <MenuItem
    key={item.id}
    text={item.label}
    disabled={modifiers.disabled}
    active={modifiers.active}
    onClick={handleClick}
    onFocus={handleFocus}
    roleStructure="listoption"
  />
);
```

Mandatory decisions:

- Stable equality via `itemsEqual="id"` or a comparator when item objects are recreated.
- `itemPredicate` for per-item filtering or `itemListPredicate` for whole-list ranking/fuzzy search.
- Efficient `itemRenderer` with stable callbacks.
- `itemDisabled` for unavailable items.
- `noResults` with correct list-option role structure.
- `onItemSelect` behavior and whether query resets.
- Whether active item and query are controlled.
- Whether item creation is allowed and how pasted items are handled.

Read `references/06-select.md` for exact generic contracts and recipes.

## Date/time standard

Treat date values, displayed text, timezone, and locale as separate concerns.

- Store the product's canonical temporal value explicitly.
- Decide whether a selected date represents a calendar day, local datetime, or instant.
- Define `minDate`, `maxDate`, disabled-day rules, precision, and nullable behavior.
- Use explicit parsing and formatting contracts for text inputs.
- Avoid silently converting between local time and UTC.
- For ranges, define partial-range behavior, ordering, overlap constraints, and shortcut semantics.
- Use `TimezoneSelect` for IANA timezone selection, not arbitrary abbreviations.

Read `references/05-datetime.md` before implementing or migrating date inputs.

## Table standard

Blueprint Table is data-agnostic. The application owns data mutation, sorting, filtering, persistence, and validation.

Core architecture:

```tsx
<Table2 numRows={rows.length} cellRendererDependencies={[rows]}>
  <Column
    name="Name"
    cellRenderer={(rowIndex) => <Cell>{rows[rowIndex].name}</Cell>}
  />
</Table2>
```

Before implementation, define:

- Row identity and mapping from visual index to data index.
- Column definitions and renderer dependencies.
- Selection cardinalities and controlled selected regions.
- Focused-cell behavior and keyboard interaction.
- Editing commit/cancel/validation lifecycle.
- Sorting state and stable sorting.
- Column and row resizing/reordering persistence.
- Frozen rows/columns.
- Loading granularity.
- Copy/context-menu behavior.
- Virtualization-safe rendering and memoization.

When renderers close over changing data, include the relevant values in `cellRendererDependencies` or restructure renderers so table cells update correctly.

Read `references/07-table.md` for the full architecture and feature guide.

## Icon standard

Preferred strategy for most modern bundles: statically import only icons used.

```tsx
import { Button } from "@blueprintjs/core";
import { DownloadIcon } from "@blueprintjs/icons";

<Button icon={<DownloadIcon size={16} />} text="Download" />;
```

String icon names are convenient but require the icon loader:

```tsx
<Button icon="download" text="Download" />
```

Do not import `IconSvgPaths16` or `IconSvgPaths20` casually; those named imports statically load all path modules. Choose static components, dynamic chunks, eager all-icon loading, or custom lazy loading intentionally.

Read `references/08-icons-colors-labs.md` for bundler-specific icon loading.

## Styling standard

- Prefer component props over modifier CSS classes.
- Add application-owned class names and target them in CSS.
- Never hardcode `.bp6-*` in TypeScript or tests. Use `Classes` constants.
- In Sass, use the exported namespace variable when targeting Blueprint internals.
- Do not rely on undocumented descendant structure unless the design cannot be achieved through props or a wrapper.
- Treat Blueprint's rendered HTML structure and public CSS as semver-covered, but still minimize coupling.
- Use the 4px spacing variable/grid for custom components.
- Use semantic color aliases rather than arbitrary palette values for product states.
- Scope overrides under an application-owned class to prevent global regressions.

## Accessibility standard

Blueprint supplies many ARIA attributes, keyboard handlers, and focus behaviors, but the application must provide context.

Always verify:

- Accessible name for icon-only controls.
- Correct native element or role.
- Visible and programmatic label association.
- Keyboard reachability and activation.
- Focus order and focus return after overlays.
- Error text association.
- Color contrast and non-color status indicators.
- Tooltip content is supplementary, not the only source of required information.
- Menus are used for actions, not arbitrary form layouts.
- Popover target receives all injected handlers and ARIA props.
- Table keyboard mode is appropriate and documented to users when complex.
- Disabled elements do not hide essential explanation; wrap disabled controls when a tooltip is needed.

## SSR and hydration

Blueprint supports server-side rendering, but browser-only behavior must be gated:

- Do not access `window`, `document`, `HTMLElement`, or portal containers during server render.
- Configure custom portal containers after mount.
- Keep server and client class/theme output consistent.
- Avoid random IDs or non-deterministic initial selection.
- Lazy overlays are preferable when their content depends on browser APIs.
- Verify hydration with dark theme and root providers enabled.

## Performance standard

- Memoize expensive item predicates, renderers, and table column definitions when profiling shows value.
- Avoid rendering thousands of MenuItems or Tree nodes without virtualization/pagination.
- Blueprint Table virtualizes cells, but cell renderers can still be expensive.
- Keep `cellRendererDependencies` precise; changing a broad object every render can invalidate all visible cells.
- Prefer `itemListPredicate` for one-pass ranked search rather than repeating expensive work per item.
- Use `ResizeSensor` only when CSS/container queries cannot solve the problem.
- Avoid large all-icon bundles unless network architecture justifies them.
- Lazy-render heavy dialog/popover content when closed state does not require it.
- Profile before adding memoization that complicates code.

## Testing standard

Use Testing Library-style behavioral tests:

- Query by role, accessible name, label text, or visible text.
- Test keyboard interactions with realistic user events.
- Test controlled callbacks and resulting state.
- Test focus movement and restoration for overlays.
- Test portal content through `document.body` or configured container.
- Test dark theme at the rendered ancestor/portal, not by snapshotting every class.
- Test tables through visible cells, selection callbacks, editing outcomes, and copy behavior.
- Avoid snapshots of large Blueprint DOM trees.
- Use `Classes` constants only when a class is the actual public behavior under test.

## Debugging sequence

When a Blueprint component fails:

1. Confirm package versions and React peer compatibility.
2. Confirm CSS imports and order.
3. Check browser console for missing icon chunks, portal errors, controlled/uncontrolled warnings, or invalid DOM props.
4. Reduce to the component with minimal props.
5. Verify state ownership and callback signatures.
6. Check portal container, stacking context, overflow clipping, and dark-theme inheritance.
7. Check disabled ancestors and event propagation.
8. Check item equality/renderers for Select.
9. Check renderer dependencies and row/column indices for Table.
10. Compare against the installed TypeScript declarations.

## Migration workflow

For a broad Blueprint upgrade:

1. Record all installed `@blueprintjs/*` versions.
2. Upgrade to the newest patch within the current major first.
3. Eliminate deprecation warnings before crossing a major.
4. Search for compatibility props and APIs:
   - `small`, `large`, `minimal`, `outlined`, `rightIcon`
   - `Overlay`, `Popover`
   - legacy icon exports without `Icon` suffix
   - hardcoded `bp5-`, `bp4-`, or older namespaces
   - old ReactDOM render APIs
   - old package names removed or merged in current versions
5. Update CSS namespace assumptions and Sass imports.
6. Audit all overlays for changed focus behavior and positioning.
7. Audit icon loading and chunks.
8. Run typecheck, unit tests, visual regression, keyboard checks, and smoke tests.
9. Remove compatibility shims only after behavior is verified.

Read `references/10-testing-performance-migration.md` for a systematic migration matrix.

## Included audit utilities

Run these from the target repository when the skill directory is locally available:

```bash
node /path/to/blueprintjs-development-skill/scripts/audit-blueprint.mjs
node /path/to/blueprintjs-development-skill/scripts/scan-blueprint-usage.mjs src app components
```

The version audit resolves installed Blueprint and React packages and warns about mixed majors. The usage scanner reports heuristic migration candidates; it never edits code and its findings require manual review.

## Required output from this skill

When implementing Blueprint code, produce:

1. Exact package imports.
2. Required CSS/import changes when relevant.
3. Complete TypeScript types for domain items and component state.
4. Accessible labels and ARIA attributes.
5. Controlled-state logic where product behavior depends on state.
6. Error/loading/empty states.
7. Tests for important interaction behavior.
8. A short note for any deprecated API retained intentionally.

When reviewing code, report issues in this order:

1. Runtime correctness.
2. Accessibility and focus.
3. Deprecated or wrong-major API.
4. State and data-flow defects.
5. CSS/theme/portal defects.
6. Performance.
7. Maintainability and consistency.

## Deep references

Load the narrowest applicable file:

- Foundations, installation, styling, accessibility: `references/01-foundations-and-styling.md`
- Core components: `references/02-core-components.md`
- Forms and inputs: `references/03-forms-and-inputs.md`
- Overlays, providers, hotkeys: `references/04-overlays-context-hotkeys.md`
- Date/time: `references/05-datetime.md`
- Select: `references/06-select.md`
- Table: `references/07-table.md`
- Icons, colors, Labs: `references/08-icons-colors-labs.md`
- Copy-ready recipes: `references/09-recipes.md`
- Testing, performance, migration: `references/10-testing-performance-migration.md`
- Public API and coverage inventory: `references/11-public-api-inventory.md`
- Official source map: `references/12-official-source-map.md`
