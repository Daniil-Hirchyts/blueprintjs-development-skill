# Testing, performance, debugging, maintenance, and migration

This reference defines how to keep a Blueprint application correct over time. It covers behavior-focused tests, portal and transition handling, performance audits, SSR, package upgrades, deprecation removal, and version migration.

## 1. Quality gates

Every Blueprint change should pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use the equivalent project commands. A development server rendering correctly is not enough; production bundling can reveal CSS ordering, icon chunks, SSR, tree-shaking, and package-resolution failures.

Recommended CI gates:

- lockfile integrity;
- one Blueprint major across workspace;
- TypeScript strict mode or documented exceptions;
- unit and interaction tests;
- accessibility checks;
- production build;
- bundle-size regression threshold;
- visual regression for critical dense screens;
- browser smoke tests for supported browsers.

## 2. Test philosophy

Test the application's contract:

- what users see;
- which actions they can perform;
- keyboard behavior;
- accessible names and roles;
- state transitions;
- focus movement;
- application callbacks and mutations.

Do not make private Blueprint DOM structure the primary contract. Blueprint follows semver for public structure/styles, but snapshots of all internal wrappers remain noisy and fragile.

Prefer:

```ts
screen.getByRole("button", { name: "Save" });
```

Avoid:

```ts
container.querySelector(".bp6-dialog-body > div:nth-child(2)");
```

Use `Classes` constants only where a public CSS state is the actual behavior under test.

## 3. Testing stack

A practical stack:

- Vitest or Jest;
- React Testing Library;
- `@testing-library/user-event`;
- `@testing-library/jest-dom`;
- axe-core integration for automated accessibility checks;
- Playwright/Cypress for browser interaction and visual regression.

Blueprint itself currently uses modern Testing Library and Vitest in several packages, but application teams should follow their established test runner.

## 4. Global test setup

JSDOM lacks several browser APIs used by measurement and positioning. Provide minimal faithful mocks:

```ts
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;
```

Depending on components, tests may also need:

- `IntersectionObserver`;
- `DOMRect`/`getBoundingClientRect` values;
- `matchMedia`;
- `scrollIntoView`;
- clipboard APIs;
- `requestAnimationFrame`;
- pointer capture methods.

Do not globally mock all geometry as zero if a test validates popover placement or overflow behavior. Use browser tests for real layout.

## 5. Portal testing

Dialog, Drawer, PopoverNext, Tooltip, and toasts may render outside the render container. Query the document:

```tsx
render(<MyDialog />);
expect(screen.getByRole("dialog", { name: "Edit project" })).toBeVisible();
```

If using a custom portal container, render it in the test fixture and assert cleanup.

```tsx
function TestShell({ children }: { children: React.ReactNode }) {
  const portal = document.createElement("div");
  document.body.appendChild(portal);
  return <BlueprintProvider portalContainer={portal}>{children}</BlueprintProvider>;
}
```

In real test code, create/remove the node in setup/cleanup, not during render as shown conceptually.

## 6. Transition testing

Overlay close may be asynchronous because of transitions.

Use:

```ts
await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
```

or configure transition duration to zero through public props in tests.

Avoid arbitrary sleeps:

```ts
await new Promise(resolve => setTimeout(resolve, 500));
```

Fake timers can help, but they may interact with user-event, requestAnimationFrame, and Floating UI. Advance only the timers your test owns.

## 7. Focus tests

Test focus explicitly:

```ts
await user.click(screen.getByRole("button", { name: "Edit" }));
expect(screen.getByLabelText("Project name")).toHaveFocus();

await user.keyboard("{Escape}");
expect(screen.getByRole("button", { name: "Edit" })).toHaveFocus();
```

Scenarios:

- modal initial focus;
- Tab and Shift+Tab containment;
- focus return;
- PopoverNext target focus;
- nested overlay close order;
- focused Table cell;
- Tree keyboard focus;
- invalid-form submit focus;
- removed opener fallback.

FocusStyleManager may add/remove classes based on keyboard/pointer input. Test user-visible focus behavior rather than singleton implementation unless configuring it directly.

## 8. Keyboard tests

Use user-event keyboard APIs. Test:

- Button Enter/Space;
- Checkbox/Switch Space;
- RadioGroup arrows;
- Tabs arrows and selection;
- Menu item arrows/Enter/Escape;
- Select active-item movement and Enter;
- Omnibar hotkey and close;
- Table arrows, Shift selection, copy;
- Tree expand/collapse/navigation;
- Dialog Escape;
- custom shortcuts and text-input exclusions.

Do not rely only on `fireEvent.keyDown`; user-event produces more realistic event sequences.

## 9. Form tests

Test canonical outcomes rather than internal input state:

- visible labels;
- helper/error association;
- partial NumericInput states;
- DateInput parsing;
- TagInput paste/removal;
- disabled/read-only differences;
- async submit loading;
- server error preservation;
- first-invalid-field focus;
- form submission by Enter.

## 10. Select tests

Unit-test predicates separately. Interaction-test:

1. open target;
2. query;
3. assert matching items;
4. navigate with arrows;
5. select with Enter;
6. assert domain callback/state;
7. close/focus return.

For remote Select:

- fake network at the request layer;
- test debounce with controlled timers carefully;
- test abort/stale responses;
- differentiate loading, empty, and error;
- verify stable selection after item reconstruction.

## 11. Date/time tests

Freeze time and set timezone explicitly. Test domain conversion independently.

```ts
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-07-23T10:00:00Z"));
```

Do not assume the CI runner timezone. Include DST boundary tests for the product's important zones.

## 12. Table tests

JSDOM cannot validate full virtualization geometry reliably. Divide tests:

### Unit

- sorting;
- filtering;
- view-index mapping;
- region conversion;
- edit reducers;
- copy serialization;
- reorder reducers.

### JSDOM interaction

- visible cell content;
- header actions;
- selection callback;
- edit confirm/cancel;
- loading states.

### Browser

- virtualization while scrolling;
- resize/reorder drag;
- frozen panes;
- popovers in cells;
- focused-cell navigation;
- actual clipboard where permitted;
- high row/column count performance.

## 13. Automated accessibility testing

Run axe against representative states:

- normal page;
- dialog open;
- drawer open;
- popover/menu open;
- form errors visible;
- Select list open;
- empty/error state;
- Table focus/selection.

Automated checks do not validate interaction quality, announcement clarity, or all grid semantics. Add manual keyboard and screen-reader testing.

## 14. Visual regression

High-value snapshots:

- light and dark app shell;
- all intents and sizes;
- form validation;
- dialog/drawer/popover nesting;
- long localized text;
- 200% zoom;
- Table frozen/selected/loading/editing states;
- Tree deep nesting;
- skeleton and non-ideal states.

Avoid snapshotting every primitive. Cover product compositions that are sensitive to CSS upgrades.

## 15. Performance model

Blueprint performance failures usually come from application composition rather than a single component.

Audit four layers:

1. React render frequency.
2. DOM node volume.
3. layout/measurement loops.
4. bundle/network cost.

## 16. React render performance

Use React Profiler to identify:

- large parent rerenders;
- unstable renderer callbacks;
- context values recreated each render;
- large lists without virtualization;
- Table dependencies changing unnecessarily;
- expensive item filtering;
- hundreds of hidden popovers mounted eagerly.

Rules:

- keep state near its consumers;
- memoize expensive derived data;
- use stable IDs and immutable updates;
- do not use `React.memo` indiscriminately;
- avoid inline heavy render functions inside thousands of cells/items;
- keep provider values stable.

## 17. Overlay positioning performance

PopoverNext uses auto-update mechanisms such as scroll/resize observers and layout-shift detection.

Potential failure patterns:

- a positioned popover changes adjacent layout;
- ResizeObserver detects the change;
- positioning updates;
- layout changes again;
- browser reports a loop or jank.

Mitigation:

1. Prevent floating content from affecting reference layout.
2. Use a portal.
3. Avoid dimensions tied circularly to measured content.
4. Disable only the problematic auto-update behavior after diagnosis.
5. Use animation-frame updates only for transform-animated references.

## 18. List and Select performance

- pre-normalize searchable text;
- use itemListPredicate for global ranking;
- debounce remote work;
- abort stale requests;
- virtualize only when justified;
- avoid rich row components with many providers/effects;
- lazy-load expensive previews;
- keep itemRenderer side-effect free.

## 19. Table performance

- use virtualization as designed;
- keep cell renderers cheap;
- precompute formatters/lookups;
- supply correct renderer dependencies;
- avoid rebuilding all row objects for one cell change when possible;
- test target-scale data;
- avoid too many frozen columns;
- avoid a popover instance in every cell unless lazily composed;
- profile rapid scroll and selection.

## 20. Tree performance

Core Tree is not a universal virtualized tree. For very large hierarchies:

- load children lazily;
- render expanded branches only;
- keep immutable branch updates localized;
- avoid recursively mapping the entire tree for every hover;
- consider a dedicated virtualized tree implementation when node count demands it.

## 21. Bundle performance

Audit:

- duplicate React versions;
- duplicate Blueprint majors;
- extension packages not used;
- icon all-path imports;
- dynamic icon chunks;
- icon-font CSS when unused;
- importing from broad barrels versus statically analyzable component exports;
- source maps and CSS duplication;
- date/time locale data;
- polyfills for unsupported legacy browsers.

Use a bundle analyzer in production mode.

## 22. CSS performance and maintainability

- avoid broad descendant selectors into Blueprint internals;
- avoid `!important` escalation;
- scope overrides to product components;
- keep custom namespace compilation centralized;
- load styles once;
- remove obsolete v5 namespace overrides after migration;
- prefer CSS layout over ResizeSensor-driven JavaScript.

## 23. SSR and hydration

Blueprint can be used in SSR applications, but interactive components must respect the DOM boundary.

Rules:

- do not access `window`/`document` during server render;
- initialize FocusStyleManager client-side;
- create OverlayToaster client-side;
- resolve custom portal containers after mount or from stable root markup;
- avoid values based on `Date.now()`, random IDs, viewport, or timezone that differ between server and client without serialization;
- load global CSS through framework-supported root entry;
- test hydration with overlays initially closed and, if required, initially open.

## 24. Debugging workflow

When a component fails:

1. Reproduce in the smallest product composition.
2. Inspect installed versions.
3. Inspect console warnings and TypeScript errors.
4. Confirm CSS import/order.
5. Confirm controlled state updates.
6. Confirm provider/portal placement.
7. Confirm the target/renderer spreads injected props.
8. Confirm focus and event propagation.
9. Compare installed declarations with code.
10. Search current official source/issues only after local facts are known.

## 25. Common warning diagnosis

### Controlled/uncontrolled warning

A value changes from `undefined` to defined. Initialize state consistently with `null`, empty string, or a valid default according to the API.

### Ref warning

A wrapper component does not forward a ref required by PopoverNext, Tooltip, or focus code. Use `forwardRef` and attach it to the actual DOM/control target.

### Unknown DOM attribute

Blueprint-specific props were spread onto a native element. Destructure them or use `removeNonHTMLProps` only where appropriate.

### findDOMNode / Strict Mode warning

Likely old dependency/component path. Check package versions and whether the current API supports ref forwarding.

### ResizeObserver loop

Diagnose measurement feedback as described above.

### Hydration mismatch

Server/client rendered different date, random ID, theme, portal, or viewport-dependent output.

## 26. Upgrade strategy

Upgrade in controlled stages:

1. Read release notes/changelog for every Blueprint package used.
2. Update all Blueprint packages to compatible major/minor targets.
3. Install and inspect peer dependency warnings.
4. Run TypeScript before changing code.
5. Replace removed/deprecated APIs.
6. Run unit and interaction tests.
7. inspect visual diffs in light/dark themes.
8. test production bundles and icon loading.
9. test overlays, focus, and portals manually.
10. deploy behind a controlled release strategy for major upgrades.

## 27. v5 to v6 migration themes

Blueprint v6 uses a `bp6-` CSS namespace. Migration commonly includes:

- package upgrades and React compatibility;
- CSS namespace changes in custom selectors/tests;
- new size props replacing boolean `small`/`large` where supported;
- variant props replacing `minimal`/`outlined` booleans where supported;
- `endIcon` replacing `rightIcon`;
- modern overlay/popover APIs;
- icon component suffix naming;
- deprecated aliases and `*2` naming transitions;
- spacing migration from old grid assumptions toward 4px `$pt-spacing`;
- updated TypeScript declarations.

Do not perform a global `bp5-` to `bp6-` text replacement without classifying each occurrence. Hardcoded Blueprint class usage should often be replaced with `Classes` or application classes.

## 28. Deprecated API inventory and policy

Known current compatibility/deprecation areas include:

- `Overlay` → `Overlay2`;
- `Popover` → `PopoverNext`;
- Button `small`/`large` → `size`;
- Button `minimal`/`outlined` → `variant`;
- `rightIcon` → `endIcon`;
- unsuffixed icon components → `*Icon`;
- legacy `$pt-grid-size` → `$pt-spacing`;
- `DateInputMigrationUtils` marked for removal;
- compatibility names such as Table/Table2, EditableCell/EditableCell2, PanelStack/PanelStack2, Toast/Toast2 where installed deprecation annotations determine the current direction.

Policy:

- no new deprecated usage;
- existing deprecated usage gets a tracking issue;
- wrappers isolate unavoidable compatibility APIs;
- migrations include behavioral tests;
- do not remove a compatibility API during an unrelated feature unless test coverage is sufficient.

## 29. Popover migration detail

When migrating Popover to PopoverNext:

- map `position` to `placement` where possible;
- replace Popper modifiers with Floating UI middleware;
- inspect official migration helpers;
- compare focus return default;
- compare target wrappers and refs;
- test `fill` and width matching;
- test hover delays/focus opening;
- test boundaries, fixed ancestors, and scrolling;
- test nested dismiss and dark theme;
- remove legacy Popper-specific configuration after parity.

## 30. Overlay migration detail

When migrating Overlay to Overlay2:

- preserve open-state control;
- preserve modal role/name;
- compare backdrop and outside-click handling;
- compare lifecycle callbacks and transition timing;
- compare lazy mounting/unmounting;
- compare focus acquisition/enforcement/return;
- test stacked overlays through OverlaysProvider;
- verify scroll lock.

## 31. Icon migration detail

- change `Download` to `DownloadIcon` and equivalent names;
- verify import paths remain package-root exports;
- remove icon-font CSS if no longer used;
- choose static or dynamic strategy;
- configure loader before string icon use;
- analyze bundle after migration;
- test missing/rare icons in production.

## 32. CSS migration detail

- delete hardcoded major namespace selectors where an application class can replace them;
- use `Classes` in TypeScript tests;
- use Sass `$ns` when targeting Blueprint in Sass is unavoidable;
- update custom namespace build tooling and `BLUEPRINT_NAMESPACE` together;
- review spacing assumptions;
- review dark-theme selectors;
- remove legacy overrides that fight new component variants.

## 33. TypeScript migration detail

- enable `skipLibCheck` only as a temporary, documented toolchain workaround, not to hide application errors;
- replace deprecated prop names based on compiler output;
- fix refs to current element types;
- remove `any` casts around Select/Table renderers by importing public generic types;
- inspect nullable semantics;
- update React event types;
- avoid internal package paths.

## 34. Maintenance automation ideas

In CI or repository scripts, consider:

```bash
# Detect mixed Blueprint major versions.
pnpm list -r --depth 0 | grep '@blueprintjs/'

# Find deprecated component/prop patterns for manual review.
rg '\b(Overlay|Popover)\b' src
rg '\b(rightIcon|minimal=|outlined=|large=|small=)' src
rg 'bp[0-9]-' src test
```

Searches produce candidates, not guaranteed errors. Component names and prop words may occur in product code with other meanings.

## 35. Definition of done

A Blueprint feature is complete when:

- [ ] packages and CSS are correct;
- [ ] TypeScript passes without compatibility casts introduced casually;
- [ ] current APIs are used;
- [ ] states include loading, empty, error, disabled, and permission behavior;
- [ ] keyboard/focus behavior is tested;
- [ ] light/dark and portal behavior is tested;
- [ ] tests assert accessible behavior;
- [ ] target-scale performance is acceptable;
- [ ] production build and icon chunks work;
- [ ] SSR/hydration is clean where applicable;
- [ ] no undocumented internal import or hardcoded namespace was added;
- [ ] migration/deprecation debt is documented.
