# Date, date-range, time, and timezone components

The `@blueprintjs/datetime` package provides DatePicker, DateInput, DateRangePicker, DateRangeInput, TimePicker, TimezoneSelect, shortcut utilities, date-format types, and supporting enums/utilities. It depends on Core and uses date-fns, date-fns-tz, and react-day-picker internally in current v6 releases.

## 1. Installation and CSS

```bash
pnpm add @blueprintjs/core @blueprintjs/datetime
```

```ts
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
```

When TimezoneSelect or other select-backed behavior is used, ensure the package's documented dependencies and Select CSS are available as required by the installed release.

## 2. Canonical value strategy

Before choosing a component, define the domain type.

### Date-only value

Examples: birthday, report day, due date.

A date-only value is not a moment in time. Store it as an ISO calendar date such as `2026-07-23` or a dedicated date type in the domain layer. A JavaScript `Date` is used by the UI adapter, but converting it through UTC can shift the calendar day.

### Instant

Examples: event created time, deployment time.

Store an instant as UTC ISO timestamp or epoch. Display it in a chosen timezone.

### Local date-time

Examples: “meeting at 09:00 in Europe/Paris.”

Store the local date/time plus timezone identifier, or convert to an instant while preserving the source timezone if future daylight-saving interpretation matters.

### Time-of-day

Examples: daily cutoff at 17:30.

Store hours/minutes/seconds independently from an arbitrary date unless the domain truly needs a Date.

### Date range

Define inclusivity explicitly. `[start, end]` may mean inclusive calendar days, a half-open instant interval, or nullable partial selection. Do not infer it from UI alone.

## 3. Controlled and uncontrolled state

Use controlled state when values are part of a form, URL, query, or shared workflow:

```tsx
<DatePicker value={date} onChange={setDate} />
```

Use default/uncontrolled state only for isolated UI.

Do not pass both current and default value props. Read installed types because nullable/undefined semantics differ among components and selection stages.

## 4. Formatting and parsing

A text date input needs both formatter and parser behavior.

Principles:

- Formatting converts a valid Date to display text.
- Parsing converts user text to a Date or invalid result.
- Placeholder must match the accepted format.
- Parsing should reject impossible dates.
- Locale must be explicit when numeric order is ambiguous.
- Do not silently reinterpret `03/04/2026` without a documented locale.
- Keep partially typed text distinct from the last valid date.
- Show invalid-state feedback without replacing user input unexpectedly.

A DateFormatProps-like contract commonly exposes format/parse functions. Confirm installed names and return types.

## 5. DatePicker

**Use for:** direct calendar selection of a single date.

Key decisions:

- controlled `value` and `onChange`;
- minimum/maximum date bounds;
- disabled-day modifiers;
- initial/visible month;
- locale and week-start behavior;
- month/year navigation;
- optional time picker integration depending on API;
- shortcuts and clear behavior;
- day rendering/modifiers;
- whether selecting the same day clears or remains selected.

Example:

```tsx
import { DatePicker } from "@blueprintjs/datetime";

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={new Date(2020, 0, 1)}
  maxDate={new Date(2030, 11, 31)}
/>
```

Use local constructors for date-only values:

```ts
const day = new Date(year, monthIndex, dayOfMonth);
```

Avoid creating date-only values from `new Date("YYYY-MM-DD")` without understanding that ECMAScript parsing may interpret it as UTC and display a different local day.

### Disabled dates

Disabled dates must be both visually and programmatically unavailable. Explain business constraints near the picker when many days are unavailable.

### Custom day rendering

Use day modifiers to express domain status, but do not encode all meaning with color. Provide labels, legends, or accessible descriptions.

## 6. DateInput

**Use for:** a text field that parses/formats a date and optionally opens a calendar popover.

DateInput combines three difficult systems:

- text-editing state;
- valid date state;
- popover/calendar state.

Key decisions:

- controlled date value;
- parse/format functions;
- placeholder;
- invalid-date and out-of-range messages;
- min/max date;
- clear button;
- popover placement/props;
- input props, label, and intent;
- whether close-on-selection is desirable;
- timezone treatment for date-plus-time usage.

Recommended state separation:

```ts
type DateFieldState = {
  value: Date | null;
  text: string;
  error?: string;
};
```

The component may manage text internally, but the form still needs a canonical nullable date and validation result.

Avoid:

- coercing invalid text to today;
- clearing text immediately when parsing fails;
- storing a date-only selection as an unintended UTC instant;
- leaving popover portal/theme behavior untested inside dialogs/drawers.

## 7. DateRangePicker

**Use for:** selecting a start/end date through one or two calendars.

A common value is a tuple containing nullable start/end dates. Confirm exact type in installed declarations.

Selection stages:

1. no dates;
2. start selected;
3. complete range;
4. optional restart/adjust behavior.

Key decisions:

- minimum and maximum dates;
- whether same-day range is valid;
- whether reverse selection swaps values;
- contiguous disabled dates and invalid spans;
- single-month versus multi-month layout;
- shortcuts such as Today, This week, Last 30 days;
- range selection strategy;
- hover preview behavior;
- time selection if supported by composition.

A shortcut must calculate values at activation time, not module-load time.

```ts
const lastSevenDays = () => {
  const end = startOfToday();
  const start = subDays(end, 6);
  return [start, end] as const;
};
```

Define whether “last seven days” includes today and communicate it consistently across UI and analytics.

## 8. DateRangeInput

**Use for:** two text inputs plus a range calendar popover.

Key decisions:

- separate start/end placeholders and labels;
- parsing errors for each field;
- range-level error when start is after end;
- partial range behavior;
- tab order and focus transfer;
- clear behavior;
- popover close behavior;
- shortcuts;
- min/max and disabled-range rules.

Do not collapse two errors into an ambiguous red outline. Identify which endpoint is invalid and whether the range relationship is invalid.

## 9. TimePicker

**Use for:** selecting a time of day with configurable precision.

Current package exports `TimePrecision` and time-picker prop types. Precision may include minutes, seconds, and milliseconds according to the installed API.

Key decisions:

- 12-hour versus 24-hour representation;
- locale and AM/PM behavior;
- precision;
- step sizes;
- min/max time;
- whether the Date part of a JavaScript Date is meaningful;
- timezone interpretation;
- controlled value;
- disabled/read-only state.

For a time-only domain value, normalize immediately:

```ts
type TimeOfDay = { hour: number; minute: number; second: number };

function toTimeOfDay(date: Date): TimeOfDay {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}
```

Do not serialize an arbitrary date attached to the picker as though it were a real business date.

## 10. TimezoneSelect

**Use for:** choosing an IANA timezone.

Key decisions:

- store stable IANA identifiers such as `Europe/Paris`, not display labels;
- show current UTC offset only as contextual display because it changes with daylight saving time;
- support search by city, region, abbreviation, and possibly offset according to product requirements;
- use `itemsEqual`/selection identity based on the canonical identifier;
- provide a clear empty/no-results state;
- consider grouping common or recently used timezones;
- define behavior for legacy/aliased zones.

Never store a fixed offset such as `UTC+2` when the business requirement is a geographic timezone. Offsets do not encode daylight-saving rules.

## 11. Daylight-saving time

DST creates two important cases:

- **nonexistent local time** during spring-forward;
- **ambiguous local time** during fall-back.

When a user selects a date, time, and timezone that maps to these cases, the application must define a policy:

- reject and ask for another time;
- choose the earlier/later instant explicitly;
- shift to the next valid time with a clear warning.

Do not let a library's undocumented default silently decide a scheduling workflow.

## 12. Locale

Localization affects:

- month/day names;
- numeric date order;
- first day of week;
- weekend definition in some products;
- 12/24-hour preference;
- shortcut labels;
- date range grammar;
- screen-reader pronunciation.

Keep locale in application context and pass it consistently to formatter/parser and calendar components. Do not format with one locale and parse with another.

## 13. Bounds and business rules

Technical `minDate` and `maxDate` are not enough for all business constraints.

Examples:

- business days only;
- booking lead time;
- blocked maintenance windows;
- maximum range length;
- end date must be after another field;
- timezone-dependent cutoff.

Represent domain rules in reusable functions:

```ts
type DateRuleResult = { valid: true } | { valid: false; reason: string };

function validateBookingDate(date: Date, now: Date): DateRuleResult {
  // Domain logic, independently testable from React.
  return { valid: true };
}
```

Use the same rule for disabled-day UI, field validation, and server validation where possible.

## 14. Shortcuts

Current public exports include DatePickerShortcutMenu and shortcut types for dates/ranges.

Shortcut design rules:

- use familiar, unambiguous ranges;
- calculate relative dates at click time;
- localize labels;
- define inclusivity;
- respect min/max bounds;
- mark the selected shortcut only when the current exact range matches;
- do not include dozens of shortcuts that overwhelm the calendar.

## 15. Utilities and public types

Current v6 exports include concepts such as:

- `DatePickerUtils`;
- `DateRangeSelectionStrategy` and selection state;
- `MonthAndYear`;
- `DatePickerBaseProps`, modifiers, and day-picker props;
- `DateFormatProps`;
- `TimePickerProps` and `TimePrecision`;
- date/range shortcut types;
- `DatePickerDayModifiers` compatibility type;
- deprecated `DateInputMigrationUtils`.

Use public utilities when they directly solve the problem. Do not import internal package paths. Treat migration utilities as temporary and avoid spreading them through new application code.

## 16. Overlay integration

Date inputs and timezone selects often render popovers. Inside a dialog or drawer:

- verify portal container;
- verify dark-theme inheritance;
- verify z-index;
- verify focus containment does not fight the inner popover;
- verify Escape closes the topmost surface first;
- verify selecting a date does not accidentally submit the surrounding form;
- verify scroll containers do not clip the calendar;
- verify the calendar repositions on resize.

## 17. Validation and error messages

Differentiate:

- invalid syntax;
- impossible date;
- out of allowed range;
- disabled/business-rule date;
- incomplete range;
- reversed range;
- excessive range length;
- nonexistent/ambiguous timezone-local time.

Error messages should explain recovery:

- “Enter a date as DD/MM/YYYY.”
- “Choose a date on or after 24 July 2026.”
- “The end date must be on or after the start date.”
- “02:30 does not exist in Europe/Paris on this date because clocks move forward.”

## 18. Serialization examples

### Date only

```ts
function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

### Time only

```ts
function formatTimeOfDay(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}
```

### Instant

```ts
const instant = date.toISOString();
```

Use `toISOString()` only when the value is truly an instant.

## 19. Performance

- Memoize expensive day modifiers and renderers.
- Avoid reconstructing large disabled-date collections on every render.
- Keep formatter/parser functions stable.
- Do not perform network requests on every calendar hover.
- Debounce remote availability queries and cancel stale requests.
- Cache timezone search data where appropriate.
- Avoid remounting the entire picker due to unstable keys.

## 20. Testing

### Unit-test domain logic

Test date-only serialization, bounds, range inclusivity, shortcuts, timezone conversion, and DST policies independently from the UI.

### Interaction tests

Test:

- opening the popover;
- typing a valid date;
- typing invalid and out-of-range values;
- selecting by keyboard and pointer;
- clearing;
- month navigation;
- disabled dates;
- partial and complete range selection;
- shortcut selection;
- time precision and AM/PM behavior;
- timezone search and selection;
- focus return and Escape inside overlays.

Use fixed clocks and explicit timezone in tests. Avoid assertions that depend on the machine's local date/time.

Example test environment setup may set `TZ=UTC` or a named zone, but also include explicit tests for relevant product zones.

## 21. Date/time review checklist

- [ ] Domain value classified as date-only, time-only, local date-time, or instant.
- [ ] Locale and timezone are explicit.
- [ ] Parse and format rules agree.
- [ ] Partial text does not corrupt canonical state.
- [ ] Date-only serialization cannot shift day through UTC.
- [ ] Bounds and business rules share one source of truth.
- [ ] Range inclusivity is documented.
- [ ] DST ambiguity/nonexistence has a policy.
- [ ] Popover works inside dialogs/drawers and dark mode.
- [ ] Tests freeze time and avoid machine-local assumptions.
- [ ] Migration utilities are not introduced into new domain code.
