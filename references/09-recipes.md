# Implementation recipes

These recipes show complete patterns rather than exhaustive prop references. Confirm exact types against the installed Blueprint 6.x packages.

## Recipe 1 — Application root with provider, theme, and focus setup

```tsx
// app/AppProviders.tsx
import {
  BlueprintProvider,
  Classes,
  FocusStyleManager,
} from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect } from "react";

export function AppProviders({
  children,
  darkMode,
}: {
  children: React.ReactNode;
  darkMode: boolean;
}) {
  useEffect(() => {
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  return (
    <div className={classNames("app-root", { [Classes.DARK]: darkMode })}>
      <BlueprintProvider portalClassName={darkMode ? Classes.DARK : undefined}>
        {children}
      </BlueprintProvider>
    </div>
  );
}
```

```ts
// main.tsx
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/table/lib/css/table.css";
```

For a body-level dark class, synchronize it through an effect and remove it during cleanup.

## Recipe 2 — Accessible icon toolbar

```tsx
import { Button, ButtonGroup } from "@blueprintjs/core";

export function EditorToolbar() {
  return (
    <ButtonGroup role="toolbar" aria-label="Document editing">
      <Button icon="undo" aria-label="Undo" variant="minimal" />
      <Button icon="redo" aria-label="Redo" variant="minimal" />
      <Button icon="duplicate" aria-label="Duplicate" variant="minimal" />
      <Button icon="trash" aria-label="Delete" intent="danger" variant="minimal" />
    </ButtonGroup>
  );
}
```

Do not use Tooltip as the only accessible name; add `aria-label` to each button.

## Recipe 3 — Validated profile form

```tsx
import { Button, FormGroup, InputGroup, TextArea } from "@blueprintjs/core";
import { FormEvent, useMemo, useState } from "react";

type Profile = { name: string; bio: string };

export function ProfileForm({ save }: { save: (profile: Profile) => Promise<void> }) {
  const [profile, setProfile] = useState<Profile>({ name: "", bio: "" });
  const [touched, setTouched] = useState({ name: false });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [serverError, setServerError] = useState<string>();

  const nameError = useMemo(() => {
    const value = profile.name.trim();
    if (value.length === 0) return "Enter a name.";
    if (value.length > 80) return "Use 80 characters or fewer.";
    return undefined;
  }, [profile.name]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ name: true });
    if (nameError != null || status === "saving") return;

    setStatus("saving");
    setServerError(undefined);
    try {
      await save({ ...profile, name: profile.name.trim() });
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setServerError(error instanceof Error ? error.message : "Profile could not be saved.");
    }
  }

  const showNameError = touched.name && nameError != null;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGroup
        label="Display name"
        labelFor="profile-name"
        helperText={showNameError ? nameError : "Shown to collaborators."}
        intent={showNameError ? "danger" : "none"}
      >
        <InputGroup
          id="profile-name"
          value={profile.name}
          onValueChange={name => setProfile(current => ({ ...current, name }))}
          onBlur={() => setTouched({ name: true })}
          intent={showNameError ? "danger" : "none"}
          aria-invalid={showNameError}
          autoComplete="name"
        />
      </FormGroup>

      <FormGroup label="Biography" labelFor="profile-bio">
        <TextArea
          id="profile-bio"
          fill
          value={profile.bio}
          onChange={event =>
            setProfile(current => ({ ...current, bio: event.currentTarget.value }))
          }
        />
      </FormGroup>

      {serverError != null && (
        <p role="alert" className="form-error">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        intent="primary"
        loading={status === "saving"}
        text="Save profile"
      />
    </form>
  );
}
```

## Recipe 4 — Composite URL control

```tsx
import { Button, ControlGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { useState } from "react";

export function UrlControl() {
  const [protocol, setProtocol] = useState("https://");
  const [host, setHost] = useState("");

  function open() {
    const url = new URL(`${protocol}${host}`);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <ControlGroup fill>
      <HTMLSelect
        aria-label="Protocol"
        value={protocol}
        onChange={event => setProtocol(event.currentTarget.value)}
        options={["https://", "http://"]}
      />
      <InputGroup
        fill
        aria-label="Host"
        placeholder="example.com"
        value={host}
        onValueChange={setHost}
      />
      <Button text="Open" endIcon="share" onClick={open} disabled={host.length === 0} />
    </ControlGroup>
  );
}
```

Validate untrusted URLs and define product policy before opening them.

## Recipe 5 — Destructive Alert with async confirmation

```tsx
import { Alert, Button } from "@blueprintjs/core";
import { useState } from "react";

export function DeleteProjectButton({
  projectName,
  deleteProject,
}: {
  projectName: string;
  deleteProject: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProject();
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button intent="danger" icon="trash" text="Delete" onClick={() => setOpen(true)} />
      <Alert
        isOpen={open}
        intent="danger"
        icon="trash"
        confirmButtonText={`Delete ${projectName}`}
        cancelButtonText="Cancel"
        loading={deleting}
        canEscapeKeyCancel={!deleting}
        canOutsideClickCancel={!deleting}
        onConfirm={() => void confirm()}
        onCancel={() => setOpen(false)}
      >
        <p>This action permanently removes the project and cannot be undone.</p>
      </Alert>
    </>
  );
}
```

Add visible inline error state for failed deletion rather than closing silently.

## Recipe 6 — Dialog form with correct footer

```tsx
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
} from "@blueprintjs/core";
import { FormEvent, useState } from "react";

export function RenameDialog({
  isOpen,
  initialName,
  onClose,
  onRename,
}: {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next = name.trim();
    if (next.length === 0 || saving) return;
    setSaving(true);
    setError(undefined);
    try {
      await onRename(next);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Rename failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={saving ? undefined : onClose} title="Rename project">
      <form onSubmit={submit}>
        <DialogBody>
          <FormGroup
            label="Project name"
            labelFor="rename-project"
            helperText={error}
            intent={error ? "danger" : "none"}
          >
            <InputGroup
              id="rename-project"
              autoFocus
              value={name}
              onValueChange={setName}
              intent={error ? "danger" : "none"}
            />
          </FormGroup>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button text="Cancel" onClick={onClose} disabled={saving} />
              <Button
                type="submit"
                intent="primary"
                loading={saving}
                disabled={name.trim().length === 0}
                text="Rename"
              />
            </>
          }
        />
      </form>
    </Dialog>
  );
}
```

Synchronize `name` with `initialName` when opening for different entities; a keyed dialog or effect can handle this.

## Recipe 7 — Filter Drawer

```tsx
import { Button, Drawer, DrawerSize, FormGroup, Switch } from "@blueprintjs/core";
import { useState } from "react";

export function FilterDrawer() {
  const [open, setOpen] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  return (
    <>
      <Button icon="filter" text="Filters" onClick={() => setOpen(true)} />
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Report filters"
        icon="filter"
        size={DrawerSize.SMALL}
      >
        <div className="drawer-content">
          <FormGroup label="Availability">
            <Switch
              checked={includeArchived}
              label="Include archived projects"
              onChange={event => setIncludeArchived(event.currentTarget.checked)}
            />
          </FormGroup>
        </div>
      </Drawer>
    </>
  );
}
```

Verify current Drawer size APIs in installed declarations.

## Recipe 8 — Controlled PopoverNext menu

```tsx
import { Button, Menu, MenuItem, PopoverNext } from "@blueprintjs/core";
import { useState } from "react";

export function ActionsMenu() {
  const [open, setOpen] = useState(false);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <PopoverNext
      isOpen={open}
      onInteraction={setOpen}
      placement="bottom-end"
      content={
        <Menu>
          <MenuItem icon="edit" text="Edit" onClick={() => run(() => console.log("edit"))} />
          <MenuItem icon="duplicate" text="Duplicate" onClick={() => run(() => console.log("copy"))} />
          <MenuItem intent="danger" icon="trash" text="Delete" onClick={() => run(() => console.log("delete"))} />
        </Menu>
      }
    >
      <Button active={open} text="Actions" endIcon="caret-down" />
    </PopoverNext>
  );
}
```

## Recipe 9 — Tooltip for disabled control

```tsx
import { Button, Tooltip } from "@blueprintjs/core";

export function PermissionButton({ canEdit }: { canEdit: boolean }) {
  if (canEdit) {
    return <Button icon="edit" text="Edit" />;
  }

  return (
    <Tooltip content="You need edit permission">
      <span tabIndex={0} aria-label="Edit unavailable: edit permission required">
        <Button disabled icon="edit" text="Edit" />
      </span>
    </Tooltip>
  );
}
```

Avoid redundant focus stops if the explanation is already visible.

## Recipe 10 — Toaster service

```ts
// app/toaster.ts
import { OverlayToaster } from "@blueprintjs/core";

const toaster = OverlayToaster.create({ position: "top" });

export async function notifySuccess(message: string) {
  const instance = await toaster;
  return instance.show({ intent: "success", icon: "tick", message });
}

export async function notifyError(message: string) {
  const instance = await toaster;
  return instance.show({ intent: "danger", icon: "error", message, timeout: 7000 });
}
```

Confirm whether `create` returns a Promise in the installed release. Keep this module browser-only in SSR frameworks.

## Recipe 11 — Select with stable equality

```tsx
import { Button, MenuItem } from "@blueprintjs/core";
import { Select, type ItemPredicate, type ItemRenderer } from "@blueprintjs/select";

export type Team = { id: string; name: string; memberCount: number };

const filterTeam: ItemPredicate<Team> = (query, team, _index, exact) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const normalizedName = team.name.toLocaleLowerCase();
  return exact ? normalizedName === normalizedQuery : normalizedName.includes(normalizedQuery);
};

const renderTeam: ItemRenderer<Team> = (team, props) => {
  if (!props.modifiers.matchesPredicate) return null;
  return (
    <MenuItem
      key={team.id}
      text={team.name}
      label={`${team.memberCount} members`}
      active={props.modifiers.active}
      disabled={props.modifiers.disabled}
      onClick={props.handleClick}
      roleStructure="listoption"
    />
  );
};

export function TeamSelect({
  teams,
  selected,
  onSelect,
}: {
  teams: Team[];
  selected: Team | null;
  onSelect: (team: Team) => void;
}) {
  return (
    <Select<Team>
      items={teams}
      itemsEqual="id"
      itemPredicate={filterTeam}
      itemRenderer={renderTeam}
      onItemSelect={onSelect}
      noResults={<MenuItem disabled text="No teams found" roleStructure="listoption" />}
    >
      <Button
        fill
        alignText="start"
        text={selected?.name ?? "Choose a team"}
        endIcon="double-caret-vertical"
      />
    </Select>
  );
}
```

Renderer prop shapes can change; check the installed `ItemRenderer` type.

## Recipe 12 — Suggest autocomplete

```tsx
import { MenuItem } from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";

export function CitySuggest({ cities }: { cities: City[] }) {
  const [selected, setSelected] = useState<City | null>(null);

  return (
    <Suggest<City>
      items={cities}
      itemsEqual="id"
      selectedItem={selected}
      onItemSelect={setSelected}
      inputValueRenderer={city => city.name}
      itemPredicate={(query, city) =>
        city.searchText.includes(query.trim().toLocaleLowerCase())
      }
      itemRenderer={(city, props) =>
        props.modifiers.matchesPredicate ? (
          <MenuItem
            key={city.id}
            text={city.name}
            label={city.country}
            active={props.modifiers.active}
            onClick={props.handleClick}
            roleStructure="listoption"
          />
        ) : null
      }
    />
  );
}
```

Define `City` and normalized `searchText` in domain code.

## Recipe 13 — MultiSelect with immutable selection

```tsx
import { MenuItem } from "@blueprintjs/core";
import { MultiSelect } from "@blueprintjs/select";

export function PeopleMultiSelect({ people }: { people: Person[] }) {
  const [selected, setSelected] = useState<Person[]>([]);

  function isSelected(person: Person) {
    return selected.some(item => item.id === person.id);
  }

  function toggle(person: Person) {
    setSelected(current =>
      current.some(item => item.id === person.id)
        ? current.filter(item => item.id !== person.id)
        : [...current, person],
    );
  }

  return (
    <MultiSelect<Person>
      items={people}
      itemsEqual="id"
      selectedItems={selected}
      onItemSelect={toggle}
      tagRenderer={person => person.name}
      tagInputProps={{
        onRemove: (_value, index) =>
          setSelected(current => current.filter((_, i) => i !== index)),
      }}
      itemPredicate={(query, person) =>
        person.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
      }
      itemRenderer={(person, props) =>
        props.modifiers.matchesPredicate ? (
          <MenuItem
            key={person.id}
            icon={isSelected(person) ? "tick" : "blank"}
            text={person.name}
            active={props.modifiers.active}
            onClick={props.handleClick}
            roleStructure="listoption"
          />
        ) : null
      }
    />
  );
}
```

Verify exact `selectedItems`, tag, and item renderer props in the installed release.

## Recipe 14 — Omnibar command palette

```tsx
import { MenuItem } from "@blueprintjs/core";
import { Omnibar } from "@blueprintjs/select";
import { useHotkeys } from "@blueprintjs/core";
import { useState } from "react";

type Command = {
  id: string;
  label: string;
  keywords: string;
  icon?: string;
  run: () => void;
};

export function CommandPalette({ commands }: { commands: Command[] }) {
  const [open, setOpen] = useState(false);

  useHotkeys([
    {
      combo: "mod+k",
      global: true,
      group: "Navigation",
      label: "Open command palette",
      onKeyDown: event => {
        event.preventDefault();
        setOpen(true);
      },
    },
  ]);

  return (
    <Omnibar<Command>
      isOpen={open}
      onClose={() => setOpen(false)}
      items={commands}
      itemsEqual="id"
      onItemSelect={command => {
        setOpen(false);
        command.run();
      }}
      itemPredicate={(query, command) => {
        const q = query.trim().toLocaleLowerCase();
        return `${command.label} ${command.keywords}`.toLocaleLowerCase().includes(q);
      }}
      itemRenderer={(command, props) =>
        props.modifiers.matchesPredicate ? (
          <MenuItem
            key={command.id}
            icon={command.icon as never}
            text={command.label}
            active={props.modifiers.active}
            onClick={props.handleClick}
            roleStructure="listoption"
          />
        ) : null
      }
      noResults={<MenuItem disabled text="No commands found" roleStructure="listoption" />}
    />
  );
}
```

Replace the cast with a correctly typed `IconName` in production.

## Recipe 15 — Date-only field adapter

```tsx
import { FormGroup } from "@blueprintjs/core";
import { DateInput } from "@blueprintjs/datetime";
import { format, isValid, parse } from "date-fns";

const DATE_FORMAT = "dd/MM/yyyy";

function parseDate(text: string): Date | null {
  const value = parse(text, DATE_FORMAT, new Date());
  return isValid(value) ? value : null;
}

function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function DueDateField({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  return (
    <FormGroup label="Due date" labelFor="due-date" helperText="Format: DD/MM/YYYY">
      <DateInput
        value={value}
        onChange={onChange}
        formatDate={formatDate}
        parseDate={parseDate}
        placeholder={DATE_FORMAT.toUpperCase()}
        inputProps={{ id: "due-date" }}
      />
    </FormGroup>
  );
}
```

Confirm DateInput formatter/parser prop names and inputProps shape in installed declarations.

## Recipe 16 — Date range with shortcuts

```tsx
import { DateRangePicker, type DateRange } from "@blueprintjs/datetime";
import { endOfToday, startOfToday, subDays } from "date-fns";
import { useState } from "react";

export function ReportRangePicker() {
  const [range, setRange] = useState<DateRange>([null, null]);

  const shortcuts = [
    {
      label: "Today",
      dateRange: [startOfToday(), endOfToday()] as DateRange,
    },
    {
      label: "Last 7 days",
      dateRange: [subDays(startOfToday(), 6), endOfToday()] as DateRange,
    },
  ];

  return <DateRangePicker value={range} onChange={setRange} shortcuts={shortcuts} />;
}
```

For long-lived mounted screens, calculate relative shortcuts at interaction/render time so midnight does not make them stale.

## Recipe 17 — Timezone selection model

```tsx
import { TimezoneSelect } from "@blueprintjs/datetime";
import { useState } from "react";

export function TimezoneField() {
  const [timezone, setTimezone] = useState("Europe/Paris");
  return (
    <TimezoneSelect
      value={timezone}
      onChange={setTimezone}
      inputProps={{ "aria-label": "Timezone" }}
    />
  );
}
```

Check exact value/onChange types. Store the IANA identifier, not the current offset.

## Recipe 18 — Tree with immutable expansion

```tsx
import { Tree, type TreeNodeInfo } from "@blueprintjs/core";
import { useState } from "react";

function mapNode(
  nodes: TreeNodeInfo[],
  targetId: string | number,
  change: (node: TreeNodeInfo) => TreeNodeInfo,
): TreeNodeInfo[] {
  return nodes.map(node => {
    if (node.id === targetId) return change(node);
    return node.childNodes == null
      ? node
      : { ...node, childNodes: mapNode(node.childNodes, targetId, change) };
  });
}

export function FileTree({ initial }: { initial: TreeNodeInfo[] }) {
  const [nodes, setNodes] = useState(initial);

  return (
    <Tree
      contents={nodes}
      onNodeExpand={node =>
        setNodes(current => mapNode(current, node.id, value => ({ ...value, isExpanded: true })))
      }
      onNodeCollapse={node =>
        setNodes(current => mapNode(current, node.id, value => ({ ...value, isExpanded: false })))
      }
      onNodeClick={node =>
        setNodes(current => mapNode(current, node.id, value => ({ ...value, isSelected: true })))
      }
    />
  );
}
```

A production selection handler should clear or preserve other selections according to product rules.

## Recipe 19 — Table with sorting and renderer dependencies

```tsx
import { Menu, MenuItem } from "@blueprintjs/core";
import { Cell, Column, ColumnHeaderCell, Table2 } from "@blueprintjs/table";
import { useMemo, useState } from "react";

type Row = { id: string; name: string; score: number };
type Sort = { key: "name" | "score"; direction: "asc" | "desc" };

export function ScoreTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<Sort>({ key: "score", direction: "desc" });

  const visibleRows = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      return (left < right ? -1 : left > right ? 1 : 0) * direction;
    });
  }, [rows, sort]);

  function header(name: string, key: Sort["key"]) {
    return (
      <ColumnHeaderCell
        name={name}
        menuRenderer={() => (
          <Menu>
            <MenuItem text="Sort ascending" onClick={() => setSort({ key, direction: "asc" })} />
            <MenuItem text="Sort descending" onClick={() => setSort({ key, direction: "desc" })} />
          </Menu>
        )}
      />
    );
  }

  return (
    <Table2
      numRows={visibleRows.length}
      enableFocusedCell
      cellRendererDependencies={[visibleRows]}
    >
      <Column
        name="Name"
        columnHeaderCellRenderer={() => header("Name", "name")}
        cellRenderer={rowIndex => <Cell>{visibleRows[rowIndex]?.name}</Cell>}
      />
      <Column
        name="Score"
        columnHeaderCellRenderer={() => header("Score", "score")}
        cellRenderer={rowIndex => <Cell>{visibleRows[rowIndex]?.score}</Cell>}
      />
    </Table2>
  );
}
```

Check current header renderer signatures and Table name.

## Recipe 20 — Editable table cell by stable ID

```tsx
import { Column, EditableCell2, Table2 } from "@blueprintjs/table";

export function EditablePeopleTable({
  rows,
  updateName,
}: {
  rows: Person[];
  updateName: (id: string, name: string) => void;
}) {
  return (
    <Table2 numRows={rows.length} cellRendererDependencies={[rows]}>
      <Column
        name="Name"
        cellRenderer={rowIndex => {
          const person = rows[rowIndex];
          return (
            <EditableCell2
              value={person.name}
              onConfirm={value => updateName(person.id, value.trim())}
            />
          );
        }}
      />
    </Table2>
  );
}
```

Use the current editable cell export. Add validation, async state, and error preservation for production.

## Recipe 21 — Async remote Select with stale-request protection

```tsx
import { Spinner } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { useEffect, useRef, useState } from "react";

export function RemoteProjectSelect() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Project[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const request = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      setItems([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const current = ++request.current;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/projects?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const next = (await response.json()) as Project[];
        if (request.current === current) {
          setItems(next);
          setStatus("idle");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (request.current === current) setStatus("error");
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <Select<Project>
      query={query}
      onQueryChange={setQuery}
      items={items}
      itemsEqual="id"
      itemRenderer={renderProject}
      onItemSelect={project => console.log(project.id)}
      noResults={
        status === "loading" ? <Spinner size={20} /> : status === "error" ? "Search failed" : "No results"
      }
    >
      <Button text="Find project" />
    </Select>
  );
}
```

Use Blueprint MenuItems/Callouts with correct role structure for production no-results content.

## Recipe 22 — NonIdealState for distinct empty/error conditions

```tsx
import { Button, NonIdealState } from "@blueprintjs/core";

export function ResultsState({
  status,
  retry,
}: {
  status: "empty" | "filtered-empty" | "error";
  retry: () => void;
}) {
  if (status === "error") {
    return (
      <NonIdealState
        icon="error"
        title="Reports could not be loaded"
        description="Check your connection and try again."
        action={<Button intent="primary" text="Retry" onClick={retry} />}
      />
    );
  }

  if (status === "filtered-empty") {
    return (
      <NonIdealState
        icon="filter-remove"
        title="No reports match these filters"
        description="Change or clear the active filters."
      />
    );
  }

  return (
    <NonIdealState
      icon="document"
      title="No reports yet"
      description="Create the first report to start tracking results."
    />
  );
}
```

## Recipe 23 — Responsive section with OverflowList

```tsx
import { Button, Menu, MenuItem, OverflowList, PopoverNext } from "@blueprintjs/core";

export function ActionOverflow({ actions }: { actions: Action[] }) {
  return (
    <OverflowList<Action>
      items={actions}
      collapseFrom="start"
      visibleItemRenderer={action => (
        <Button key={action.id} text={action.label} onClick={action.run} variant="minimal" />
      )}
      overflowRenderer={overflow => (
        <PopoverNext
          content={
            <Menu>
              {overflow.map(action => (
                <MenuItem key={action.id} text={action.label} onClick={action.run} />
              ))}
            </Menu>
          }
        >
          <Button icon="more" aria-label={`${overflow.length} more actions`} variant="minimal" />
        </PopoverNext>
      )}
    />
  );
}
```

Confirm collapse direction type and generic renderer signatures.

## Recipe review rules

Before copying a recipe:

1. Replace conceptual types with domain types.
2. Verify component/prop signatures in installed declarations.
3. Remove compatibility casts.
4. Add error and permission behavior.
5. Test keyboard/focus/portal behavior.
6. Test light/dark theme.
7. Confirm CSS is loaded once.
8. Run TypeScript and production build.
