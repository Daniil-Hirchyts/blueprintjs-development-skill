# Overlays, portals, dialogs, popovers, toasts, context, and hotkeys

Overlay behavior is where otherwise correct Blueprint applications most often fail. Focus, portal placement, z-index, dismissal, scroll locking, nested surfaces, and controlled state must be designed as one system.

## 1. Overlay architecture

Blueprint's overlay family includes:

- `Overlay2`: generic modern overlay foundation;
- deprecated `Overlay`: compatibility API;
- `Portal`: renders content outside the normal React DOM position;
- `Dialog`, `DialogBody`, `DialogFooter`;
- `MultistepDialog`, `DialogStep`;
- `Drawer`;
- `Alert`;
- `PopoverNext`: modern Floating UI-based floating surface;
- deprecated `Popover`: Popper-based compatibility API;
- `Tooltip`;
- `ContextMenu`, `ContextMenuPopover`, and singleton helpers;
- `OverlayToaster`, toast components, and toaster types;
- providers and hooks that coordinate global behavior.

The application must decide:

1. Is the surface modal or non-modal?
2. Where is it portaled?
3. What opens and closes it?
4. Where does focus move on open and close?
5. Can Escape or outside interaction dismiss it?
6. How do nested overlays dismiss?
7. How does dark theme reach it?
8. Is open state controlled or uncontrolled?
9. What happens during async work?
10. What is announced to assistive technology?

## 2. BlueprintProvider and provider stack

`BlueprintProvider` composes:

- `PortalProvider`;
- `OverlaysProvider`;
- `HotkeysProvider`.

Use it near the application root:

```tsx
import { BlueprintProvider } from "@blueprintjs/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return <BlueprintProvider>{children}</BlueprintProvider>;
}
```

### PortalProvider

Controls the portal destination and shared portal class. Use a custom container when:

- the application runs inside an embedded host;
- overlays must remain within a shadow-root or dedicated shell;
- the page has multiple independently themed roots;
- a test harness needs deterministic portal placement.

The container must exist before the overlay opens and remain mounted until all portaled content closes.

### OverlaysProvider

Coordinates the overlay stack. It helps Blueprint reason about which overlay is topmost and how nested overlays should manage focus and dismissal. Avoid accidental independent stacks created by nested providers.

### HotkeysProvider

Provides hotkey registration state and the hotkey dialog. Customize its dialog only when the application has a deliberate keyboard-help design.

## 3. Portal

**Use for:** moving a subtree to another DOM node while keeping it in the same React tree.

Portal implications:

- CSS inheritance from the logical React parent does not follow the DOM move.
- event propagation follows React's tree, which can surprise DOM-only reasoning.
- stacking is determined by the portal container and its ancestors.
- tests may need to query `document.body` or the configured container.
- SSR cannot create or inspect the portal destination during server render.

Portal checklist:

- stable mounted container;
- correct dark-theme class;
- no clipping by an unexpected overflow ancestor;
- sensible z-index stack;
- test cleanup removes portal content;
- page scrolling behavior is correct.

## 4. Overlay2

**Use for:** building a custom overlay that does not fit Dialog, Drawer, Alert, PopoverNext, or another higher-level component.

Prefer the higher-level component whenever it matches. Overlay2 requires the application to own more semantics and layout.

Important decisions commonly represented by props:

- open state;
- backdrop presence and props;
- portal behavior/container;
- focus acquisition and enforcement;
- focus return;
- Escape-key dismissal;
- outside-click dismissal;
- transition duration/name;
- lifecycle callbacks;
- lazy mounting and unmount behavior;
- scroll containment.

A custom modal must have appropriate dialog semantics, accessible name, focus entry, focus containment, and focus restoration. Do not create a modal by placing a centered Card in Overlay2 without the full behavior.

## 5. Deprecated Overlay

`Overlay` is deprecated in current v6 documentation. Do not introduce it in new code. During migration:

1. Inventory every legacy prop.
2. Compare default focus behavior.
3. Compare portal and backdrop behavior.
4. Verify lifecycle callback timing.
5. Test nested overlays.
6. Test focus return and Escape.
7. Update snapshots only after behavioral tests pass.

## 6. Dialog

**Use for:** a blocking or strongly focused workflow that requires user attention before returning to the underlying application.

Use the public composition:

```tsx
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";

<Dialog
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Edit project"
  icon="edit"
>
  <DialogBody>{/* form */}</DialogBody>
  <DialogFooter
    actions={
      <>
        <Button onClick={() => setOpen(false)} text="Cancel" />
        <Button intent="primary" type="submit" text="Save" />
      </>
    }
  />
</Dialog>;
```

### Dialog decisions

- `isOpen` should usually be controlled by product state.
- `onClose` must be idempotent.
- Use a concise title that names the task.
- Put scrollable content in the body, not the whole viewport.
- Keep footer actions stable and ordered consistently.
- Decide whether backdrop click and Escape may close the dialog.
- Prevent accidental close during irreversible or in-flight operations when necessary, but always provide a valid escape path unless the task truly cannot be interrupted.
- Use a form element so Enter submits according to normal semantics.
- Focus the first useful field or the dialog heading, not an arbitrary destructive button.
- Return focus to the opener when closing.

### Dialog sizing

Use an application class or supported size API. Avoid viewport-fixed dimensions that break at zoom or on smaller screens.

```scss
.project-dialog {
  width: min(720px, calc(100vw - 32px));
}
```

### Dialog anti-patterns

- stacking several dialogs for normal navigation;
- opening a dialog automatically without user context;
- hiding primary errors in a toast;
- using a dialog for a one-click confirmation that belongs in Alert;
- closing on backdrop while a pointer drag or text selection is occurring without testing;
- changing the opener DOM before focus can return without a fallback focus target.

## 7. DialogBody and DialogFooter

Use these public structural components rather than reproducing internal class names.

`DialogBody` provides standard body spacing and layout. Place long content in a scroll region with a maximum height when needed.

`DialogFooter` provides consistent action placement and optional minimal content. Keep primary and cancel actions distinct. Product conventions should decide whether primary is at the end and how destructive actions are separated.

## 8. MultistepDialog and DialogStep

**Use for:** a bounded sequential workflow where each step must be completed in order or users benefit from visible progress within one modal task.

Key decisions:

- Steps have stable IDs.
- Each step owns title, panel content, and next/back button behavior.
- Validate the current step before advancing.
- Preserve completed step state.
- Define whether users can jump directly between steps.
- Keep final submission separate from intermediate navigation.
- Announce step changes and update the dialog title/step heading.
- Move focus to the new step heading or first invalid field.
- Avoid using a multistep dialog for a long process that should be a routed page with persistence and deep links.

## 9. Drawer

**Use for:** a panel that slides from an edge, usually for detail inspection, filters, settings, or secondary workflows while preserving context behind it.

Key decisions:

- Choose edge and size based on content and reading direction.
- Decide modal versus non-modal interaction through supported overlay behavior.
- Use a title and close control.
- Ensure wide tables/forms inside a narrow drawer have a designed layout.
- Keep nested popovers within the correct portal/theme context.
- Restore focus to the opener.
- Avoid a Drawer for primary page navigation that should be routable.

Test all supported viewport sizes, especially when a right/left drawer competes with a persistent sidebar.

## 10. Alert

**Use for:** focused confirmation, especially destructive or high-risk actions.

```tsx
<Alert
  isOpen={confirmDelete}
  intent="danger"
  icon="trash"
  confirmButtonText="Delete project"
  cancelButtonText="Cancel"
  canEscapeKeyCancel={!deleting}
  canOutsideClickCancel={!deleting}
  loading={deleting}
  onConfirm={deleteProject}
  onCancel={() => setConfirmDelete(false)}
>
  <p>This permanently removes the project and its reports.</p>
</Alert>
```

Rules:

- Name the affected entity.
- State the consequence and reversibility.
- Use a specific confirm label, not “OK.”
- Keep intent aligned with risk.
- During async confirmation, prevent duplicate confirm and accidental close.
- Do not use Alert for ordinary informational messages.
- For typed confirmation or complex consequences, use Dialog with a form.

## 11. PopoverNext

`PopoverNext` is the preferred modern popover. It is based on Floating UI and provides placement, middleware configuration, focus behavior, portal behavior, interaction modes, dark-theme inheritance, and controlled/uncontrolled state.

### Use for

- dropdown menus;
- compact interactive forms;
- filters;
- contextual actions;
- rich explanatory content that users interact with;
- non-modal floating panels anchored to a target.

### Core state patterns

Uncontrolled:

```tsx
<PopoverNext content={<Menu>{/* items */}</Menu>}>
  <Button text="Actions" endIcon="caret-down" />
</PopoverNext>
```

Controlled:

```tsx
<PopoverNext
  isOpen={open}
  onInteraction={setOpen}
  content={<FilterPanel onApply={() => setOpen(false)} />}
>
  <Button text="Filters" active={open} />
</PopoverNext>
```

Do not pass `isOpen` without updating it in `onInteraction`; that creates an apparently frozen popover.

### Interaction kinds

Choose click for menus and interactive content. Hover interactions are appropriate for tooltip-like content and must be tested with focus and pointer movement. Do not put essential interactive forms in a hover-only popover.

### Placement and positioning

Prefer `placement` because it follows Floating UI semantics. Let automatic repositioning keep content onscreen unless the product requires a strict side.

Important concepts:

- `placement`: preferred side/alignment;
- `positioningStrategy`: `absolute` for most cases, `fixed` for certain fixed/scroll contexts;
- `boundary` and `rootBoundary`;
- `middleware`: offset, flip, shift, arrow, and other Floating UI adjustments;
- `autoUpdateOptions`: ancestor scroll/resize, element resize, layout shift, and animation-frame updates;
- `matchTargetWidth`: useful for dropdown-like surfaces;
- `arrow`: visual anchor;
- `minimal`: reduced chrome/offset behavior in versions that support it;
- `portalContainer` and `portalClassName`.

Avoid disabling positioning behavior without diagnosing the layout. A feedback loop may justify disabling `layoutShift`, but first identify which ResizeObserver-driven element is causing it.

### Focus

Important decisions:

- `autoFocus`: whether content receives application focus on open;
- `enforceFocus`: whether focus is contained;
- `shouldReturnFocusOnClose`: current PopoverNext behavior differs from legacy Popover defaults;
- `openOnTargetFocus`: important for hover/tooltips;
- `popupKind`: maps to `aria-haspopup` semantics;
- target renderer props must be spread onto the rendered target.

When using `renderTarget`, return one valid target and spread all injected handlers, refs, and ARIA props. Omitting them breaks interaction and accessibility.

### Dismissal

- `canEscapeKeyClose` controls Escape behavior.
- backdrop behavior applies to click popovers with a backdrop.
- `captureDismiss` controls whether a dismiss element closes only the current popover or also ancestors.
- `Classes.POPOVER_DISMISS` and related public classes can mark close actions when supported.
- For a menu item, normally close after action unless a multi-action workflow intentionally remains open.

### Nested popovers

Test:

- submenu inside a popover;
- tooltip on a popover target;
- date picker/select inside a popover;
- popover inside dialog/drawer;
- nested dismiss elements;
- focus return when inner and outer surfaces close in different orders.

### Target width and fill

`matchTargetWidth` sizes the content to the target. `fill` can make the target wrapper fill its container and may force a block wrapper. Confirm that wrapper changes do not break flex or inline layout.

## 12. Deprecated Popover and migration

Legacy `Popover` uses the older positioning stack. New work should use `PopoverNext`.

Migration checklist:

1. Replace position semantics with `placement` where possible.
2. Map Popper boundaries/modifiers through official migration utilities or explicit Floating UI middleware.
3. Verify portal and dark-theme behavior.
4. Compare focus-return defaults; PopoverNext generally returns focus by default where legacy behavior may not.
5. Verify hover open/close delays.
6. Verify target wrapper structure and `fill` behavior.
7. Verify nested dismiss behavior.
8. Test scrolling, resizing, transformed ancestors, sticky containers, and browser zoom.
9. Remove deprecated imports only after behavior matches.

Blueprint exports migration helpers such as position/placement and boundary/modifier conversion utilities. Treat them as transition aids, not an excuse to skip behavioral testing.

## 13. Tooltip

**Use for:** a short, non-essential explanation of a target on hover or keyboard focus.

Rules:

- Keep content concise.
- Do not place buttons, links, or form fields in a Tooltip.
- Essential instructions must be visible elsewhere.
- Ensure the target is focusable when keyboard users need the tooltip.
- For disabled buttons, wrap the button in a focusable or hoverable element because disabled native elements do not emit normal events.
- Avoid tooltips on every familiar icon.
- Test pointer movement between target and tooltip and focus behavior.

Disabled-button pattern:

```tsx
<Tooltip content="You need edit permission">
  <span tabIndex={0}>
    <Button disabled icon="edit" text="Edit" />
  </span>
</Tooltip>
```

Use the wrapper only when a tooltip is genuinely needed and ensure the wrapper's focus semantics are appropriate.

## 14. ContextMenu and ContextMenuPopover

**Use for:** contextual actions associated with a region or item, usually opened by right-click and optionally by a keyboard-accessible menu button.

Rules:

- Every context-menu command must also be reachable without right-click.
- Do not suppress the browser context menu for a large region unless the replacement is complete and expected.
- Anchor the menu to pointer coordinates or the relevant target according to the API.
- Capture the selected entity at open time; do not act on stale global selection accidentally.
- Close the menu when the entity disappears or navigation changes.
- Maintain menu semantics and disabled explanations.

The package also exposes singleton helpers such as `showContextMenu` and `hideContextMenu`. Prefer declarative components when practical; singleton APIs are useful for imperative integration points but require careful cleanup and test isolation.

## 15. Toast, Toast2, OverlayToaster, and toaster APIs

**Use for:** brief, non-blocking notifications that do not require immediate interaction.

Current public exports include compatibility-era toast names. Inspect installed deprecation annotations and prefer the current non-deprecated API.

A common current pattern uses `OverlayToaster.create` and an application-level service. Exact async creation behavior depends on the installed release; type against its declaration.

Conceptual service:

```ts
import { OverlayToaster } from "@blueprintjs/core";

const toasterPromise = OverlayToaster.create({ position: "top" });

export async function showSaveSuccess() {
  const toaster = await toasterPromise;
  toaster.show({
    intent: "success",
    icon: "tick",
    message: "Project saved",
  });
}
```

Toast rules:

- Use for confirmation, background status, or a complementary warning.
- Do not use as the sole presentation of form validation or critical failure.
- Keep messages concise and actionable.
- Use a timeout long enough to read; persistent toasts require a reason.
- Do not flood users with one toast per row/item in batch work.
- Deduplicate repeated errors.
- Include an action only when it is safe and useful, such as Undo or Retry.
- Ensure actions are keyboard reachable.
- Test dark theme and portal container.

## 16. useOverlayStack

**Use for:** advanced custom components that need to register/interact with Blueprint's overlay stack.

Do not use it for ordinary Dialog, Drawer, Alert, or PopoverNext composition. When building a custom overlay:

- register and unregister consistently;
- maintain stable overlay identity;
- respect topmost-overlay behavior;
- coordinate focus and Escape handling;
- avoid bypassing the provider stack.

Inspect installed hook types before implementation because this is an advanced API.

## 17. useHotkeys

**Use for:** registering keyboard shortcuts in function components.

Conceptual pattern:

```tsx
import { useHotkeys } from "@blueprintjs/core";

function Editor() {
  const { handleKeyDown, handleKeyUp } = useHotkeys([
    {
      combo: "mod+s",
      global: true,
      group: "Editor",
      label: "Save document",
      onKeyDown: event => {
        event.preventDefault();
        void save();
      },
    },
  ]);

  return <main onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>...</main>;
}
```

Exact return shape and descriptor types should be confirmed in installed declarations.

Hotkey rules:

- Provide visible UI for every essential action.
- Avoid browser, operating-system, screen-reader, and text-editing conflicts.
- Use `mod` conventions for cross-platform Command/Control behavior where supported.
- Prevent default only when replacing the default behavior intentionally.
- Do not fire application shortcuts while users are typing unless the combo is safe and expected.
- Group and label shortcuts for discoverability.
- Cleanly disable shortcuts when a feature or permission is unavailable.
- Test keydown/keyup semantics and repeated keys.

## 18. Focus lifecycle patterns

### Modal open

1. Store or rely on the opener element.
2. Open the modal.
3. Focus the first meaningful control or heading.
4. Contain focus while modal when appropriate.
5. Close through an explicit action, Escape, or backdrop according to product rules.
6. Restore focus to the opener or a stable fallback.

### Popover open

1. Keep target focused for simple menus unless content requires focus.
2. Move focus into interactive content when keyboard operation demands it.
3. Escape closes the topmost surface.
4. Return focus to target on close when expected.

### Entity deletion while overlay is open

If the opener or target disappears:

- close the overlay;
- focus the next logical item, collection heading, or toolbar;
- do not attempt to focus a detached node.

## 19. Async overlay workflows

For a dialog or alert that submits async work:

- keep the surface open while the result is unknown;
- show Button loading state;
- prevent duplicate actions;
- decide whether cancellation is safe;
- show server errors inside the surface;
- close only on confirmed success;
- move focus to a useful post-success target;
- use a toast as optional confirmation after close.

## 20. Overlay testing

Test user behavior rather than snapshots of transition wrappers.

Minimum cases:

- opener click opens surface;
- correct accessible role/name is present;
- initial focus is correct;
- Tab/Shift+Tab behavior is correct;
- Escape behavior matches configuration;
- backdrop/outside click behavior matches configuration;
- close button works;
- focus returns correctly;
- nested overlay closes only intended layer;
- controlled state updates through callbacks;
- portal content is removed after close;
- async loading blocks duplicate confirm;
- dark theme appears in the portal;
- scroll and resize maintain position;
- SSR/hydration has no DOM mismatch.

Disable or shorten animations in tests through supported props or test CSS rather than relying on arbitrary sleeps.

## 21. Overlay debugging matrix

| Symptom | Likely cause | Check |
|---|---|---|
| popover clipped | portal disabled or wrong container | overflow ancestors, portal props |
| popover misplaced | transformed/fixed ancestor, wrong strategy | `positioningStrategy`, placement, boundaries |
| dark dialog content is light | theme class not reaching portal | body/app class, portal class/container |
| Escape closes wrong surface | separate/nested overlay stacks | provider placement, topmost registration |
| focus disappears after close | opener unmounted or return disabled | focus-return prop, fallback target |
| target click does nothing | controlled `isOpen` not updated | `onInteraction` state flow |
| hover tooltip flickers | delay/target wrapper/pointer gap | hover props, target DOM, nested surfaces |
| test cannot find dialog | query scoped to render container | query document/configured portal |
| overlay remains in DOM | transition/lazy lifecycle | close callbacks, test timers, unmount config |
| ResizeObserver loop | position auto-update changes measured layout | middleware and autoUpdate options |

## 22. Overlay review checklist

- [ ] Highest-level matching component is used.
- [ ] Modern Overlay2/PopoverNext APIs are preferred.
- [ ] Open state model is coherent.
- [ ] Portal container and theme are correct.
- [ ] Accessible role and name are present.
- [ ] Initial focus and return focus are correct.
- [ ] Escape and outside-click behavior are intentional.
- [ ] Nested dismissal is tested.
- [ ] Async states prevent duplicate actions.
- [ ] Critical errors remain visible inside the workflow.
- [ ] Keyboard-only access exists for context-menu commands.
- [ ] Tests query portal content correctly.
