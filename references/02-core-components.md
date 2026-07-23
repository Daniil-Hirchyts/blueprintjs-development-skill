# Core component reference

This file is a practical guide to the documented Core component family plus important public exports that are easy to miss in the navigation. Exact prop names may evolve within Blueprint 6.x; use installed TypeScript declarations for patch-level truth.

## How to use each entry

Each component entry covers:

- **Use for**: the product interaction it models.
- **Key decisions**: state, structure, and important API concepts.
- **Avoid**: common misuse.
- **Accessibility and testing**: behavior the application must verify.

## Breadcrumb and Breadcrumbs

**Use for:** showing a hierarchical location path and allowing navigation to ancestors.

Key decisions:

- Model each breadcrumb as data containing text, href or click action, icon, disabled/current state, and optional metadata.
- Use `Breadcrumbs` when the path can overflow; it measures available width and collapses items into an overflow menu.
- Supply stable keys and deterministic ordering.
- Mark the final item as current when it represents the displayed location.
- Use a link when navigation changes URL; use a button/action only for non-navigation behavior.
- Keep labels concise. Long labels should be ellipsized or exposed through title/tooltip behavior.

Avoid:

- using breadcrumbs as the only page title;
- putting unrelated actions in the trail;
- making every item non-semantic clickable text;
- assuming the overflow renderer handles domain-specific permissions automatically.

Test resizing, keyboard navigation, current-page semantics, and overflow menu item order.

## Button and AnchorButton

**Use for:** a discrete action (`Button`) or link-style navigation rendered with button appearance (`AnchorButton`).

Current v6 concepts:

- `intent`: semantic status/emphasis;
- `variant`: `solid`, `outlined`, or `minimal`;
- `size`: `small`, `medium`, or `large`;
- `icon` and `endIcon`;
- `loading`: displays a spinner and disables interaction without changing width;
- `active`, `disabled`, `fill`, `round`, `alignText`, `ellipsizeText`;
- native button attributes, including `type`.

Use `type="button"` for non-submit actions inside forms. Blueprint defaults Button to button behavior, but explicit intent improves reviewability.

```tsx
<Button
  type="submit"
  intent="primary"
  loading={saving}
  disabled={!isValid}
  text="Save changes"
/>
```

Use `AnchorButton` when the action is genuinely navigation:

```tsx
<AnchorButton href="/reports/export" icon="download" text="Export center" />
```

Avoid:

- disabled links without an alternate explanation;
- icon-only buttons without `aria-label`;
- multiple solid primary buttons in one local action group;
- toggles that fail to expose `aria-pressed` or equivalent state;
- introducing deprecated `small`, `large`, `minimal`, `outlined`, or `rightIcon` props in new code.

Test Enter/Space activation, disabled and loading behavior, form submission, focus visibility, and accessible name.

## ButtonGroup

**Use for:** a visually related set of actions or a compact toolbar segment.

Key decisions:

- Keep actions conceptually related.
- Choose horizontal or vertical orientation intentionally.
- Use `fill` only when equal-width expansion supports the layout.
- Group-level size or variant may cascade to children; do not rely on child overrides.
- Use proper toggle semantics for selectable buttons.
- Use `role="toolbar"` with an accessible label when the group functions as a toolbar.

Avoid using a ButtonGroup as a replacement for `SegmentedControl` when exactly one compact mode must be selected.

## Callout

**Use for:** persistent inline information, warnings, errors, or contextual guidance.

Key decisions:

- Choose intent based on meaning, not decoration.
- Use a short title and concise body.
- Add an icon only when it reinforces the message.
- Include a direct recovery action for actionable errors.
- Use an appropriate live region outside the Callout when the message appears dynamically and must be announced.

Avoid using Callout for transient success messages that belong in a toast or for every neutral paragraph.

## Card

**Use for:** a bounded content region or interactive summary surface.

Key decisions:

- Set elevation based on hierarchy.
- Make the entire card interactive only when it has one unambiguous destination/action.
- When interactive, provide keyboard activation and a clear accessible name.
- Keep nested controls from accidentally triggering the card action.
- Use `compact` or padding-related APIs only when the density is consistent with adjacent UI.

Prefer semantic inner structure: heading, metadata, body, and actions.

Avoid excessive elevation, nested interactive cards, and click handlers on non-focusable card containers.

## CardList

**Use for:** a vertically stacked set of card-like rows inside a bounded list.

Key decisions:

- Use stable item keys.
- Make selection state explicit.
- Preserve list semantics where appropriate.
- For very large datasets, use a virtualized list instead of rendering thousands of cards.
- Keep row actions visible or discoverable by keyboard, not hover-only.

## Control cards: CheckboxCard, RadioCard, SwitchCard

**Use for:** a larger selectable surface whose control and supporting description belong together.

Key decisions:

- `CheckboxCard`: independent or multiple selection.
- `RadioCard`: one item in an exclusive group.
- `SwitchCard`: a setting that takes effect as an on/off state.
- Make the label and description part of the clickable target.
- Keep nested links/actions from toggling the control unintentionally.
- Use controlled state when selections affect other sections or persistence.

See `03-forms-and-inputs.md` for detailed form guidance.

## Collapse

**Use for:** showing or hiding a section with an animated height transition.

Key decisions:

- The trigger is application-owned; connect it with `aria-expanded` and `aria-controls`.
- Decide whether hidden content should remain mounted.
- Avoid putting critical error messages in a collapsed region without a visible summary.
- Preserve focus: do not collapse a region while focus remains inside without moving focus deliberately.
- Avoid nested animations that cause layout thrashing.

## Divider

**Use for:** a visual separator between adjacent groups.

Key decisions:

- Use horizontal or vertical orientation to match layout.
- A purely decorative divider should not add unnecessary screen-reader noise.
- Use spacing and headings before adding many dividers.

## EditableText

**Use for:** lightweight inline editing where read and edit states occupy the same location.

Key decisions:

- Decide controlled versus uncontrolled value.
- Handle confirm, cancel, blur, and Enter/Escape behavior explicitly.
- Provide placeholder and accessible label when the displayed content can be empty.
- Validate before committing and expose errors near the field.
- Consider `multiline` only when inline expansion will not destabilize the layout.
- Preserve a non-editing fallback for read-only or permission-restricted users.

Avoid using EditableText for complex forms, destructive data, or values requiring multiple validation messages.

## EntityTitle

**Use for:** a consistent title block representing an entity with icon/avatar, heading, subtitle, and tags or supplementary metadata.

Key decisions:

- Select the correct heading level for the page hierarchy.
- Truncate long names without hiding the full value from assistive technology.
- Keep status tags concise.
- Do not overload the title block with primary actions; place actions in an adjacent toolbar.

## HTML wrappers

Public wrappers include `H1`–`H6`, `Blockquote`, `Code`, `Pre`, `Label`, `OL`, and `UL`.

**Use for:** semantic native elements with Blueprint typography and spacing.

Rules:

- Preserve heading hierarchy.
- Use `Code` for inline code and `Pre` for preformatted blocks.
- Use `Label` for a real form relationship, not generic bold text.
- Prefer native semantics over a `div` with a typography class.

## HTMLTable

**Use for:** small or moderate semantic tabular data rendered as a normal HTML table.

Key decisions:

- Use `<thead>`, `<tbody>`, `<th scope>`, and `<caption>` as appropriate.
- Use striped, bordered, compact, or interactive styling only when it improves scanability.
- Keep sortable headers as buttons within header cells and expose sort state through `aria-sort`.
- For large, frozen, selectable, or editable grids, use `@blueprintjs/table` instead.
- On narrow screens, design a horizontal-scroll or alternate presentation instead of destroying table semantics.

## HotkeysTarget and hotkey components

The hotkey subsystem exports target utilities/components in addition to the `useHotkeys` hook.

**Use for:** registering discoverable keyboard shortcuts bound to a component or application scope.

Key decisions:

- Avoid overriding browser and assistive-technology shortcuts.
- Do not require shortcuts for essential actions; provide visible controls.
- Scope handlers to the relevant view.
- Disable or modify shortcuts while text input is active when appropriate.
- Include a human-readable label and group for the hotkey dialog.
- Test platform-specific modifiers.

Prefer `useHotkeys` in function components. See `04-overlays-context-hotkeys.md`.

## Icon

**Use for:** rendering a Blueprint SVG icon by name or icon component.

Key decisions:

- Decorative icons should be hidden from accessibility APIs.
- Meaningful icon-only actions need an accessible name on the action, not merely the SVG.
- Prefer static suffixed icon component imports for predictable tree-shaking.
- Match icon size to the surrounding control.
- Do not use icons as the sole indicator of unfamiliar domain concepts without a label or tooltip.

See `08-icons-colors-labs.md` for loading strategies.

## Link

**Use for:** Blueprint-styled navigation with optional iconography.

Key decisions:

- Use a valid `href` for navigation.
- Use a button for mutations and in-place commands.
- When opening a new tab, communicate that behavior when it may surprise the user and use safe `rel` handling as appropriate.
- Ensure inline links remain visually distinguishable from surrounding text.

## Menu, MenuItem, and MenuDivider

**Use for:** a vertical list of commands, choices, or navigation entries, commonly inside `PopoverNext`, context menus, and select-like surfaces.

Key decisions:

- `MenuItem` can contain text, icon, label text, shortcuts, children/submenus, active/disabled state, and links/actions.
- Use `roleStructure` or menu/listoption semantics appropriate to the host component. Select documentation specifically requires `roleStructure="listoption"` when a MenuItem is used as a no-results/list option.
- Keep menu labels action-oriented and short.
- Use dividers and section labels sparingly to group related items.
- Disabled items should explain why when the reason is not obvious.
- Submenus must be keyboard reachable and should not require precision pointer movement.

Avoid putting arbitrary form layouts inside a Menu. Use a PopoverNext with normal content for interactive forms.

## Navbar and subcomponents

Public components include `Navbar`, `NavbarGroup`, `NavbarHeading`, and `NavbarDivider`.

**Use for:** the persistent top-level application bar.

Key decisions:

- Divide start and end groups deliberately.
- Keep the application title/identity distinct from navigation and actions.
- Use semantic navigation landmarks where appropriate.
- Avoid overfilling the navbar; move secondary commands to menus.
- On narrow viewports, define an explicit collapse or alternate navigation strategy.
- Keep heights aligned with Blueprint variables when adding custom content.

## NonIdealState

**Use for:** empty states, permission states, unavailable content, errors, or loading placeholders where the normal content cannot be shown.

Key decisions:

- Provide an informative title, description, icon/visual, and recovery action when available.
- Differentiate “no data yet,” “no search results,” “access denied,” and “load failed.”
- For a loading state, use clear progress behavior and avoid showing an error-like icon.
- Keep the state close to the region it replaces.

Avoid generic “Something went wrong” without context or recovery.

## OverflowList

**Use for:** rendering as many items as fit and moving overflowed items into a collapsed representation.

Key decisions:

- Choose collapse direction based on which items are most important.
- Supply stable item measurement and render functions.
- Ensure overflow content remains keyboard accessible.
- Avoid expensive item renderers because resizing may cause repeated measurement.
- Use `Breadcrumbs` when the data is specifically a breadcrumb trail.

Test container resize, font scaling, localization, and dynamic item insertion.

## PanelStack and PanelStack2

**Use for:** drill-in navigation through a stack of panels where only the top panel is visible and users can return to previous panels.

The public API currently includes both `PanelStack` and `PanelStack2` compatibility-era names. Inspect installed declarations and deprecation annotations before choosing one. Prefer the non-deprecated current API in the installed release.

Key decisions:

- Model panel identity and props explicitly.
- Keep back navigation predictable.
- Preserve state when moving between panels only when the product expects it.
- Do not use a panel stack as a substitute for URL routing when deep links, browser history, or shareable state are required.
- Manage focus when a new panel becomes active and when returning.

## ProgressBar

**Use for:** horizontal progress indication.

Key decisions:

- Use a normalized determinate value when progress is known.
- Use indeterminate mode only when duration/progress is unknown.
- Provide textual status for important operations.
- Do not repeatedly reset progress backward without explanation.
- Avoid using progress bars as decoration or static ratings.

Expose progress to assistive technology through the appropriate progress semantics and labels.

## ResizeSensor

**Use for:** observing element-size changes and responding to layout changes.

Key decisions:

- Prefer native CSS layout before JavaScript measurement.
- Keep callbacks stable and inexpensive.
- Debounce or batch expensive recalculations.
- Guard against measurement-feedback loops where the callback changes size again.
- Clean up observers on unmount.

Use modern `ResizeObserver` directly for simple application-owned cases if Blueprint's wrapper provides no additional value.

## Section and SectionCard

**Use for:** a titled content section, optionally collapsible, with a consistent header and one or more section cards.

Key decisions:

- Use a real heading level inside or around the section.
- Put only closely related actions in the right-side header area.
- Connect collapse state to an accessible trigger.
- Use `SectionCard` for bounded content within a Section, not for unrelated nested card decoration.
- Keep elevation consistent across sibling sections.

## Skeleton

**Use for:** a placeholder that preserves approximate layout while content loads.

Key decisions:

- Match the shape of expected content without reproducing every detail.
- Mark the containing region busy when appropriate.
- Avoid announcing every skeleton element.
- Prevent layout shift by reserving realistic dimensions.
- For very fast operations, avoid flashing a skeleton; use a delay threshold.

## Spinner

**Use for:** indicating an operation in progress when a circular indicator fits the space.

Key decisions:

- Choose size appropriate to the region.
- Use intent only when it communicates meaningful status.
- Pair a standalone spinner with visible text for non-obvious operations.
- Use Button's `loading` prop inside buttons rather than inserting a Spinner manually.

## Tabs, Tab, TabPanel, and TabsExpander

**Use for:** switching between peer content views without leaving the current application context.

Key decisions:

- Use stable `TabId` values.
- Choose controlled mode when selection affects routing, persistence, permissions, analytics, or other components.
- Use `renderActiveTabPanelOnly`/lazy behavior thoughtfully: unmounting panels can discard state and cancel effects.
- Keep labels short; use icons only with accessible text.
- Use `TabsExpander` to push later tabs/actions to the far side only when the layout remains understandable.
- Tabs are not a substitute for sequential steps. Use a multistep dialog or stepper pattern for workflow progression.

```tsx
<Tabs selectedTabId={tab} onChange={next => setTab(String(next))}>
  <Tab id="overview" title="Overview" panel={<Overview />} />
  <Tab id="activity" title="Activity" panel={<Activity />} />
</Tabs>
```

Test arrow-key navigation, focus, selected-state semantics, and panel association.

## Tag and CompoundTag

**Use for:** compact labels, status chips, filters, or key-value metadata.

`Tag` supports intent, iconography, interactive/removable behavior, size, minimal/round style, and truncation-related behavior depending on version.

`CompoundTag` separates a left label from a right value for compact key-value display.

Key decisions:

- Keep text concise.
- Use `onRemove` only when removal is a real action and expose a clear accessible label.
- Do not use removable tags for destructive domain deletion without confirmation.
- Use intent semantically.
- Ensure selected/filter tags have state beyond color.
- For many editable values, use `TagInput` rather than manually composing Tags.

## Text

**Use for:** text overflow handling, especially ellipsis with optional full-text title behavior.

Key decisions:

- Ellipsis requires a constrained width.
- Do not hide essential information only behind a native title tooltip.
- Preserve the full accessible text.
- Use semantic containers around Text when it represents a heading, label, or link.

## Tree and TreeNode

**Use for:** hierarchical, expandable data with selection and node actions.

Data is commonly represented as `TreeNodeInfo` objects with fields such as id, label, child nodes, expansion, selection, icon, secondary label, and disabled state.

Key decisions:

- Keep node IDs stable.
- Treat expansion and selection as distinct states.
- Update immutable tree data predictably so React rerenders the changed branch.
- Support keyboard navigation and visible focus.
- Use explicit loading placeholders when children load asynchronously.
- Avoid rendering an enormous tree without virtualization or incremental loading; the generic Core Tree is not a substitute for a purpose-built virtualized tree.
- Provide context menus or action buttons without making them hover-only.
- Preserve focus after node removal or tree refresh.

Example immutable update helper:

```ts
import type { TreeNodeInfo } from "@blueprintjs/core";

export function updateNode(
  nodes: TreeNodeInfo[],
  id: string | number,
  update: (node: TreeNodeInfo) => TreeNodeInfo,
): TreeNodeInfo[] {
  return nodes.map(node => {
    if (node.id === id) return update(node);
    if (node.childNodes == null) return node;
    return { ...node, childNodes: updateNode(node.childNodes, id, update) };
  });
}
```

## Core component decision matrix

| Requirement | Prefer | Avoid |
|---|---|---|
| one command | Button | clickable div |
| navigation styled as button | AnchorButton | Button with `window.location` |
| compact related commands | ButtonGroup | unrelated buttons visually glued together |
| inline persistent message | Callout | toast that disappears before reading |
| bounded summary | Card | arbitrary elevated div |
| semantic small table | HTMLTable | virtual grid for ten rows |
| large spreadsheet interaction | `@blueprintjs/table` | HTMLTable with thousands of nodes |
| empty/error placeholder | NonIdealState | blank region |
| peer content views | Tabs | buttons with manually hidden panels |
| hierarchy | Tree | deeply nested unordered lists with ad hoc click logic |
| content overflow | Text | CSS clipping without accessible full text |

## Core component review checklist

- [ ] Correct semantic component chosen.
- [ ] Native attributes and ref types preserved.
- [ ] New code uses current v6 size/variant/icon APIs.
- [ ] Interactive non-button surfaces are keyboard operable.
- [ ] Icon-only actions have accessible names.
- [ ] Controlled state is used where product state crosses component boundaries.
- [ ] Empty, loading, error, and permission states are distinct.
- [ ] Portaled or overflow content works in dark mode.
- [ ] Long text, localization, zoom, and resize have been tested.
- [ ] Tests assert behavior rather than private Blueprint DOM structure.
