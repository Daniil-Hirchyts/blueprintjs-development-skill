# Icons, colors, design tokens, and Labs

This reference covers `@blueprintjs/icons`, `@blueprintjs/colors`, icon usage through Core components, bundling strategies, palette usage, and experimental `@blueprintjs/labs` layout primitives.

## Part I — Icons

## 1. Icon APIs

Blueprint icon usage has two principal forms:

1. static React component import;
2. string icon name resolved by the icon loader.

The icons package also exports:

- `IconName` and `IconNames`;
- `IconSize` and icon-path types;
- `Icons` loader API;
- `IconLoaderOptions` and `IconPathsLoader`;
- `SVGIconContainer` and SVG prop types;
- raw path APIs such as `getIconPaths`, `IconSvgPaths16`, and `IconSvgPaths20`;
- icon codepoints/content helpers;
- legacy-name conversion maps.

Use the high-level React component or component `icon` prop for ordinary UI. Raw paths and codepoints are advanced APIs.

## 2. Static icon components

Preferred for most applications:

```tsx
import { Button } from "@blueprintjs/core";
import { DownloadIcon } from "@blueprintjs/icons";

<Button icon={<DownloadIcon />} text="Download" />;
```

Benefits:

- explicit dependency;
- straightforward tree-shaking;
- no runtime icon-path request;
- works predictably in SSR;
- code search identifies icon use.

Tradeoffs:

- each icon must be imported;
- size may need to be specified in custom contexts.

Current naming convention prefers exports ending in `Icon`, such as `DownloadIcon`. Legacy unsuffixed components remain temporarily for compatibility but are deprecated for future removal. Do not introduce unsuffixed icon component imports in new code.

## 3. String icon names

Many Core component props accept a type-safe icon name:

```tsx
<Button icon="download" text="Download" />
```

Benefits:

- compact API;
- automatic sizing in many Blueprint contexts;
- useful when icon choice is data-driven.

Tradeoffs:

- icon paths must be available through runtime loader configuration;
- first use may trigger chunk loading;
- bundler behavior must be verified;
- tests/SSR may need loader setup.

Use string names when data-driven selection or Blueprint's automatic context sizing is valuable. Use static components for a small fixed icon set and strict bundle predictability.

## 4. Default dynamic loading

Blueprint can load icon paths dynamically by size. The first use of a standard or large icon may load a chunk containing paths for that size, depending on bundler support.

Verify:

- `import()` chunk generation;
- production public path/base URL;
- content security policy;
- offline behavior;
- loading fallback;
- test environment support.

Do not assume a development bundler result guarantees production deployment paths.

## 5. Load all icons in one chunk

```ts
import { Icons } from "@blueprintjs/icons";

Icons.setLoaderOptions({ loader: "all" });
await Icons.loadAll();
```

Use only when:

- the application uses a very broad dynamic icon catalog;
- one predictable chunk is preferable;
- bundle impact is measured and accepted.

Preloading all icons increases initial work. Do not choose this merely to avoid configuring a small static icon set.

## 6. Custom loaders

An `IconPathsLoader` can map `(name, size)` to icon paths.

Use custom loaders for:

- eager Webpack loading;
- one-icon-per-chunk lazy loading;
- Vite `import.meta.glob` integration;
- custom deployment or embedded runtime constraints.

Contract:

```ts
import type { IconPathsLoader } from "@blueprintjs/icons";

const loader: IconPathsLoader = async (name, size) => {
  // Return the path definition for this icon name and size.
  throw new Error(`Implement loader for ${name} at ${size}px`);
};
```

After defining:

```ts
Icons.setLoaderOptions({ loader });
```

Custom loader rules:

- configure before first string-name icon use;
- return the exact expected path type;
- handle missing names deterministically;
- avoid duplicate network requests through module caching;
- test both 16px and 20px sizes;
- ensure chunk names and paths survive production build;
- do not expose internal file paths to user input without validation.

## 7. Vite loader pattern

The official docs demonstrate `import.meta.glob` over generated 16px and 20px path modules. The precise relative glob depends on project structure and bundler resolution.

When implementing:

1. inspect the installed package's generated path directories;
2. define a typed module map;
3. construct the key from size/name;
4. throw a clear error for missing modules;
5. test production output.

Avoid copying a node_modules-relative glob blindly into a monorepo or pnpm virtual store without verifying resolution.

## 8. Preloading a subset

```ts
await Icons.load(["download", "caret-down", "help", "lock"]);
```

Use for common above-the-fold icons while leaving rare icons lazy. Preload after loader configuration and before critical first paint only if measurement shows benefit.

## 9. Core Icon component

The Core `Icon` component accepts a name or icon representation and supports size, color, intent, title/accessibility-related props according to installed types.

Rules:

- use component intent when semantic status is intended;
- use inherited/current color for normal toolbar icons;
- do not hardcode unrelated palette colors;
- match 16px/20px design sizes rather than scaling arbitrary SVGs with CSS;
- avoid animating many SVG paths continuously.

## 10. Accessibility

### Decorative icon

An icon next to visible text is usually decorative. The action's text supplies the accessible name.

### Icon-only button

```tsx
<Button icon="trash" aria-label="Delete project" variant="minimal" />
```

The accessible name belongs on the button.

### Standalone meaningful icon

Provide an accessible title/label only if the icon itself conveys information and is not already described by adjacent text.

Do not rely on icon name as user-facing text. “floppy-disk” is an implementation name, not necessarily a meaningful announcement.

## 11. Icon selection guidelines

- Use one icon consistently for one product concept.
- Pair unfamiliar icons with labels.
- Avoid multiple icons inside a small control unless hierarchy is clear.
- Do not use warning/danger iconography decoratively.
- Respect cultural and directional meaning.
- Mirror directional icons in RTL only when semantically appropriate.
- Use animated spinners/progress components for loading instead of rotating arbitrary icons unless the product convention is documented.

## 12. Icon font CSS

The icon-font stylesheet is needed only for icon-font classes/content, not for static SVG React icons.

```ts
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
```

Prefer SVG icons. Icon fonts are useful for compatibility or CSS pseudo-elements but have weaker control and accessibility characteristics.

The package exposes codepoint helpers for advanced usage. Avoid hardcoded Unicode values.

## 13. Bundle audit

Check production bundles for:

- accidental import of all path maps through `IconSvgPaths16`/`20`;
- both static components and a full dynamic loader when only one is needed;
- duplicated Blueprint icon package versions;
- unsuffixed compatibility exports;
- icon-font CSS when unused;
- failed or oversized dynamic chunks.

## Part II — Colors and tokens

## 14. @blueprintjs/colors

The colors package exposes Blueprint's palette programmatically and through styling resources. Core also re-exports a `Colors` object.

Use raw palette colors for:

- charts and visualizations;
- categorical series;
- sequential/diverging scales;
- product-specific illustrations;
- custom components when no semantic alias fits.

Use semantic aliases/intents for controls, text, errors, and application surfaces.

## 15. Intent colors

Intent is a semantic layer:

- primary;
- success;
- warning;
- danger;
- none/neutral.

Use intent consistently across icon, control, helper text, callout, progress, and validation. Do not assign danger to ordinary branding or selection.

Status should include text or icon shape in addition to color.

## 16. Text and surface aliases

Core styling variables include semantic concepts such as:

- app background;
- default/muted/disabled text;
- heading text;
- links;
- icon default/hover/disabled/selected;
- dark-theme counterparts;
- text selection;
- borders and dividers depending on installed variable inventory.

Use these to build custom surfaces that adapt to light/dark themes.

```scss
@use "@blueprintjs/core/lib/scss/variables" as bp;

.metric-card {
  color: bp.$pt-text-color;
  background: bp.$pt-app-background-color;
}

.#{bp.$ns}-dark .metric-card {
  color: bp.$pt-dark-text-color;
  background: bp.$pt-dark-app-background-color;
}
```

## 17. Data visualization colors

For charts:

- choose qualitative palettes for unrelated categories;
- sequential palettes for ordered magnitude;
- diverging palettes for values around a meaningful midpoint;
- avoid reusing semantic intent colors for unrelated categories when it causes false meaning;
- verify contrast against light and dark backgrounds;
- support patterns, labels, or direct annotations;
- maintain category-color stability across views;
- test common color-vision deficiencies.

Do not use a ten-color categorical scale for thirty categories without an alternate encoding.

## 18. CSS/Sass variables and spacing

Blueprint's Sass variables include typography, dimensions, 4px spacing, z-index, shadows, and color aliases. The older 10px `$pt-grid-size` is deprecated in favor of `$pt-spacing`.

When adopting distributed CSS variables/design tokens, inspect the installed build output. Token names may evolve, and Labs/design-token work may be less stable than long-standing Sass aliases.

## 19. Contrast

Blueprint aims for accessible component palettes, including focus appearance. Custom combinations still require testing.

Test:

- normal and large text;
- icons and non-text controls;
- focus indicators;
- disabled controls without making content illegible;
- selected rows/cells;
- chart lines and points;
- dark-theme overlay surfaces;
- warning colors, which can have tighter contrast limits on light surfaces.

Do not reduce opacity of text as the only method for muted/disabled state without checking contrast.

## Part III — Labs

## 20. @blueprintjs/labs status

Labs contains experimental components whose API stability may be lower than Core. Current documented primitives include `Box` and `Flex`.

Use Labs when:

- the installed package version is pinned;
- the team accepts potential API changes;
- the primitive removes meaningful repetitive layout code;
- behavior is covered by local tests;
- a wrapper can isolate future migration.

Avoid Labs for foundational public design-system APIs unless the organization accepts the maintenance cost.

## 21. Box

**Use for:** a polymorphic layout/container primitive with typed style-system-like props according to installed Labs API.

Potential use cases:

- spacing wrapper;
- semantic element selection;
- constrained dimensions;
- common display/background/border composition.

Rules:

- preserve semantic element choice;
- avoid replacing all HTML with Box;
- do not mix many shorthand props and conflicting CSS classes;
- inspect the generated DOM and style specificity;
- wrap Box behind a product primitive if widespread adoption is planned.

## 22. Flex

**Use for:** typed flexbox layout composition.

Potential concepts include direction, alignment, justification, gap, wrapping, and polymorphic element behavior.

Rules:

- use CSS Grid when the layout is genuinely two-dimensional;
- define wrapping behavior;
- do not rely on source order that differs from visual order;
- preserve keyboard/focus order;
- use Blueprint's 4px spacing scale;
- test localization and long content;
- avoid deeply nested Flex wrappers that obscure layout ownership.

## 23. Labs isolation pattern

```tsx
// product/layout/Stack.tsx
import { Flex, type FlexProps } from "@blueprintjs/labs";

export type StackProps = Omit<FlexProps, "direction">;

export function Stack(props: StackProps) {
  return <Flex {...props} direction="column" />;
}
```

This isolates Labs usage and lets the product replace the implementation later.

Confirm exact FlexProps names before using this pattern.

## 24. Icons/colors/Labs review checklist

- [ ] Static versus dynamic icon strategy is explicit.
- [ ] New imports use `*Icon` names.
- [ ] String-icon loader is configured before use.
- [ ] Production chunk paths are tested.
- [ ] Icon-only controls have accessible names.
- [ ] Raw palette colors are not used in place of semantic intent.
- [ ] Status is not color-only.
- [ ] Custom light/dark surfaces use semantic aliases.
- [ ] Chart palettes are appropriate and accessible.
- [ ] Labs usage is pinned, tested, and isolated.
- [ ] Layout primitives preserve semantics and focus order.
