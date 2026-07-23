# Official source map and verification workflow

This file maps every area of the skill to official Blueprint sources. It is designed for future maintenance and for resolving patch-version questions without relying on third-party examples.

## 1. Primary entry points

- Documentation: `https://blueprintjs.com/docs/`
- LLM/documentation index: `https://blueprintjs.com/llms.txt`
- Official repository: `https://github.com/palantir/blueprint`
- Repository documentation index: `https://github.com/palantir/blueprint/blob/develop/llms.txt`
- Releases: `https://github.com/palantir/blueprint/releases`
- NPM organization scope: `https://www.npmjs.com/org/blueprintjs`

Prefer the installed package for exact application behavior, then current official docs/source.

## 2. Overview documentation links

- Quick Start: `https://blueprintjs.com/docs/#blueprint.quick-start`
- Getting Started: `https://blueprintjs.com/docs/#blueprint/getting-started`
- Reading the Docs: `https://blueprintjs.com/docs/#blueprint/reading-the-docs`
- Principles: `https://blueprintjs.com/docs/#blueprint/principles`

Repository sources commonly live under:

- `packages/docs-app/src/getting-started.mdx`
- `packages/docs-app/src/reading-the-docs.mdx`
- `packages/docs-app/src/principles.mdx`

## 3. Core foundation links

- Accessibility: `https://blueprintjs.com/docs/#core/accessibility`
- Classes: `https://blueprintjs.com/docs/#core/classes`
- Colors: `https://blueprintjs.com/docs/#core/colors`
- Typography: `https://blueprintjs.com/docs/#core/typography`
- Variables: `https://blueprintjs.com/docs/#core/variables`

Repository areas:

- `packages/core/src/docs/`
- `packages/core/src/accessibility/`
- `packages/core/src/common/`
- `packages/colors/`

## 4. Core component links

- Breadcrumbs: `https://blueprintjs.com/docs/#core/components/breadcrumbs`
- Buttons: `https://blueprintjs.com/docs/#core/components/buttons`
- Button Group: `https://blueprintjs.com/docs/#core/components/button-group`
- Callout: `https://blueprintjs.com/docs/#core/components/callout`
- Card: `https://blueprintjs.com/docs/#core/components/card`
- Card List: `https://blueprintjs.com/docs/#core/components/card-list`
- Control Card: `https://blueprintjs.com/docs/#core/components/control-card`
- Collapse: `https://blueprintjs.com/docs/#core/components/collapse`
- Divider: `https://blueprintjs.com/docs/#core/components/divider`
- Editable Text: `https://blueprintjs.com/docs/#core/components/editable-text`
- Entity Title: `https://blueprintjs.com/docs/#core/components/entity-title`
- HTML Elements: `https://blueprintjs.com/docs/#core/components/html`
- HTML Table: `https://blueprintjs.com/docs/#core/components/html-table`
- Hotkeys Target: `https://blueprintjs.com/docs/#core/components/hotkeys-target`
- Icon: `https://blueprintjs.com/docs/#core/components/icon`
- Link: `https://blueprintjs.com/docs/#core/components/link`
- Menu: `https://blueprintjs.com/docs/#core/components/menu`
- Navbar: `https://blueprintjs.com/docs/#core/components/navbar`
- Non-ideal State: `https://blueprintjs.com/docs/#core/components/non-ideal-state`
- Overflow List: `https://blueprintjs.com/docs/#core/components/overflow-list`
- Panel Stack: `https://blueprintjs.com/docs/#core/components/panel-stack`
- Progress Bar: `https://blueprintjs.com/docs/#core/components/progress-bar`
- Resize Sensor: `https://blueprintjs.com/docs/#core/components/resize-sensor`
- Section: `https://blueprintjs.com/docs/#core/components/section`
- Skeleton: `https://blueprintjs.com/docs/#core/components/skeleton`
- Spinner: `https://blueprintjs.com/docs/#core/components/spinner`
- Tabs: `https://blueprintjs.com/docs/#core/components/tabs`
- Tag: `https://blueprintjs.com/docs/#core/components/tag`
- Compound Tag: `https://blueprintjs.com/docs/#core/components/compound-tag`
- Text: `https://blueprintjs.com/docs/#core/components/text`
- Tree: `https://blueprintjs.com/docs/#core/components/tree`

Repository source root:

- `packages/core/src/components/`
- public export inventory: `packages/core/src/components/index.ts`

## 5. Form control links

- Form Group: `https://blueprintjs.com/docs/#core/components/form-group`
- Control Group: `https://blueprintjs.com/docs/#core/components/control-group`
- Label: `https://blueprintjs.com/docs/#core/components/label`
- Checkbox: `https://blueprintjs.com/docs/#core/components/checkbox`
- Radio: `https://blueprintjs.com/docs/#core/components/radio`
- HTML Select: `https://blueprintjs.com/docs/#core/components/html-select`
- Segmented Control: `https://blueprintjs.com/docs/#core/components/segmented-control`
- Sliders: `https://blueprintjs.com/docs/#core/components/sliders`
- Switch: `https://blueprintjs.com/docs/#core/components/switch`

## 6. Form input links

- Input Group: `https://blueprintjs.com/docs/#core/components/input-group`
- Text Area: `https://blueprintjs.com/docs/#core/components/text-area`
- File Input: `https://blueprintjs.com/docs/#core/components/file-input`
- Numeric Input: `https://blueprintjs.com/docs/#core/components/numeric-input`
- Tag Input: `https://blueprintjs.com/docs/#core/components/tag-input`

Repository forms area:

- `packages/core/src/components/forms/`
- `packages/core/src/components/tag-input/`
- `packages/core/src/components/slider/`
- `packages/core/src/components/control-card/`

## 7. Overlay links

- Overlay: `https://blueprintjs.com/docs/#core/components/overlay`
- Overlay2: `https://blueprintjs.com/docs/#core/components/overlay2`
- Portal: `https://blueprintjs.com/docs/#core/components/portal`
- Alert: `https://blueprintjs.com/docs/#core/components/alert`
- Context Menu: `https://blueprintjs.com/docs/#core/components/context-menu`
- Context Menu Popover: `https://blueprintjs.com/docs/#core/components/context-menu-popover`
- Dialog: `https://blueprintjs.com/docs/#core/components/dialog`
- Drawer: `https://blueprintjs.com/docs/#core/components/drawer`
- Popover: `https://blueprintjs.com/docs/#core/components/popover`
- PopoverNext: `https://blueprintjs.com/docs/#core/components/popover-next`
- Toast: `https://blueprintjs.com/docs/#core/components/toast`
- Tooltip: `https://blueprintjs.com/docs/#core/components/tooltip`

Repository areas:

- `packages/core/src/components/overlay/`
- `packages/core/src/components/overlay2/`
- `packages/core/src/components/popover/`
- `packages/core/src/components/popover-next/`
- `packages/core/src/components/dialog/`
- `packages/core/src/components/drawer/`
- `packages/core/src/components/toast/`
- `packages/core/src/components/tooltip/`
- `packages/core/src/components/context-menu/`

## 8. Provider and hook links

- Blueprint Provider: `https://blueprintjs.com/docs/#core/context/blueprint-provider`
- Hotkeys Provider: `https://blueprintjs.com/docs/#core/context/hotkeys-provider`
- Overlays Provider: `https://blueprintjs.com/docs/#core/context/overlays-provider`
- Portal Provider: `https://blueprintjs.com/docs/#core/context/portal-provider`
- useHotkeys: `https://blueprintjs.com/docs/#core/hooks/use-hotkeys`
- useOverlayStack: `https://blueprintjs.com/docs/#core/hooks/use-overlay-stack`

Repository areas:

- `packages/core/src/context/`
- `packages/core/src/hooks/`

## 9. DateTime links

- Date Picker: `https://blueprintjs.com/docs/#datetime/date-picker`
- Date Input: `https://blueprintjs.com/docs/#datetime/date-input`
- Date Range Picker: `https://blueprintjs.com/docs/#datetime/date-range-picker`
- Date Range Input: `https://blueprintjs.com/docs/#datetime/date-range-input`
- Time Picker: `https://blueprintjs.com/docs/#datetime/timepicker`
- Timezone Select: `https://blueprintjs.com/docs/#datetime/timezone-select`

Repository:

- `packages/datetime/src/`
- public exports: `packages/datetime/src/index.ts`
- package metadata: `packages/datetime/package.json`

## 10. Icons links

- Loading Icons: `https://blueprintjs.com/docs/#icons/loading-icons`
- Icons List: `https://blueprintjs.com/docs/#icons/icons-list`

Repository:

- `packages/icons/src/`
- loading guide: `packages/icons/src/loading-icons.mdx`
- public exports: `packages/icons/src/index.ts`

## 11. Select links

- Select: `https://blueprintjs.com/docs/#select/select-component`
- Suggest: `https://blueprintjs.com/docs/#select/suggest`
- Multi Select: `https://blueprintjs.com/docs/#select/multi-select`
- Omnibar: `https://blueprintjs.com/docs/#select/omnibar`
- Query List: `https://blueprintjs.com/docs/#select/query-list`

Repository:

- `packages/select/src/`
- public exports: `packages/select/src/index.ts`
- components exports: `packages/select/src/components/index.ts`
- shared list contract: `packages/select/src/common/listItemsProps.ts`

## 12. Table links

- Features: `https://blueprintjs.com/docs/#table/features`
- API: `https://blueprintjs.com/docs/#table/api`

Repository:

- `packages/table/src/`
- public exports: `packages/table/src/index.ts`
- features documentation: `packages/table/src/docs/table-features.mdx`
- package metadata: `packages/table/package.json`

## 13. Labs links

- Box: `https://blueprintjs.com/docs/#labs/box`
- Flex: `https://blueprintjs.com/docs/#labs/flex`

Repository:

- `packages/labs/src/`
- public exports: `packages/labs/src/index.ts`
- component exports: `packages/labs/src/components/index.ts`

## 14. Installed-package verification commands

### Versions

```bash
node -p "require('@blueprintjs/core/package.json').version"
node -p "require('@blueprintjs/icons/package.json').version"
node -p "require('@blueprintjs/datetime/package.json').version"
node -p "require('@blueprintjs/select/package.json').version"
node -p "require('@blueprintjs/table/package.json').version"
```

### Public type search

```bash
rg 'export .*PopoverNext' node_modules/@blueprintjs/core/lib/esm
rg '@deprecated' node_modules/@blueprintjs/core/lib/esm
rg 'interface SelectProps' node_modules/@blueprintjs/select/lib/esm
rg 'interface Table.*Props' node_modules/@blueprintjs/table/lib/esm
```

### Styles

```bash
ls node_modules/@blueprintjs/core/lib/css
ls node_modules/@blueprintjs/select/lib/css
ls node_modules/@blueprintjs/datetime/lib/css
ls node_modules/@blueprintjs/table/lib/css
```

## 15. How to resolve a documentation/source mismatch

1. Record the installed package version.
2. Read its `package.json` peer dependencies.
3. Read its `lib/esm/*.d.ts` public declaration.
4. Check the same tag/commit in the official repository when possible.
5. Compare current online docs only after identifying version drift.
6. Follow installed behavior for the current project.
7. Plan an upgrade separately if the desired API exists only in a newer release.

Do not import from `src/` in node_modules to obtain an API missing from the package root. That API is not part of the supported public package contract.

## 16. Source-review metadata

Skill review date: `2026-07-23`.

Observed current package metadata during review included:

- `@blueprintjs/core` 6.17.2;
- `@blueprintjs/select` 6.3.3;
- `@blueprintjs/datetime` 6.2.3;
- `@blueprintjs/table` 6.2.3;
- Core peer support for React/React DOM 18 or 19.

These values are a review snapshot, not version pins. Always inspect the target project and current official releases before upgrading.
