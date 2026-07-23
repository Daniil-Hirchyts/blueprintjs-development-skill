# Select, Suggest, MultiSelect, Omnibar, and QueryList

`@blueprintjs/select` is a generic TypeScript package for selecting items from filterable lists. Its power comes from separating item data, equality, filtering, rendering, active keyboard state, selection, and optional item creation.

## 1. Installation and CSS

```bash
pnpm add @blueprintjs/core @blueprintjs/select
```

```ts
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
```

## 2. Public component map

Current principal exports:

- `Select<T>`: single selection from a popover list;
- `Suggest<T>`: input with autocomplete suggestions;
- `MultiSelect<T>`: multiple selection rendered through tags/input;
- `Omnibar<T>`: full-screen command/search overlay;
- `QueryList<T>`: headless state and interaction engine used by the higher-level components.

The package also exports common renderer, predicate, equality, list-item, query, and creation utilities/types. Inspect `lib/esm` declarations for the exact installed inventory.

## 3. The generic item model

Define a domain item with a stable identifier:

```ts
type Project = {
  id: string;
  name: string;
  owner: string;
  archived: boolean;
};
```

Use stable object identity or configure `itemsEqual`:

```tsx
itemsEqual="id"
```

Without a stable equality strategy, selection and active-item behavior can fail when the application reconstructs item objects after fetching or filtering.

Never use the rendered label as identity unless it is guaranteed unique and immutable.

## 4. Shared ListItemsProps contract

The shared list contract includes several important systems.

### items

The full item array. Keep its order deterministic. For remote results, decide whether it represents the current page, accumulated results, or a cached catalog.

### itemsEqual

Can be:

- a property key, such as `"id"`;
- a comparator `(a, b) => boolean`;
- omitted for strict reference equality.

Prefer a unique key property.

### itemDisabled

Can be a boolean property key or predicate. Disabled items must also be rendered visibly disabled by `itemRenderer` and should explain the reason when not obvious.

### itemPredicate

Called for individual item filtering. It should be fast because it runs once per item. It is also used with `exactMatch=true` when matching pasted values, even if `itemListPredicate` exists.

```ts
const projectPredicate: ItemPredicate<Project> = (query, project, _index, exactMatch) => {
  const normalized = query.trim().toLocaleLowerCase();
  const name = project.name.toLocaleLowerCase();
  return exactMatch ? name === normalized : name.includes(normalized);
};
```

### itemListPredicate

Operates on the whole array and can filter, rank, reorder, add, or remove items. It takes priority over `itemPredicate` for list filtering, but `itemPredicate` may still be used for exact paste matching.

Use it for fuzzy ranking or query algorithms that need global context.

### itemRenderer

Required for rendering an item. It receives render props including active state, disabled state, item modifiers, click handler, query, and index according to installed types.

Correct renderer behavior:

- return a focus/interaction-compatible Blueprint item, commonly `MenuItem`;
- attach the supplied click handler;
- reflect active and disabled state;
- use stable text and secondary labels;
- use the correct `roleStructure` where required;
- highlight query text without destroying accessible text;
- avoid side effects during render.

```tsx
const renderProject: ItemRenderer<Project> = (project, props) => {
  if (!props.modifiers.matchesPredicate) return null;

  return (
    <MenuItem
      key={project.id}
      text={project.name}
      label={project.owner}
      active={props.modifiers.active}
      disabled={props.modifiers.disabled}
      onClick={props.handleClick}
      roleStructure="listoption"
    />
  );
};
```

Use exact renderer prop names from installed declarations.

### itemListRenderer

Overrides the entire dropdown content. The default usually renders matching items in a Menu, uses `initialContent` when the query is empty, and `noResults` when no items match.

Use a custom list renderer for:

- virtualized results;
- grouped sections;
- pagination/load-more UI;
- custom headers/footers;
- richer empty/loading states.

When replacing it, preserve keyboard active-item scrolling, listbox/menu semantics, and click behavior.

### initialContent

Rendered when the query is empty. If omitted, all items or the empty-query predicate result are shown. Explicit `null` renders nothing.

Use it for recently used items, guidance, or curated defaults.

### noResults

Rendered when there are no matches. When using a `MenuItem`, apply the role structure required by the Select docs, commonly `roleStructure="listoption"`.

Distinguish no matches from loading and remote failure.

### activeItem and onActiveItemChange

Controls the keyboard-focused item. Omit `activeItem` for internal state. Control it when external preview, coordinated panels, or command context depends on focus.

`null` means no active item. `undefined` generally indicates uncontrolled behavior. A special create-new-item sentinel may be used internally; use package utilities instead of constructing private objects.

### onItemSelect

Required selection callback. It is invoked for pointer or keyboard selection. Keep it deterministic and close/update the host surface according to product behavior.

### query and onQueryChange

`query` makes query text controlled. Provide `onQueryChange`. Avoid controlled query unless the application needs persistence, URL synchronization, remote search, or shared state.

### onItemsPaste

Used when pasted text resolves to multiple items. Define separators and exact matching behavior through the relevant component APIs. Deduplicate selected items deliberately.

### resetOnQuery and resetOnSelect

These determine active-item and query resets. Choose values based on workflow:

- command palette often resets after execution/close;
- iterative multi-selection may keep the query or clear it;
- Suggest may keep selected text rather than reset to empty.

### scrollToActiveItem

In controlled active-item mode, controls whether external changes always scroll into view. Disable only when automatic scrolling conflicts with a deliberate viewport experience.

## 5. Create-new-item flow

Creation requires both transformation and rendering:

- `createNewItemFromQuery(query)` returns one or more new domain items;
- `createNewItemRenderer(query, active, handleClick)` renders the selectable creation option;
- `createNewItemPosition` places it first or last.

Rules:

- normalize query consistently;
- suppress creation when an exact existing item matches;
- validate before rendering the creation option;
- use a temporary client ID only if the domain supports optimistic creation;
- distinguish creating a local token from creating a server entity;
- handle server failure without losing the query;
- prevent duplicate creation through Enter and click races.

```ts
function createProjectFromQuery(query: string): Project {
  return {
    id: `draft:${crypto.randomUUID()}`,
    name: query.trim(),
    owner: "Unassigned",
    archived: false,
  };
}
```

For server-backed creation, `createNewItemFromQuery` can produce a draft object, while `onItemSelect` starts the async mutation. Keep pending state visible and reconcile the server item by stable ID.

## 6. Select<T>

**Use for:** choosing one item from a searchable popover list where the closed target is application-owned.

Typical composition:

```tsx
<Select<Project>
  items={projects}
  itemsEqual="id"
  itemPredicate={projectPredicate}
  itemRenderer={renderProject}
  onItemSelect={setSelectedProject}
  noResults={<MenuItem disabled text="No projects found" roleStructure="listoption" />}
>
  <Button
    text={selectedProject?.name ?? "Choose a project"}
    endIcon="double-caret-vertical"
    alignText="start"
    fill
  />
</Select>
```

Key decisions:

- The child target must communicate current selection.
- Use a Button/AnchorButton appropriate to the action.
- Mark target active while open if supported/controlled.
- Close on selection unless the workflow requires additional interaction.
- Ensure selection equality works after remote refresh.
- Use `matchTargetWidth` through popover props for dropdown alignment when appropriate.
- For a very small native list, prefer HTMLSelect.

## 7. Suggest<T>

**Use for:** autocomplete where the text input itself is the primary target and selected item text is shown in the input.

Key decisions:

- `inputValueRenderer(item)` converts selection to input text.
- query text and selected item are distinct states.
- decide whether free text without a selected item is allowed.
- decide what blur does to an unmatched query.
- handle clear behavior.
- distinguish active keyboard item from selected item.
- support creation only when the product accepts new values.

State model:

```ts
type SuggestState<T> = {
  selectedItem: T | null;
  query: string;
};
```

Do not infer selection solely from displayed text when labels are not unique.

Suggest is appropriate for search-and-select. It is not a generic remote search results page.

## 8. MultiSelect<T>

**Use for:** selecting multiple items from a searchable catalog, usually rendering selections as tags.

Key decisions:

- selected items are application-owned;
- `onItemSelect` adds/removes or only adds according to design;
- selected tags need stable identity and accessible remove controls;
- decide whether selected items remain in results, become disabled, or disappear;
- use `tagRenderer`/tag props according to installed API;
- handle paste matching;
- control query when remote search is used;
- support clear-all only with an accessible label and safe behavior.

Recommended toggle helper:

```ts
function toggleById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some(candidate => candidate.id === item.id)
    ? items.filter(candidate => candidate.id !== item.id)
    : [...items, item];
}
```

For large selections, summarize overflow and provide a separate management view. Hundreds of tags create poor performance and usability.

### MultiSelect versus TagInput

Use MultiSelect when values come from an existing item catalog and require search/rendering. Use TagInput when users enter free-form tokens.

## 9. Omnibar<T>

**Use for:** a full-screen command palette or global search overlay.

Key decisions:

- global hotkey opens it;
- a visible entry point also exists;
- query resets or persists intentionally;
- active command updates a preview only when useful;
- recently used commands appear for empty query;
- commands are permission-filtered;
- executing a command closes the overlay unless the command opens a nested step;
- errors are shown without trapping users;
- the overlay has a clear accessible name;
- focus returns to the prior context.

Command model:

```ts
type Command = {
  id: string;
  label: string;
  keywords: string[];
  icon?: string;
  disabledReason?: string;
  run: () => void | Promise<void>;
};
```

Do not render every application object in one unbounded Omnibar. Group or route global search results intentionally.

## 10. QueryList<T>

**Use for:** building a custom select-like experience while reusing Blueprint's query, active-item, keyboard, filtering, and selection engine.

QueryList is headless: the renderer receives state and handlers that the application must connect correctly.

Use it for:

- virtualized lists;
- split-pane search with detail preview;
- grouped results;
- custom popover/overlay hosts;
- nonstandard layouts that still behave like a filterable selection list.

Responsibilities when using QueryList directly:

- render the input and attach query handlers;
- render matching items;
- attach item click handlers;
- expose active item visually and semantically;
- preserve keyboard navigation;
- scroll active items into view;
- render create/new, initial, no-results, loading, and error states;
- provide listbox/menu roles and relationships;
- handle composition/IME correctly through normal input events.

Do not use QueryList merely to avoid learning Select props; it increases application responsibility.

## 11. Filtering and ranking

### Simple contains filter

Suitable for small local arrays.

### Tokenized filter

Split query into normalized tokens and require each token to match one or more fields.

### Fuzzy ranking

Use `itemListPredicate` to calculate a score and sort results. Keep ranking deterministic and test it independently.

### Diacritics and locale

Use `toLocaleLowerCase(locale)` and optional Unicode normalization. Do not strip characters in a way that changes identity.

### Performance

- precompute searchable normalized text when items change;
- avoid repeated JSON serialization;
- memoize predicates where useful;
- use a remote endpoint or search index for very large catalogs;
- debounce remote query, but keep input responsive;
- cancel stale requests;
- display loading separately from no results.

## 12. Remote/async search

State model:

```ts
type RemoteListState<T> = {
  query: string;
  items: T[];
  status: "idle" | "loading" | "success" | "error";
  requestId: number;
};
```

Rules:

1. Debounce network work, not input state.
2. Abort stale requests.
3. Ignore responses older than the latest request.
4. Preserve selected items even if not in current search results.
5. Show loading state while retaining previous results only if that behavior is deliberate.
6. Show remote error with Retry, not “No results.”
7. Cache common queries where beneficial.
8. Sanitize/highlight text without injecting HTML.

## 13. Virtualization

A custom `itemListRenderer` or QueryList renderer can host a virtualized list.

Requirements:

- map virtual row index to the filtered item array;
- keep active item visible;
- provide stable item keys;
- measure variable-height rows or use fixed heights;
- expose correct total/list semantics as feasible;
- preserve pointer and keyboard selection;
- rerender when active state changes;
- include creation/no-result/loading rows outside or within the virtual model coherently.

Do not virtualize a list of 30 simple items. The complexity is justified for hundreds/thousands or expensive rows.

## 14. Grouping

Grouping is an item-list rendering concern. A group model can be derived after filtering:

```ts
type Group<T> = { label: string; items: T[] };
```

Rules:

- keyboard order must follow visual order;
- group headings are not selectable;
- empty groups disappear;
- active-item scrolling accounts for headings;
- group labels are exposed semantically;
- ranking within/between groups is deterministic.

## 15. Accessibility

A select-like surface needs:

- accessible input/target name;
- correct expanded and popup relationship;
- listbox/menu semantics matching interaction;
- active option conveyed programmatically;
- disabled items conveyed programmatically;
- keyboard navigation;
- Escape behavior;
- no-results/loading/error status;
- selected value exposed in target/input;
- removable tags with labeled remove controls.

Do not create nested interactive controls inside an option unless the pattern and keyboard behavior are deliberately redesigned.

## 16. Keyboard behavior

Verify:

- ArrowDown/ArrowUp moves active item.
- Enter selects active item or creates valid item.
- Escape closes the surface or clears query according to documented behavior.
- Home/End/Page keys work where supported.
- Tab moves focus according to host behavior.
- disabled items are skipped.
- IME composition does not accidentally select on Enter.
- paste handles exact matching and multiple values.

Avoid replacing default handlers unless necessary.

## 17. Item renderer quality

A high-quality renderer:

- uses one concise primary label;
- uses secondary text for metadata;
- highlights matches without changing spoken content;
- shows selected state with icon/check and semantics;
- reflects disabled state and optional reason;
- avoids expensive hooks or data fetching;
- does not mutate item data;
- returns `null` when the renderer contract indicates a non-match;
- attaches supplied handler exactly once.

## 18. Common failure modes

### Selection disappears after fetch

Cause: strict object equality with reconstructed objects. Fix: `itemsEqual="id"` or comparator.

### Query is frozen

Cause: controlled `query` without `onQueryChange` state update.

### Keyboard highlight moves but click does not work

Cause: item renderer did not attach supplied click handler.

### No-results item has incorrect semantics

Cause: MenuItem missing the list-option role structure expected by Select.

### Create item appears for an exact match

Cause: exact-match predicate is too permissive or normalization differs.

### Popover is too narrow/clipped

Cause: target width/portal/overflow configuration. Check PopoverNext props passed through the component.

### Remote results race

Cause: stale responses overwrite latest query. Use abort/request IDs.

### MultiSelect duplicates

Cause: selection uses object identity rather than canonical key.

## 19. Testing

Unit-test:

- equality comparator;
- predicates and ranking;
- normalization;
- creation validation;
- selection add/remove helpers;
- remote request ordering.

Interaction-test:

- open/close;
- input typing;
- result filtering;
- keyboard active item;
- Enter selection;
- disabled skip;
- no results;
- item creation;
- paste;
- MultiSelect tag removal;
- remote loading/error/retry;
- focus return;
- dark theme and portal behavior.

Prefer role/name queries. Avoid snapshots of private menu structure.

## 20. Select review checklist

- [ ] Item type has stable identity.
- [ ] `itemsEqual` is correct after data refresh.
- [ ] Predicate exact-match behavior is defined.
- [ ] Item renderer attaches supplied handlers and state.
- [ ] Query control is intentional.
- [ ] Loading, no results, and error are distinct.
- [ ] Disabled items explain restrictions.
- [ ] Creation suppresses duplicates and handles failure.
- [ ] Remote requests cannot race.
- [ ] Large lists use justified optimization.
- [ ] Keyboard and assistive-technology behavior is tested.
- [ ] Portal, target width, focus, and dark theme are correct.
