# Blueprint Table: scalable interactive data grids

`@blueprintjs/table` provides a virtualized, spreadsheet-like table for data-dense desktop applications. It is data-agnostic: the application owns records, sorting, filtering, editing, persistence, and domain validation; the table owns rendering, viewport virtualization, headers, selections, focus, resizing, reordering, freezing, and related interactions.

## 1. Installation and CSS

```bash
pnpm add @blueprintjs/core @blueprintjs/table
```

```ts
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/table/lib/css/table.css";
```

## 2. When to use Table

Use `@blueprintjs/table` when one or more are required:

- hundreds or thousands of cells;
- virtualized rendering;
- row/column headers;
- cell/row/column selection;
- keyboard-focused cell navigation;
- frozen rows or columns;
- resizable/reorderable columns or rows;
- copy-to-clipboard behavior;
- editable cells/headers;
- fine-grained loading states;
- spreadsheet-like interaction.

Use `HTMLTable` for a small semantic table where native table layout, screen-reader reading order, and print behavior matter more than grid interactions.

Blueprint Table behaves more like an interactive grid than a native document table. Accessibility requirements must be evaluated against the exact product workflow.

## 3. Public API families

Current public exports include:

### Main table

- `Table` and `Table2` compatibility-era names;
- `TableProps` and `Table2Props` types.

Inspect installed deprecation annotations and use the current non-deprecated name for the installed Blueprint 6.x release.

### Columns and cells

- `Column`;
- `Cell`;
- `EditableCell` and `EditableCell2`;
- `ColumnHeaderCell`;
- `RowHeaderCell`;
- `EditableName`;
- `HorizontalCellDivider`.

### Formats

- `TruncatedFormat` and `TruncatedPopoverMode`;
- `JSONFormat`.

### Regions and selection

- `Region`, `Regions`, `RegionCardinality`;
- `SelectionModes`;
- coordinate and interval types;
- styled region groups.

### Loading

- `TableLoadingOption`;
- `ColumnLoadingOption`;
- `RowLoadingOption`.

### Interaction and utilities

- `Clipboard`;
- `FocusMode`;
- `RenderMode`;
- `Grid`, `Rect`, coordinates;
- draggable/selectable helpers;
- resize handle and orientation types;
- context menu renderer and `CopyCellsMenuItem`;
- public `Utils`.

Avoid internal imports from package subpaths unless the symbol is documented as public and exported from the package root.

## 4. Data architecture

Blueprint Table does not receive row objects directly. It renders cells through coordinates. Keep a canonical data array and map `(rowIndex, columnIndex)` to display values.

```ts
type Employee = {
  id: string;
  name: string;
  department: string;
  salary: number;
};

const rows: Employee[] = ...;
```

```tsx
<Column
  name="Name"
  cellRenderer={rowIndex => <Cell>{rows[rowIndex]?.name ?? ""}</Cell>}
/>
```

### Stable logical identity

Row index is a viewport coordinate, not a durable business identifier. When sorting/filtering/reordering:

- maintain a view-to-data index map; or
- derive a view array of stable row objects;
- persist edits using the row's stable ID, not the current row index.

```ts
const visibleRows = useMemo(
  () => sortAndFilter(allEmployees, sort, filter),
  [allEmployees, sort, filter],
);

function employeeAt(rowIndex: number): Employee | undefined {
  return visibleRows[rowIndex];
}
```

## 5. Basic table composition

```tsx
import { Cell, Column, Table2 } from "@blueprintjs/table";

export function EmployeeTable({ rows }: { rows: Employee[] }) {
  return (
    <Table2 numRows={rows.length} enableFocusedCell>
      <Column
        name="Name"
        cellRenderer={rowIndex => <Cell>{rows[rowIndex].name}</Cell>}
      />
      <Column
        name="Department"
        cellRenderer={rowIndex => <Cell>{rows[rowIndex].department}</Cell>}
      />
      <Column
        name="Salary"
        cellRenderer={rowIndex => (
          <Cell>{formatCurrency(rows[rowIndex].salary)}</Cell>
        )}
      />
    </Table2>
  );
}
```

Use the current table name in the installed release. This skill uses `Table2` in examples where it is historically the modern virtualized API, but current v6 source may deprecate or alias compatibility names. Check declarations.

## 6. Cell renderers

A cell renderer should be:

- deterministic;
- fast;
- side-effect free;
- safe for missing/out-of-range indexes;
- stable in behavior during virtualization;
- minimally nested.

Avoid:

- data fetching in a cell renderer;
- creating large objects or formatters per cell;
- uncontrolled state whose lifetime is assumed to match a business row;
- using row index as a persistence key;
- rendering complex popovers in every cell before interaction.

Create expensive formatters once:

```ts
const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});
```

## 7. cellRendererDependencies

The table may not rerun cell renderers when external values change if the usual structural props remain the same. Supply `cellRendererDependencies` with values referenced by cell renderers.

```tsx
<Table2
  numRows={visibleRows.length}
  cellRendererDependencies={[visibleRows, locale, permissions]}
>
  ...
</Table2>
```

Use immutable values so shallow comparison detects changes.

Typical dependencies:

- sorted index map or visible rows;
- formatting locale;
- selection-related display state;
- permissions;
- validation map;
- asynchronous status map;
- theme-dependent custom renderer data.

Do not place a newly created object literal in dependencies on every render. Memoize it or list stable primitives/references.

## 8. Sorting

Blueprint Table is data-agnostic. Sorting is application-owned.

Recommended model:

```ts
type SortDirection = "asc" | "desc";
type SortState = { column: keyof Employee; direction: SortDirection } | null;
```

Render a header menu/button that updates sort state, derive `visibleRows`, and include that derived reference or sort/index map in `cellRendererDependencies`.

Sorting rules:

- use stable sorting when equal values should preserve order;
- define null placement;
- define locale-aware string comparison;
- do not compare formatted currency/date strings;
- expose sort direction in header UI and semantics;
- support keyboard access to header sort actions;
- preserve selection by row ID when sort changes.

## 9. Filtering

Filtering is also application-owned.

- Keep filter state outside the Table.
- Derive visible rows.
- Distinguish filtered-empty from data-empty and loading.
- Preserve selected entity IDs even if hidden only when the product expects persistent cross-filter selection.
- Reset or remap focused cell when the row set changes.
- Debounce remote filtering but update local filter input immediately.

## 10. Selection and regions

Selections are represented as regions: cells, full rows, full columns, or ranges depending on configuration.

Key concepts:

- controlled `selectedRegions` and selection callbacks;
- `RegionCardinality` for cell/full-row/full-column/table selections;
- `selectionModes` to restrict allowed region types;
- multiple selection;
- drag selection;
- selected region styling;
- row/column identity mapping.

Rules:

- Choose only selection modes needed by the workflow.
- Use controlled selection if other UI displays/actions depend on it.
- Convert selected row indexes to stable entity IDs immediately.
- Reconcile selection after filtering, sorting, deletion, or pagination.
- Avoid allowing cell selection when the only action is row-level.
- Provide visible count/summary for large selections.
- Ensure toolbar actions describe their scope.

```ts
function selectedEmployeeIds(
  regions: Region[],
  visibleRows: Employee[],
): Set<string> {
  const ids = new Set<string>();
  for (const region of regions) {
    const rowRange = region.rows;
    if (rowRange == null) continue;
    for (let row = rowRange[0]; row <= rowRange[1]; row += 1) {
      const employee = visibleRows[row];
      if (employee != null) ids.add(employee.id);
    }
  }
  return ids;
}
```

Confirm exact Region shape in installed types.

## 11. Focused cell

Enable focused-cell behavior when keyboard navigation across the grid is useful. Users can move with arrow keys, and selection can expand with Shift plus arrows according to configuration.

Key decisions:

- initial focus location;
- controlled versus internal focused cell;
- what happens after sorting/filtering;
- how editing starts from focused state;
- how focus leaves the grid;
- whether focus scrolling should move frozen panes correctly.

Do not trap Tab inside the table indefinitely. Arrow keys should navigate within the grid; Tab behavior should match the product's editing model.

## 12. Editing cells

Use `EditableCell`/current equivalent for in-place cell editing. The application owns canonical values and validation.

Editing lifecycle:

1. Enter edit mode through double-click, Enter, typing, or product-defined action.
2. Maintain text editing state.
3. Validate.
4. Confirm or cancel.
5. Persist by stable entity ID and column key.
6. Show pending/error state.
7. Keep focus predictable.

Example architecture:

```ts
type CellKey = `${string}:${keyof Employee}`;

type EditState = {
  key: CellKey;
  draft: string;
  status: "editing" | "saving" | "error";
  error?: string;
} | null;
```

Do not store all business state inside each virtualized cell; cells may unmount when scrolled out of view.

### Validation

- validate numeric/date input as domain values, not display strings;
- show danger intent or error indicator;
- prevent commit or allow commit with server validation according to workflow;
- preserve the rejected draft;
- allow Escape to cancel cleanly;
- avoid a toast as the only validation feedback.

## 13. EditableName and header editing

Use `EditableName` for editable column names when column schema is user-controlled.

Rules:

- prevent duplicate or empty names where invalid;
- preserve stable column IDs independent of display names;
- persist asynchronously with clear failure behavior;
- do not allow accidental rename from a single click if users frequently sort/select headers;
- ensure the header menu remains reachable.

## 14. ColumnHeaderCell and RowHeaderCell

Use custom header renderers for:

- sort menus;
- filters;
- column descriptions;
- aggregation/status;
- resize/reorder handles;
- selection controls.

Keep headers concise and avoid embedding complex forms directly in every header. A popover filter is often better.

Header accessibility:

- expose sort state;
- label icon-only actions;
- keep menu triggers keyboard accessible;
- distinguish selected header from sorted header;
- preserve focus after column reorder.

## 15. Context menus and copying

Blueprint exports context-menu types and `CopyCellsMenuItem`. The table can support selected-cell copying through context menu and keyboard shortcuts.

Rules:

- define a textual serialization for each column;
- copy raw or formatted values deliberately;
- include headers only when the action says so;
- preserve tab/newline structure;
- sanitize sensitive fields;
- make Copy available through keyboard and visible menus;
- show success/failure feedback appropriately;
- do not block the browser context menu unless the replacement is complete.

## 16. Reordering columns

Enable through the supported reordering prop. A drag handle appears in the header or interaction bar according to configuration.

For multiple contiguous columns, the documented behavior requires multiple selection and full-column selection modes.

Rules:

- store column order by stable column ID;
- update the view schema immutably;
- keep pinned/frozen columns constrained if required;
- handle disjoint/overlapping selection edge cases;
- provide a keyboard-accessible alternate reorder method for critical workflows;
- persist order with optimistic rollback on failure;
- include order/schema in renderer dependencies.

## 17. Reordering rows

Documented row reordering requires row headers, row reordering, full-row selection, and optionally multiple selection.

Rules:

- map viewport indexes to stable row IDs;
- reject reordering across forbidden groups;
- define filtered/sorted reorder semantics; many products should disable manual order while a sort is active;
- provide an alternate keyboard/menu action;
- update selection/focus after move;
- persist transactionally.

## 18. Resizing

Columns and rows can be resized through table APIs/handles.

Rules:

- set reasonable min/max sizes;
- persist by stable column ID;
- debounce persistence, not immediate visual feedback;
- support reset-to-default;
- account for text zoom and localization;
- avoid measuring every cell to calculate auto width on each render;
- test frozen columns and horizontal scroll after resize.

## 19. Freezing rows and columns

Use `numFrozenColumns` and `numFrozenRows` to pin leading columns/rows.

Rules:

- freeze only the identifiers/context users need while scrolling;
- avoid freezing so much that the scrollable viewport disappears;
- keep leading-column order deliberate;
- test shadows/dividers in light and dark themes;
- verify focus and selection crossing frozen boundaries;
- define responsive behavior on narrower screens.

## 20. Loading states

Loading can be controlled at multiple levels:

- table-wide loading options;
- column loading options;
- individual cell/header `loading` props.

Lower-level explicit state can take priority over broader loading configuration.

Use loading states for data that is expected but not ready. Distinguish:

- initial table load;
- incremental page load;
- one cell saving;
- one column recomputing;
- remote sort/filter refresh;
- empty result.

Avoid covering an entire table with loading skeletons for a one-cell update.

## 21. TruncatedFormat

**Use for:** long scalar text in a cell with popover access to the full value.

Key decisions:

- whether to detect actual truncation before enabling popover;
- popover mode/interaction;
- full-value formatting;
- copy behavior;
- accessible name/description;
- sensitive data exposure.

A native `title` is not an adequate substitute for long important content.

## 22. JSONFormat

**Use for:** displaying objects/JSON compactly in a cell and revealing full structured content in a popover.

Rules:

- handle circular/non-serializable values before passing them;
- redact secrets;
- limit deeply nested/huge objects;
- use a deterministic formatter;
- support copy when useful;
- do not render raw untrusted HTML.

## 23. Render mode and virtualization

Blueprint Table virtualizes the grid. Render-mode APIs control when/how cell batches render according to the installed version.

Virtualization implications:

- offscreen cells may not exist in the DOM;
- cell-local state is not durable business state;
- tests cannot assume all rows are rendered;
- browser Find may not find offscreen text;
- screen-reader traversal can differ from native HTML tables;
- measuring and popover anchoring require care;
- scroll-to-row behavior should use table APIs rather than querying absent DOM nodes.

Use native HTMLTable or an accessible alternative view when the primary requirement is linear document reading rather than spreadsheet interaction.

## 24. Performance engineering

### Keep renderers stable

Use `useCallback` for renderers when it meaningfully reduces child work, but do not memoize blindly.

### Avoid per-cell allocation

Move formatters, regexes, and lookup maps outside render loops.

### Precompute view data

```ts
const visibleRows = useMemo(
  () => applySort(applyFilter(rows, filters), sort),
  [rows, filters, sort],
);
```

### Avoid broad dependency churn

`cellRendererDependencies` should change only when cell output changes.

### Localize updates

Keep a map of saving/error state by entity/column so one edit does not rebuild all domain objects unnecessarily. However, if the table requires renderer dependency invalidation, include the correct stable changed map.

### Profile real workloads

Test:

- target row count;
- target column count;
- worst-case long cell content;
- frozen panes;
- selected regions;
- rapid scroll;
- editing and saving;
- dark theme;
- browser zoom.

## 25. Accessibility strategy

Because this is a custom virtualized grid, explicitly validate:

- grid/table role behavior in the installed component;
- accessible names for the grid and headers;
- keyboard movement;
- selected/focused state announcement;
- edit-mode entry and exit;
- copy actions;
- menus;
- loading state;
- error feedback;
- contrast and focus indication;
- alternate access to offscreen or aggregated data when needed.

For compliance-critical workflows, test with actual screen readers and consider providing a native table/export alternative.

## 26. Responsive strategy

Blueprint Table is desktop-oriented. On narrow screens choose one:

- horizontal scrolling with frozen identifier column;
- reduced column set;
- column chooser;
- card/detail alternative;
- dedicated mobile view;
- downloadable/exported data.

Do not simply shrink every column until content becomes unreadable.

## 27. Testing strategy

### Unit tests

- sort comparators;
- filters;
- row-ID/index mapping;
- region-to-ID conversion;
- copy serialization;
- edit validation;
- reorder reducers;
- width persistence.

### Interaction tests

- visible cells render;
- scroll reveals later rows;
- focused-cell arrows work;
- selection callback returns expected regions;
- sort menu changes order;
- edit confirm/cancel;
- invalid edit state;
- copy action;
- column resize/reorder;
- frozen panes remain visible;
- loading precedence;
- popover formats.

Do not assert every internal class or transition node. Virtualization makes broad DOM snapshots brittle.

## 28. Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| cells show stale sorted data | renderer dependencies omitted | add stable sort/view dependency |
| edit saves wrong record | row index used as identity | map index to stable ID at action time |
| selection changes after sort | selected indexes stored as business state | store IDs and remap regions |
| all rows absent in test | virtualization renders viewport only | size/scroll container, query visible rows |
| table height is zero | parent has no explicit/resolvable height | define layout height/min-height |
| popover clipped in cell | portal/overflow issue | configure popover/portal, inspect scroll container |
| scrolling is janky | expensive per-cell render/allocation | precompute, memoize, simplify cells |
| manual reorder conflicts with sort | semantics undefined | disable reorder while sorted or define rule |
| header menu inaccessible | icon div without button semantics | use Button/Menu/PopoverNext |
| frozen area consumes viewport | too many frozen columns/large widths | constrain and provide responsive policy |

## 29. Table review checklist

- [ ] Table is justified over HTMLTable.
- [ ] Stable row and column IDs exist.
- [ ] View indexes are not used as persistence identity.
- [ ] Sorting/filtering are application-owned and tested.
- [ ] `cellRendererDependencies` cover external renderer state.
- [ ] Selection maps to domain IDs safely.
- [ ] Editing state survives virtualization.
- [ ] Frozen/resizable/reorderable behavior has clear semantics.
- [ ] Loading, empty, and error states are distinct.
- [ ] Context/copy actions are keyboard accessible.
- [ ] Real target-scale performance is profiled.
- [ ] Accessibility has been tested for the product's requirements.
- [ ] Narrow-screen behavior is explicitly designed.
