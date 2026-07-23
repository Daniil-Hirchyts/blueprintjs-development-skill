# Forms, controls, and inputs

This reference covers Blueprint's form controls and input components, including validation architecture, controlled-state patterns, keyboard behavior, and accessible labeling.

## 1. Form architecture

A robust form separates four layers:

1. **Canonical form state**: domain values and validation state.
2. **Presentation parsing state**: partial strings users are currently editing.
3. **Blueprint components**: visual controls and interaction behavior.
4. **Submission orchestration**: async status, server errors, retries, and navigation.

Do not force every input to emit a valid domain value on each keystroke. Numeric, date, and tag-like inputs often need temporary incomplete text.

Recommended form model:

```ts
type FieldState<T> = {
  value: T;
  touched: boolean;
  error?: string;
};

type SaveState = "idle" | "saving" | "success" | "error";
```

Use controlled components when values affect validation, conditional fields, URL state, autosave, or submission. Uncontrolled components are acceptable for isolated fields where the final value is read at submit time and no cross-field behavior exists.

## 2. Accessible field composition

A field usually needs:

- a visible label;
- an input ID;
- optional helper text;
- an error message;
- `aria-describedby` connecting helper/error text;
- `aria-invalid` when invalid;
- a required indicator that is not color-only.

Blueprint's `FormGroup` helps organize this structure, but the application must provide unique IDs and meaningful text.

```tsx
import { FormGroup, InputGroup } from "@blueprintjs/core";

const id = "project-name";
const helperId = `${id}-helper`;
const errorId = `${id}-error`;

<FormGroup
  label="Project name"
  labelFor={id}
  helperText={error ?? "Shown to collaborators"}
  intent={error ? "danger" : "none"}
>
  <InputGroup
    id={id}
    value={name}
    onValueChange={setName}
    intent={error ? "danger" : "none"}
    aria-invalid={error != null}
    aria-describedby={error ? errorId : helperId}
  />
</FormGroup>;
```

When `FormGroup` renders helper text without a predictable ID in the installed version, render your own helper/error element so `aria-describedby` is explicit.

## 3. FormGroup

**Use for:** grouping one label, one principal field, helper/error text, and optional inline metadata.

Key decisions:

- Connect `labelFor` to the actual input `id`.
- Set intent on both FormGroup and the input when a visual error state should cover the full field.
- Keep helper text concise.
- Do not put several unrelated fields under one FormGroup label.
- Use `inline` only when horizontal alignment remains readable at supported widths.
- Preserve a visible label for most fields; placeholder-only labeling is inadequate.

## 4. ControlGroup

**Use for:** visually joining controls that form one composite interaction, such as a protocol select plus hostname input plus action button.

```tsx
<ControlGroup fill>
  <HTMLSelect aria-label="Protocol" options={["https://", "http://"]} />
  <InputGroup fill aria-label="Host" />
  <Button icon="arrow-right" aria-label="Open URL" />
</ControlGroup>
```

Rules:

- Match control sizes.
- Use `fill` deliberately.
- Every control still needs an accessible name.
- Do not join unrelated fields merely to save space.
- Ensure error styling does not create an ambiguous single-field outline when only one control is invalid.

## 5. Label

**Use for:** a form label and optional supplementary text when FormGroup is unnecessary.

Rules:

- Associate it with an input through normal HTML label behavior or `htmlFor`.
- Do not use Label as a generic text style.
- Keep optional markers consistent across the product.

## 6. Checkbox

**Use for:** an independent boolean or one item in a multi-selection set.

Key concepts:

- `checked` / `defaultChecked`;
- `indeterminate` for a mixed aggregate state;
- label and helper content;
- alignment, disabled state, inline layout;
- event-based `onChange` and convenience handlers depending on installed version.

```tsx
<Checkbox
  checked={permissions.read}
  label="Can view reports"
  onChange={event =>
    setPermissions(current => ({ ...current, read: event.currentTarget.checked }))
  }
/>
```

Indeterminate is a visual/state concept for aggregates, not a third submitted boolean. Define what clicking the mixed state does.

Avoid using a Checkbox for a setting that applies immediately and is naturally described as on/off; use Switch for that.

## 7. Radio and RadioGroup

**Use for:** selecting exactly one option from a small visible set.

Key decisions:

- Use a group label/legend.
- Give every option a stable value.
- Keep option labels mutually exclusive and parallel in wording.
- Disable individual options only with a visible explanation when possible.
- Use controlled state when the selection drives other fields.

```tsx
<RadioGroup
  label="Access level"
  selectedValue={access}
  onChange={event => setAccess(event.currentTarget.value)}
>
  <Radio label="Viewer" value="viewer" />
  <Radio label="Editor" value="editor" />
  <Radio label="Administrator" value="admin" />
</RadioGroup>
```

For card-sized choices, use `RadioCard` inside a properly modeled exclusive group.

## 8. Switch

**Use for:** a boolean setting presented as on/off, usually taking effect immediately or representing persistent state.

Rules:

- Label the state/action clearly: “Enable audit logging,” not merely “Audit logging.”
- Avoid changing the label text between on/off states when that causes layout or cognitive instability.
- For async updates, disable or show progress while saving and revert on failure with a visible error.
- Do not use a Switch to confirm a destructive action.

## 9. HTMLSelect

**Use for:** a native single-select with a modest number of options and no need for custom search, rich rows, or multiple selection.

Advantages:

- native keyboard and assistive-technology behavior;
- familiar mobile presentation;
- low implementation complexity.

Key decisions:

- Use real `<option>` values.
- Provide an explicit label.
- Use a placeholder option only when “no value” is a valid state; do not create an invalid hidden option that traps users.
- For hundreds of options or rich filtering, use `Select` or `Suggest`.

## 10. SegmentedControl

**Use for:** a small, linear, mutually exclusive set of modes or views.

Typical examples: list/grid view, daily/weekly/monthly, chart/table.

Rules:

- Limit the number of segments.
- Keep labels concise and similar in width.
- Use controlled selection for application state.
- Provide an accessible group label.
- Do not use for navigation across unrelated pages.
- Do not use when users may select multiple options.

## 11. Slider, RangeSlider, and MultiSlider

### Slider

**Use for:** selecting one numeric value from a bounded continuous or stepped range.

### RangeSlider

**Use for:** selecting a lower and upper bound.

### MultiSlider / MultiSliderHandle

**Use for:** advanced multi-handle ranges, segments, or constrained values.

Key decisions:

- Define `min`, `max`, and `step` precisely.
- Choose label rendering and label step that remain readable.
- Keep domain rounding deterministic.
- Provide accessible labels for each handle.
- Use discrete buttons/input fields when exact numeric entry matters more than spatial manipulation.
- Pair sliders with a numeric readout or NumericInput when precision matters.
- For range handles, define collision and crossing behavior explicitly.
- Avoid expensive state writes on every pointer movement; update local UI continuously and debounce side effects.

Do not use a slider for unbounded values, categories with no numeric order, or a range where users cannot infer the scale.

## 12. InputGroup

**Use for:** single-line text input with optional icon, left element, right element, clear button, or async control.

Key concepts:

- all normal input attributes;
- controlled `value` or uncontrolled `defaultValue`;
- `onValueChange` convenience callback;
- `leftIcon`, `leftElement`, `rightElement` depending on installed API;
- intent, size, fill, round, placeholder, disabled, readOnly;
- async-control behavior in some versions for controlled event timing.

```tsx
<InputGroup
  id="search"
  leftIcon="search"
  placeholder="Search projects"
  value={query}
  onValueChange={setQuery}
  rightElement={
    query.length > 0 ? (
      <Button
        aria-label="Clear search"
        icon="cross"
        variant="minimal"
        onClick={() => setQuery("")}
      />
    ) : undefined
  }
/>
```

Rules:

- Right elements must not cover typed text; use the component API rather than absolute positioning.
- Icon-only right controls need labels.
- Use `type="search"`, `email`, `password`, etc. when semantic input behavior is useful.
- Do not place a second editable input inside `leftElement` or `rightElement` unless the composite semantics are deliberate.
- Read-only and disabled are different: read-only values remain focusable/selectable; disabled values are usually omitted from form submission and cannot be focused normally.

## 13. TextArea

**Use for:** multi-line free text.

Key decisions:

- Set a sensible minimum height.
- Use auto-resize only if expansion will not break the surrounding workflow.
- Preserve manual resize when users benefit from it.
- Show character limits before they are exceeded.
- Validate on blur or submit rather than interrupting every keystroke for complex content.
- Avoid using TextArea for structured lists when TagInput or a dedicated editor is better.

## 14. FileInput

**Use for:** selecting a local file with Blueprint styling.

Key decisions:

- Treat the native file input as the source of truth.
- Display the selected file name but do not fake a filesystem path.
- Use `accept` to guide selection, not as the only validation.
- Validate type, size, and content server-side.
- Support drag-and-drop only as an enhancement; retain the file chooser.
- Announce upload progress and failure separately from selection.
- Reset the native input deliberately when users remove a selected file.

Never assume the browser-provided MIME type is trustworthy.

## 15. NumericInput

**Use for:** numeric entry with optional increment/decrement controls, bounds, step size, and parsing/formatting behavior.

Numeric input needs two states:

```ts
const [text, setText] = useState("1.5");
const [value, setValue] = useState<number | null>(1.5);
```

Why: temporary values such as `"-"`, `"1."`, or an empty string are valid editing states but not valid final numbers.

Key decisions:

- Define locale and decimal-separator expectations.
- Define `min`, `max`, major step, and minor step.
- Decide whether to clamp on change, blur, or submit.
- Keep rounding consistent with the domain.
- Preserve user-entered precision when appropriate.
- Use `onValueChange` to receive both numeric and string representations when exposed by the installed API.
- Disable mouse-wheel changes when accidental modification is a risk.
- Pair the field with units outside the editable value or through a non-editable element.

Avoid:

- coercing empty text immediately to zero;
- storing `NaN` in canonical form state;
- silently truncating decimals;
- using a NumericInput for identifiers such as postal codes or account numbers.

## 16. TagInput

**Use for:** entering and editing a list of short token-like values.

Key concepts:

- controlled `values` or uncontrolled default values;
- separators/add methods such as Enter, comma, blur, or paste;
- `onAdd`, `onRemove`, `onChange` depending on version;
- tag props/rendering;
- placeholder, left/right elements, intent, disabled state;
- validation and duplicate handling.

Canonical update pattern:

```tsx
<TagInput
  values={emails}
  placeholder="Add email addresses"
  onAdd={newValues => {
    setEmails(current => dedupe([...current, ...newValues.map(normalizeEmail)]));
  }}
  onRemove={(_value, index) => {
    setEmails(current => current.filter((_, currentIndex) => currentIndex !== index));
  }}
/>
```

Rules:

- Normalize and validate tokens explicitly.
- Decide whether duplicates are allowed.
- Preserve order when order has meaning.
- Handle pasted lists robustly.
- Give remove buttons accessible names.
- Do not turn long prose or objects into tags.
- For searchable selection from an existing catalog, use `MultiSelect` instead.

## 17. Control cards

### CheckboxCard

Use for independent, card-sized selection with supporting content.

### RadioCard

Use for one card in an exclusive choice set.

### SwitchCard

Use for a large setting toggle with description.

Rules for all control cards:

- Keep the entire card label target coherent.
- Do not place unrelated interactive descendants inside the label area.
- Keep selection state visible in light and dark themes.
- Use a heading-like label only if document hierarchy remains valid.
- Ensure focus indication covers the actual interactive control/card.

## 18. Validation strategy

Validation can occur at multiple times:

- **on change**: format hints and immediate constraints that do not interrupt typing;
- **on blur**: field-level validation after users finish a field;
- **on submit**: complete cross-field and server validation;
- **server response**: authoritative validation and conflict handling.

Recommended behavior:

1. Do not show an error before a user has interacted unless the server supplied it.
2. Preserve submitted values after failure.
3. Focus the first invalid field after submit, but also show a form-level summary.
4. Associate each error with its field.
5. Use `Intent.DANGER` plus text; never color alone.
6. Clear stale server errors when the relevant value changes, or label them as server errors.

Example:

```tsx
const hasError = touched && error != null;

<FormGroup
  label="Email"
  labelFor="email"
  helperText={hasError ? error : "We will send an invitation."}
  intent={hasError ? "danger" : "none"}
>
  <InputGroup
    id="email"
    type="email"
    value={email}
    onValueChange={setEmail}
    onBlur={() => setTouched(true)}
    intent={hasError ? "danger" : "none"}
    aria-invalid={hasError}
  />
</FormGroup>;
```

## 19. Async submission

Use one submission state and prevent duplicate requests:

```tsx
<Button
  type="submit"
  intent="primary"
  loading={saveState === "saving"}
  disabled={!isValid || saveState === "saving"}
  text="Save"
/>
```

Rules:

- Button loading already disables interaction.
- Keep cancellation behavior explicit.
- Do not clear a form before the server confirms success.
- Show a persistent inline error for failures requiring user action.
- Use a toast for complementary confirmation, not as the only record of a failed submission.
- Restore focus to a sensible element after dialog-form success or failure.

## 20. Form layout and density

- Use one-column forms by default for scanning and error association.
- Place short related fields side by side only when the relationship is clear and responsive behavior is defined.
- Align labels consistently.
- Keep action buttons at a predictable edge.
- Use `ControlGroup` for true composites, not general grid layout.
- Use the 4px spacing system.
- Avoid overly compact density for touch-heavy workflows.

## 21. Form testing checklist

Test with React Testing Library and user-event:

- label click focuses/toggles the field;
- keyboard input changes the value;
- Tab order follows visual order;
- radio arrow behavior and checkbox/switch Space behavior work;
- disabled and read-only semantics differ correctly;
- validation text appears and is associated;
- submit is blocked or accepted correctly;
- loading prevents duplicate submit;
- server errors preserve values;
- NumericInput handles empty, negative, decimal, min/max, and paste states;
- TagInput handles Enter, separators, paste, remove, duplicates, and invalid tokens;
- file selection and reset work;
- focus moves to the first invalid field after submit when designed.

## 22. Form component decision table

| Need | Component |
|---|---|
| one-line text | InputGroup |
| paragraph text | TextArea |
| number with step controls | NumericInput |
| independent boolean | Checkbox |
| immediate on/off setting | Switch |
| one of a small visible set | RadioGroup |
| compact mode choice | SegmentedControl |
| simple native dropdown | HTMLSelect |
| searchable rich dropdown | Select / Suggest |
| multiple catalog selections | MultiSelect |
| free-form tokens | TagInput |
| bounded number via pointer/keyboard | Slider |
| numeric interval | RangeSlider |
| local file | FileInput |
| large descriptive choice | control card |

## 23. Form review checklist

- [ ] Every field has a visible or otherwise valid accessible name.
- [ ] Labels connect to input IDs.
- [ ] Helper and error text are associated.
- [ ] Controlled and uncontrolled props are not mixed.
- [ ] Partial numeric/date text is modeled safely.
- [ ] Validation timing does not fight user input.
- [ ] Required state is not indicated by color alone.
- [ ] Async submission cannot duplicate requests.
- [ ] Keyboard behavior works without a pointer.
- [ ] Errors preserve input and provide recovery.
- [ ] Compact layout still works at zoom and with localization.
