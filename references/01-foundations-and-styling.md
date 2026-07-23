# Foundations, installation, styling, and application architecture

This reference covers the project-level decisions that must be correct before individual Blueprint components are implemented. It targets Blueprint 6.x with React 18 or 19 and TypeScript-first development.

## 1. What Blueprint is designed for

Blueprint is a desktop-oriented React toolkit for complex, data-dense interfaces: administration consoles, operational tools, editors, analytics products, research applications, and other interfaces where users manipulate substantial information. Its defaults favor compact controls, keyboard operation, menus, overlays, and high information density.

Blueprint is not primarily a mobile design system. A responsive Blueprint application is possible, but the product must explicitly decide how dense tables, hover affordances, context menus, drag interactions, keyboard shortcuts, wide dialogs, and multi-column forms degrade on narrow or touch-only devices.

Recommended product assumptions:

- Optimize the principal workflow for modern Chrome, Firefox, Safari, and Edge.
- Treat keyboard navigation as a first-class interaction mode.
- Preserve native HTML semantics where Blueprint does not need to own behavior.
- Use Blueprint components to create a coherent desktop application, not as isolated decoration.
- Keep product-specific layout and domain styling in application classes rather than overriding Blueprint internals globally.

## 2. Version and compatibility audit

Before implementation or migration, inspect package versions:

```bash
pnpm list --depth 0 \
  @blueprintjs/core \
  @blueprintjs/icons \
  @blueprintjs/datetime \
  @blueprintjs/select \
  @blueprintjs/table \
  @blueprintjs/colors \
  @blueprintjs/labs \
  react react-dom
```

Expected baseline for this skill:

- Blueprint packages use major version 6.
- React and React DOM use a supported 18.x or 19.x release.
- `@types/react` and `@types/react-dom` match the React major closely enough for the project toolchain.
- Extension packages resolve a compatible `@blueprintjs/core`.

Blueprint packages publish independent patch and minor versions. Do not force identical full versions unless the package manager or release policy requires it. Do keep all Blueprint packages on the same major version.

When debugging a type or runtime discrepancy, inspect the installed package rather than relying on memory:

```bash
node -p "require('@blueprintjs/core/package.json').version"
node -p "require('@blueprintjs/select/package.json').version"
```

For exact prop contracts, inspect declaration files under `node_modules/@blueprintjs/<package>/lib/esm`.

## 3. Installation patterns

### 3.1 Minimal Core application

```bash
pnpm add @blueprintjs/core react react-dom normalize.css
pnpm add -D @types/react @types/react-dom
```

```ts
// src/main.tsx or the framework's global client entry
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
```

### 3.2 Application using static SVG icons

```bash
pnpm add @blueprintjs/core @blueprintjs/icons react react-dom normalize.css
```

Static SVG icon components do not require the icon-font stylesheet:

```tsx
import { Button } from "@blueprintjs/core";
import { DownloadIcon } from "@blueprintjs/icons";

<Button icon={<DownloadIcon />} text="Download" />;
```

### 3.3 Extension packages

```bash
pnpm add @blueprintjs/select @blueprintjs/datetime @blueprintjs/table
```

```ts
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/table/lib/css/table.css";
```

Rules:

1. Normalize first.
2. Core second.
3. Extension CSS after Core.
4. Import global styles once at the application entry or root layout.
5. Do not import global package CSS from reusable leaf components.
6. Do not rely on transitive CSS imports.
7. Include icon-font CSS only when the application intentionally uses icon-font classes.

## 4. Framework integration

### 4.1 Vite / client-rendered React

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import { App } from "./App";

const container = document.getElementById("root");
if (container == null) {
  throw new Error("Missing #root element");
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 4.2 Next.js App Router

Load CSS in the root layout:

```tsx
// app/layout.tsx
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Place client-only interaction setup in a client component:

```tsx
"use client";

import { BlueprintProvider, FocusStyleManager } from "@blueprintjs/core";
import { useEffect } from "react";

export function BlueprintClientRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  return <BlueprintProvider>{children}</BlueprintProvider>;
}
```

Do not access `document`, `window`, or construct a portal container during server rendering. Resolve browser-only containers after mount or use a stable element rendered by the root document.

### 4.3 Vanilla JavaScript host

Blueprint components are React components, but they can be mounted into any page using a React root:

```tsx
import { Spinner } from "@blueprintjs/core";
import React from "react";
import { createRoot } from "react-dom/client";

const node = document.getElementById("loading-slot");
if (node != null) {
  const root = createRoot(node);
  root.render(React.createElement(Spinner, { intent: "primary" }));
  // Call root.unmount() when the host removes the feature.
}
```

## 5. Root providers and global behavior

`BlueprintProvider` composes Blueprint's portal, overlay-stack, and hotkey providers. It is a good default for an application that uses dialogs, popovers, drawers, toasts, or global hotkeys.

```tsx
import { BlueprintProvider } from "@blueprintjs/core";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <BlueprintProvider>{children}</BlueprintProvider>;
}
```

Use provider customization only for an explicit application requirement:

- `portalContainer`: render all Blueprint portals into a controlled DOM node.
- `portalClassName`: add shared classes to portaled surfaces.
- hotkey provider props: customize the hotkey dialog or context value.
- `OverlaysProvider`: use directly only when composing a specialized provider tree.
- `PortalProvider`: use directly when a subtree requires a different portal destination.

Provider rules:

- Use one coherent overlay stack for the main application.
- Avoid nesting independent `BlueprintProvider` instances casually; nested overlay stacks can make focus and z-index behavior difficult to reason about.
- A custom portal container must remain mounted for the lifetime of all portaled children.
- Test nested dialogs, popovers, and toasts after changing provider placement.

## 6. Focus management

Enable `FocusStyleManager` once in the browser:

```ts
import { FocusStyleManager } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();
```

Public behavior:

- `isActive()` reports whether the manager is running.
- `onlyShowFocusOnTabs()` hides most focus outlines during mouse use and restores them for keyboard navigation.
- `alwaysShowFocus()` disables that behavior and leaves focus indication visible.

Use `Classes.FOCUS_STYLE_MANAGER_IGNORE` on a subtree only when its focus indicator must remain visible even after pointer interaction:

```tsx
import { Classes, Tree } from "@blueprintjs/core";

<div className={Classes.FOCUS_STYLE_MANAGER_IGNORE}>
  <Tree contents={nodes} />
</div>;
```

Never globally remove `outline`. Focus visibility is an accessibility requirement and a debugging aid.

## 7. CSS class strategy

Blueprint exports a `Classes` object that contains the official class constants used by the current major version.

Preferred hierarchy:

1. Use component props.
2. Add an application-owned class.
3. Use a `Classes` constant when a Blueprint class is genuinely required.
4. Target internal Blueprint structure only as a last resort.

```tsx
<Button className="report-toolbar__refresh" variant="minimal" />
```

```scss
.report-toolbar__refresh {
  flex: 0 0 auto;
}
```

Avoid:

```tsx
// Brittle: hardcoded internal class and modifier.
<button className="bp6-button bp6-minimal">Refresh</button>
```

When manually rendering a Blueprint-like structure is necessary:

```tsx
import { Classes } from "@blueprintjs/core";

<a className={Classes.MENU_ITEM} href="/reports">
  Reports
</a>;
```

Blueprint 6 uses the `bp6-` namespace. Do not hardcode that prefix in reusable TypeScript or CSS unless the project is intentionally coupled to one major version.

## 8. Modifiers, inheritance, and component props

Common visual modifiers include intent, size, variant, active state, fill, roundness, and elevation. Prefer the corresponding prop:

```tsx
<Button intent="primary" size="large" variant="solid" text="Save" />
```

Avoid manually combining modifier classes:

```tsx
// Avoid in component code.
<Button className={`${Classes.INTENT_PRIMARY} ${Classes.LARGE}`} />
```

Some modifier classes cascade from containers. For example, a group-level outlined or minimal style may affect descendants and cannot necessarily be undone on one child. Apply group modifiers only when every child should share them.

## 9. Dark theme

Blueprint dark mode is class-based. Apply `Classes.DARK` to an ancestor:

```tsx
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

export function AppFrame({ dark }: { dark: boolean }) {
  return <div className={classNames("app-frame", { [Classes.DARK]: dark })}>...</div>;
}
```

Dark-theme rules:

- Place the dark class high enough to cover all relevant content.
- Portals leave the normal DOM subtree. Prefer overlay/popover APIs that inherit dark theme, or use a portal class/container that carries the theme.
- Do not invert arbitrary colors with CSS filters.
- Use semantic Blueprint variables and aliases for custom components.
- Test nested portaled content, including tooltip-on-popover, menu-in-dialog, date picker in drawer, and toaster notifications.
- Ensure the page background itself is themed; applying dark mode only to controls creates contrast discontinuities.

A robust pattern is to put the theme class on `body` or the stable app shell and use a portal container within that shell.

## 10. Spacing and dimensions

Blueprint's current spacing base is `$pt-spacing`, a 4px unit. Build application layout on multiples of four unless a component contract requires another measurement.

```scss
@use "@blueprintjs/core/lib/scss/variables" as bp;

.inspector-panel {
  display: flex;
  flex-direction: column;
  gap: bp.$pt-spacing * 3; // 12px
  padding: bp.$pt-spacing * 4; // 16px
}
```

The older `$pt-grid-size` uses a 10px system and is deprecated. Do not introduce it in new work.

Useful dimension variables include button, input, and navbar heights, border radius, typography sizes, and line height. Use them when building a custom control that must align precisely with Blueprint controls.

## 11. Sass, Less, and CSS variables

Blueprint publishes compiled CSS plus Sass and Less sources/variables. Prefer compiled CSS unless the product needs deep theme integration or a custom namespace.

Sass variables:

```scss
@use "@blueprintjs/core/lib/scss/variables" as bp;

.custom-card {
  border-radius: bp.$pt-border-radius;
  color: bp.$pt-text-color;
  box-shadow: bp.$pt-elevation-shadow-1;
}

.#{bp.$ns}-dark .custom-card {
  color: bp.$pt-dark-text-color;
  box-shadow: bp.$pt-dark-elevation-shadow-1;
}
```

Use variables sparingly. Semantic HTML and Blueprint components should provide most typography and control styling.

When the installed release exposes CSS custom properties or generated design tokens, inspect the package's distributed variable file before adopting a token name. Do not invent token names from another major version.

## 12. Custom namespace builds

A custom namespace is an advanced build-time feature. It is appropriate only when:

- two Blueprint builds must coexist;
- the product has a hard collision with the default namespace;
- an internal distribution compiles and owns Blueprint Sass consistently.

Requirements include:

- Dart Sass;
- Sass load paths that resolve `node_modules`;
- the Blueprint SVG inlining function and icon resource path;
- a custom `$ns` value before Blueprint Sass compilation;
- a matching `BLUEPRINT_NAMESPACE` compile-time JavaScript constant so `Classes` uses the same prefix.

Do not set only the Sass namespace or only the JavaScript constant. A mismatch produces components whose generated class names do not match the compiled styles.

Treat a custom namespace build as infrastructure. Pin and test it during Blueprint upgrades.

## 13. Typography

Prefer semantic elements and Blueprint's HTML wrappers:

- headings: `H1` through `H6` or native heading tags inside a Blueprint-styled scope;
- prose: paragraphs and running text;
- code: `Code` for inline code and `Pre` for blocks;
- lists: `UL` and `OL` when Blueprint styling is desired;
- quoted content: `Blockquote`;
- form labels: `Label` or `FormGroup`.

Do not use heading styles to obtain visual size while breaking document hierarchy. A screen should still have a sensible heading outline for assistive technology and navigation.

Useful variables include the primary and monospace font families, small/default/large font sizes, and line height.

## 14. Color and intent

Use semantic intent rather than choosing arbitrary palette values for component states:

- `primary`: main action, selection, or active application state;
- `success`: completed, accepted, healthy, or valid;
- `warning`: risk, degraded state, or attention required;
- `danger`: error, destructive action, or invalid state;
- `none`: neutral.

For application-owned surfaces, prefer semantic aliases such as text, muted text, heading, link, icon, app background, and dark-theme equivalents. Reserve raw palette values for charts, data visualization, or domain-specific categorization where semantic intent is not appropriate.

Do not encode status with color alone. Pair color with text, iconography, shape, or position.

## 15. Elevation and z-index

Blueprint exposes elevation shadows and three main z-index concepts: base, content, and overlay. Avoid arbitrary escalating z-index values.

Rules:

- Keep normal page content in the normal stacking context.
- Create a new stacking context only for a deliberate local reason.
- Let Blueprint overlays own their overlay layer.
- Fix portal clipping with the portal container or overflow architecture, not with a very large z-index.
- Inspect transformed ancestors: `transform`, `filter`, opacity, and positioned elements can create unexpected stacking contexts.
- Test dialogs and popovers inside sticky headers, drawers, split panes, and scroll containers.

## 16. Browser and API contract

Blueprint supports modern Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported. Do not add IE-specific polyfills solely for Blueprint.

Blueprint's public semver contract covers public JavaScript exports, component HTML structure, and rendered component CSS. This does not justify depending on every incidental internal element or private class. Prefer public props and exports.

## 17. Accessibility baseline

Blueprint supplies accessible structure and attributes for many components, but the application remains responsible for:

- meaningful labels and descriptions;
- valid heading hierarchy;
- form error association;
- focus order and restoration;
- keyboard-reachable actions;
- non-color status indication;
- correct dialog and menu semantics;
- accessible names for icon-only controls;
- live-region behavior for asynchronous updates where needed;
- avoiding hover-only essential information.

Blueprint colors are designed with contrast in mind, but custom combinations must be tested. Focus indications generally target modern WCAG focus-appearance contrast. Do not weaken them with custom CSS.

## 18. Application architecture recommendations

A maintainable Blueprint application separates concerns:

```text
src/
  app/
    AppProviders.tsx
    AppShell.tsx
    theme.ts
  components/
    ui/                 # product-specific wrappers around Blueprint
    domain/             # business components
  features/
    reports/
    users/
  styles/
    globals.scss
    tokens.scss
    blueprint-overrides.scss
```

Recommended wrapper policy:

- Wrap Blueprint only when the wrapper expresses a product convention, not merely to rename the component.
- Keep wrapper props narrower than the underlying component where a design rule should be enforced.
- Forward refs for controls that need focus management.
- Preserve native attributes and accessible-name props.
- Document intentional defaults such as size, variant, and intent.
- Avoid a generic `BaseComponent` abstraction that obscures component-specific semantics.

Example product button:

```tsx
import { Button, type ButtonProps } from "@blueprintjs/core";
import { forwardRef } from "react";

export type PrimaryActionProps = Omit<ButtonProps, "intent" | "variant">;

export const PrimaryAction = forwardRef<HTMLButtonElement, PrimaryActionProps>(
  function PrimaryAction(props, ref) {
    return <Button {...props} ref={ref} intent="primary" variant="solid" />;
  },
);
```

## 19. Foundation audit checklist

Before approving a Blueprint feature, confirm:

- [ ] Blueprint package majors are aligned.
- [ ] React version is supported.
- [ ] Global CSS is imported once and in the correct order.
- [ ] `BlueprintProvider` placement is deliberate.
- [ ] FocusStyleManager is initialized once in the browser.
- [ ] Dark-theme class reaches portals.
- [ ] Application classes are used instead of hardcoded Blueprint internals.
- [ ] New code uses `size`, `variant`, and `endIcon` where available.
- [ ] Spacing uses the 4px system.
- [ ] Custom z-index values do not fight the overlay stack.
- [ ] SSR code does not access the DOM during render.
- [ ] Icon loading strategy is explicit.
- [ ] Keyboard, focus, and screen-reader behavior has been tested.

## 20. Official verification points

For exact current behavior, verify against:

- Blueprint docs: `https://blueprintjs.com/docs/`
- Core package source: `https://github.com/palantir/blueprint/tree/develop/packages/core`
- Installed package declarations under `node_modules/@blueprintjs/core/lib/esm`
- Package metadata under `node_modules/@blueprintjs/core/package.json`
