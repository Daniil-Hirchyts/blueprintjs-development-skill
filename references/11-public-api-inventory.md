# Public API and documentation coverage inventory

This is a coverage checklist, not a substitute for installed TypeScript declarations. It was reviewed against Blueprint's official v6 documentation index and current `develop` branch package entry points on 2026-07-23.

Use this inventory to answer:

- Which package owns the API?
- Is the symbol documented, exported, compatibility-only, or deprecated?
- Which deep-reference file should guide implementation?
- Has a migration or audit reviewed every family?

## 1. Coverage status legend

- **Documented**: has a current official documentation page.
- **Public export**: exported from a package root entry point.
- **Compatibility/deprecated**: publicly exported but marked deprecated or superseded in current source/docs.
- **Advanced**: public utility/type, typically not a first-choice UI component.
- **Experimental**: Labs API with lower stability expectations.

## 2. Overview documentation

- Quick Start — installation and package overview.
- Getting Started — packages, CSS, JSX/React.createElement, browser features, TypeScript, vanilla host use.
- Reading the Docs — TypeScript notation and documentation conventions.
- Principles — browser support and public API/semver contract.

Covered in `SKILL.md` and `01-foundations-and-styling.md`.

## 3. Core foundation documentation

- Accessibility.
- Classes.
- Colors.
- Typography.
- Variables.

Covered in `01-foundations-and-styling.md`, `08-icons-colors-labs.md`, and `10-testing-performance-migration.md`.

## 4. Core common root exports

Current public common exports include:

### Constants/enums

- `Alignment`
- `TextAlignment`
- `Boundary`
- `ButtonVariant`
- `Elevation`
- `Intent`
- deprecated `Keys` alias for key codes
- `Position`
- `Size`
- `Colors` re-export
- `DISPLAYNAME_PREFIX`

### Shared types

- `ActionProps`
- `ControlledValueProps`
- `IntentProps`
- `LinkProps`
- `OptionProps`
- `Props`
- `HTMLDivProps`
- `HTMLInputProps`
- `MaybeElement`
- `NonSmallSize`

### Utilities and namespaces

- `Classes`
- `Utils`
- `removeNonHTMLProps`
- ref helpers: `getRef`, `isRefCallback`, `isRefObject`, `mergeRefs`, `refHandler`, `setRef`
- compatibility abstract component bases: `AbstractComponent`, `AbstractPureComponent`

Guidance:

- Prefer function components and hooks over abstract class bases in new code.
- Use `Classes` instead of hardcoded Blueprint classes.
- Use `removeNonHTMLProps` only in wrapper/primitive implementations that deliberately forward native props.
- Prefer direct React ref composition or `mergeRefs` where appropriate.

## 5. Core documented display/navigation components

### Breadcrumbs

Public exports:

- `Breadcrumb`
- `Breadcrumbs`
- `BreadcrumbProps`
- `BreadcrumbsProps`

### Buttons

- `Button`
- `AnchorButton`
- `ButtonProps`
- `AnchorButtonProps`
- `ButtonSharedProps`
- `ButtonSharedPropsAndAttributes`

Current modernization:

- `size` instead of boolean `small`/`large` where supported;
- `variant` instead of boolean `minimal`/`outlined`;
- `endIcon` instead of `rightIcon`.

### Button Group

- `ButtonGroup`
- `ButtonGroupProps`

### Callout

- `Callout`
- `CalloutProps`

### Card

- `Card`
- `CardProps`

### Card List

- `CardList`
- `CardListProps`

### Control Card

Public exports:

- `ControlCardProps`
- `CheckboxCard`
- `CheckboxCardProps`
- `RadioCard`
- `RadioCardProps`
- `SwitchCard`
- `SwitchCardProps`

### Collapse

- `Collapse`
- `CollapseProps`

### Divider

- `Divider`
- `DividerProps`

### Editable Text

- `EditableText`
- `EditableTextProps`

### Entity Title

- `EntityTitle`
- `EntityTitleProps`

### HTML Elements

- `Blockquote`
- `Code`
- `H1`, `H2`, `H3`, `H4`, `H5`, `H6`
- `Label`
- `OL`
- `Pre`
- `UL`

### HTML Table

- `HTMLTable`
- `HTMLTableProps`

### Icon

Core exports:

- `Icon`
- `IconProps`
- `DefaultIconProps`
- `IconComponent`
- `IconName`
- `IconSize`

### Link

- `Link`
- `LinkComponentProps` (renamed exported type to avoid collision with common `LinkProps`)

### Menu

- `Menu`
- `MenuProps`
- `MenuDivider`
- `MenuDividerProps`
- `MenuItem`
- `MenuItemProps`

### Navbar

- `Navbar`
- `NavbarProps`
- `NavbarDivider`
- `NavbarDividerProps`
- `NavbarGroup`
- `NavbarGroupProps`
- `NavbarHeading`
- `NavbarHeadingProps`

### Non-ideal State

- `NonIdealState`
- `NonIdealStateProps`
- `NonIdealStateIconSize`

### Overflow List

- `OverflowList`
- `OverflowListProps`

### Panel Stack

Public exports:

- `PanelStack`
- `PanelStackProps`
- `PanelStack2`
- `PanelStack2Props`
- `Panel`
- `PanelProps`

Current source includes compatibility/deprecation annotations around this family. Inspect installed declarations to determine the preferred name.

### Progress Bar

- `ProgressBar`
- `ProgressBarProps`

### Resize Sensor

- `ResizeSensor`
- `ResizeSensorProps`
- `ResizeEntry`

### Section

- `Section`
- `SectionProps`
- `SectionElevation`
- `SectionCard`
- `SectionCardProps`

### Skeleton

Skeleton is documented and exposed through Core's public styling/component surface in current docs. Confirm exact import form in installed declarations if a package-root search differs from the source inventory used here.

### Spinner

- `Spinner`
- `SpinnerProps`
- `SpinnerSize`

### Tabs

- `Tabs`
- `TabsProps`
- `TabsExpander`
- `Tab`
- `TabProps`
- `TabId`
- `TabPanel`
- `TabPanelProps`

### Tag and Compound Tag

- `Tag`
- `TagProps`
- `CompoundTag`
- `CompoundTagProps`

### Text

- `Text`
- `TextProps`

### Tree

- `Tree`
- `TreeProps`
- `TreeNode`
- `TreeNodeProps`
- `TreeNodeInfo`
- `TreeEventHandler`

Detailed guidance: `02-core-components.md`.

## 6. Core form controls and inputs

### Form Group

- `FormGroup`
- `FormGroupProps`

### Control Group

- `ControlGroup`
- `ControlGroupProps`

### Label

- `Label` HTML wrapper

### Checkbox

- `Checkbox`
- `CheckboxProps`
- shared `ControlProps`

### Radio

- `Radio`
- `RadioProps`
- `RadioGroup`
- `RadioGroupProps`

### HTML Select

- `HTMLSelect`
- `HTMLSelectProps`
- `HTMLSelectIconName`

### Segmented Control

- `SegmentedControl`
- `SegmentedControlProps`
- `SegmentedControlIntent`

### Slider family

- `Slider`
- `SliderProps`
- `RangeSlider`
- `RangeSliderProps`
- `NumberRange`
- `MultiSlider`
- `MultiSliderProps`
- `MultiSliderHandle`
- `SliderBaseProps`
- `HandleProps`
- `HandleHtmlProps`
- `HandleInteractionKind`
- `HandleType`

### Switch

- `Switch`
- `SwitchProps`

### Input Group

- `InputGroup`
- `InputGroupProps`

### Text Area

- `TextArea`
- `TextAreaProps`

### File Input

- `FileInput`
- `FileInputProps`

### Numeric Input

- `NumericInput`
- `NumericInputProps`

### Tag Input

- `TagInput`
- `TagInputProps`
- `TagInputAddMethod`

Detailed guidance: `03-forms-and-inputs.md`.

## 7. Core overlays

### Overlay

- `Overlay` — deprecated; use `Overlay2`.
- `OverlayProps`
- `OverlayLifecycleProps`
- `OverlayableProps`

### Overlay2

- `Overlay2`
- `Overlay2Props`
- `OverlayInstance`

### Portal

- `Portal`
- `PortalProps`

### Alert

- `Alert`
- `AlertProps`

### Context Menu

- `ContextMenu`
- `ContextMenuProps`
- `ContextMenuChildrenProps`
- `ContextMenuContentProps`
- `ContextMenuPopover`
- `ContextMenuPopoverProps`
- `showContextMenu`
- `hideContextMenu`
- `ShowContextMenuOptions`

### Dialog

- `Dialog`
- `DialogProps`
- `DialogBody`
- `DialogBodyProps`
- `DialogFooter`
- `DialogFooterProps`
- `DialogStep`
- `DialogStepProps`
- `DialogStepId`
- `DialogStepButtonProps`
- `MultistepDialog`
- `MultistepDialogProps`
- `MultistepDialogNavPosition`

### Drawer

- `Drawer`
- `DrawerProps`
- `DrawerSize`

### Popover

- `Popover` — deprecated; use `PopoverNext`.
- `PopoverProps`
- `PopoverAnimation`
- `PopoverInteractionKind`
- `PopoverPosition`
- `PopoverSharedProps`
- `PopoverTargetProps`
- target-handler types
- Popper compatibility boundary/modifier/placement types
- `PopperPlacements`
- `PopupKind`

### PopoverNext

- `PopoverNext`
- `PopoverNextProps`
- `PopoverNextRef`
- `PopoverNextAutoUpdateOptions`
- `PopoverNextBoundary`
- `PopoverNextRootBoundary`
- `PopoverNextPlacement`
- `PopoverNextPositioningStrategy`
- `MiddlewareConfig`
- `POPOVER_NEXT_PLACEMENTS`

Migration utilities:

- `popoverPlacementToNextPlacement`
- `popoverPositionToNextPlacement`
- `popoverPropsToNextProps`
- `popperBoundaryToNextBoundary`
- `popperModifiersToNextMiddleware`

### Toast

- `OverlayToaster`
- `OverlayToasterCreateOptions`
- `OverlayToasterProps`
- `ToasterPosition`
- `Toast`
- `Toast2`
- `ToastProps`
- `Toaster`
- `ToastOptions`

Current source includes compatibility/deprecation annotations around toast names. Verify preferred installed API.

### Tooltip

- `Tooltip`
- `TooltipProps`

Detailed guidance: `04-overlays-context-hotkeys.md`.

## 8. Core hotkeys components and parser exports

- `Hotkey`
- `HotkeyProps`
- `Hotkeys`
- `HotkeysProps`
- `KeyComboTag`
- `KeyComboTagProps`
- `KeyCombo`
- `comboMatches`
- `getKeyCombo`
- `getKeyComboString`
- `parseKeyCombo`
- `HotkeysTarget`
- `HotkeysTargetProps`
- `HotkeysTargetRenderProps`
- deprecated `HotkeysTarget2` and related types

Prefer `useHotkeys` in function components unless a target component API is specifically useful.

## 9. Core contexts and providers

- `BlueprintProvider`
- `BlueprintProviderProps`
- `HotkeysContext`
- `HotkeysContextInstance`
- `HotkeysProvider`
- `HotkeysProviderProps`
- `OverlaysContext`
- `OverlaysContextState`
- `OverlaysProvider`
- `OverlaysProviderProps`
- `PortalContext`
- `PortalContextOptions`
- `PortalProvider`

## 10. Core hooks

Documented:

- `useHotkeys`
- `useOverlayStack`

Additional current root exports:

- `HotkeyConfig`
- `UseHotkeysOptions`
- `UseHotkeysReturnValue`
- `useAsyncControllableValue`
- `useIsomorphicLayoutEffect`
- `usePrevious`

The latter hooks are public exports but lower-level. Prefer normal React primitives unless the Blueprint helper solves a concrete compatibility need.

## 11. Accessibility utility

- `FocusStyleManager`

Methods include current-active query, keyboard-sensitive focus display, and always-show-focus mode.

## 12. DateTime package inventory

Documented components:

- Date Picker.
- Date Input.
- Date Range Picker.
- Date Range Input.
- Time Picker.
- Timezone Select.

Current public exports include:

### Components

- `DatePicker`
- `DatePickerProps`
- `DateInput`
- `DateInputProps`
- `DateRangePicker`
- `DateRangePickerProps`
- `DateRangeInput`
- `DateRangeInputProps`
- `TimePicker`
- `TimezoneSelect`
- `TimezoneSelectProps`
- `DatePickerShortcutMenu`
- `DatePickerShortcutMenuProps`

### Types/enums/utilities

- `DateFormatProps`
- `DatePickerDayModifiers` compatibility type
- `DatePickerBaseProps`
- `DatePickerModifiers`
- `DayPickerProps`
- `DateRangeSelectionStrategy`
- `DateRangeSelectionState`
- `MonthAndYear`
- `TimePickerProps`
- `TimePrecision`
- `DatePickerShortcut`
- `DateRangeShortcut`
- `DatePickerUtils`
- deprecated `DateInputMigrationUtils`
- common date/range types exported by `./common`

Detailed guidance: `05-datetime.md`.

## 13. Select package inventory

Documented components:

- Select.
- Suggest.
- Multi Select.
- Omnibar.
- Query List.

Current public component exports:

- `Select`
- `SelectProps`
- `Suggest`
- `SuggestProps`
- `MultiSelect`
- `MultiSelectProps`
- `Omnibar`
- `OmnibarProps`
- `QueryList`
- `QueryListProps`
- `QueryListRendererProps`

Common exports include:

- `Classes`
- item list renderer types/utilities;
- `ItemRenderer` and render-prop types;
- `ListItemsProps`;
- `ItemsEqualComparator`;
- `ItemsEqualProp`;
- `executeItemsEqual`;
- create-new-item utilities/sentinel types;
- `ItemPredicate` and `ItemListPredicate`;
- `SelectPopoverProps`;
- deprecated aliases from `components/deprecatedAliases`.

Detailed guidance: `06-select.md`.

## 14. Table package inventory

Documented areas:

- Table features.
- Complete Table API.

Current public exports:

### Main components

- `Table`
- `Table2`
- `TableProps`
- `Table2Props`
- `Column`
- `ColumnProps`
- `Cell`
- `CellProps`
- `CellRenderer`
- `EditableCell`
- `EditableCell2`
- `EditableCellProps`
- `EditableCell2Props`

### Formats

- `JSONFormat`
- `JSONFormatProps`
- `TruncatedFormat`
- `TruncatedFormatProps`
- `TruncatedPopoverMode`

### Headers

- `ColumnHeaderCell`
- `ColumnHeaderCellProps`
- `ColumnHeaderRenderer`
- `RowHeaderCell`
- `RowHeaderCellProps`
- `RowHeaderRenderer`
- `EditableName`
- `EditableNameProps`
- `HorizontalCellDivider`

### Coordinates/grid/common

- `AnyRect`
- `CellCoordinates`
- `FocusedCellCoordinates`
- `Clipboard`
- `FocusMode`
- `Grid`
- `Rect`
- `RenderMode`
- `Utils`

### Interactions

- `Draggable`
- `DraggableProps`
- coordinate and drag types
- `CopyCellsMenuItem`
- `ContextMenuRenderer`
- `MenuContext`
- `ResizeHandle`
- `ResizeHandleProps`
- `Orientation`
- `LockableLayout`
- `DragSelectable`
- `SelectableProps`
- `DragSelectableProps`

### Regions/loading/selection

- `CellCoordinate`
- `CellInterval`
- `Region`
- `RegionCardinality`
- `Regions`
- `StyledRegionGroup`
- `SelectionModes`
- `ColumnLoadingOption`
- `RowLoadingOption`
- `TableLoadingOption`

Compatibility/deprecation annotations exist around Table/Table2 and EditableCell/EditableCell2. Use installed declaration guidance.

Detailed guidance: `07-table.md`.

## 15. Icons package inventory

Documented areas:

- Loading Icons.
- Icons List (500+ catalog in current docs).

Current root exports include:

- `IconSvgPaths16`
- `IconSvgPaths20`
- `getIconPaths`
- `Icons`
- `IconLoaderOptions`
- `IconPathsLoader`
- `DefaultSVGIconAttributes`
- `DefaultSVGIconProps`
- `SVGIconAttributes`
- `SVGIconProps`
- `SVGIconContainer`
- `SVGIconContainerComponent`
- `SVGIconContainerProps`
- `getIconContentString`
- `IconCodepoints`
- `LegacyToIconNextNameMap`
- `IconName`
- `IconNames`
- `IconSize`
- `IconPaths`
- generated static React icon components, preferably `*Icon` names.

Detailed guidance: `08-icons-colors-labs.md`.

## 16. Colors package inventory

The Colors package provides Blueprint palette values and styling resources. Core re-exports `Colors`.

Coverage areas:

- grayscale and brand palette values;
- intent colors;
- qualitative palettes;
- sequential palettes;
- diverging palettes;
- Sass variables/maps and programmatic values as distributed by the installed package.

Inspect the installed package root and docs for exact color constant names. Do not freeze a copied color list in application code when the package can be imported.

## 17. Labs package inventory

Documented/current experimental components:

- `Box`
- `BoxProps`
- `Flex`
- `FlexProps`

The root also exports common Labs utilities/types from its common index. Treat all Labs APIs as experimental and verify the installed version before use.

Detailed guidance: `08-icons-colors-labs.md`.

## 18. Official documentation page coverage checklist

### Core components

- [x] Breadcrumbs
- [x] Buttons
- [x] Button Group
- [x] Callout
- [x] Card
- [x] Card List
- [x] Control Card
- [x] Collapse
- [x] Divider
- [x] Editable Text
- [x] Entity Title
- [x] HTML Elements
- [x] HTML Table
- [x] Hotkeys Target
- [x] Icon
- [x] Link
- [x] Menu
- [x] Navbar
- [x] Non-ideal State
- [x] Overflow List
- [x] Panel Stack
- [x] Progress Bar
- [x] Resize Sensor
- [x] Section
- [x] Skeleton
- [x] Spinner
- [x] Tabs
- [x] Tag
- [x] Compound Tag
- [x] Text
- [x] Tree

### Form controls

- [x] Form Group
- [x] Control Group
- [x] Label
- [x] Checkbox
- [x] Radio
- [x] HTML Select
- [x] Segmented Control
- [x] Slider family
- [x] Switch

### Form inputs

- [x] Input Group
- [x] Text Area
- [x] File Input
- [x] Numeric Input
- [x] Tag Input

### Overlays

- [x] Overlay (deprecated)
- [x] Overlay2
- [x] Portal
- [x] Alert
- [x] Context Menu
- [x] Context Menu Popover
- [x] Dialog
- [x] Drawer
- [x] Popover (deprecated)
- [x] PopoverNext
- [x] Toast
- [x] Tooltip

### Context and hooks

- [x] Blueprint Provider
- [x] Hotkeys Provider
- [x] Overlays Provider
- [x] Portal Provider
- [x] useHotkeys
- [x] useOverlayStack

### DateTime

- [x] Date Picker
- [x] Date Input
- [x] Date Range Picker
- [x] Date Range Input
- [x] Time Picker
- [x] Timezone Select

### Icons

- [x] Loading Icons
- [x] Icons List

### Select

- [x] Select
- [x] Suggest
- [x] Multi Select
- [x] Omnibar
- [x] Query List

### Table

- [x] Features
- [x] API

### Labs

- [x] Box
- [x] Flex

## 19. Inventory update procedure

When updating this skill:

1. Read official `https://blueprintjs.com/llms.txt` or repository `llms.txt`.
2. Compare package root `src/index.ts` files.
3. Compare Core `components/index.ts`, `common/index.ts`, `context/index.ts`, and `hooks/index.ts`.
4. Search for `@deprecated` in public declaration files.
5. Record package versions and review date.
6. Add new documentation pages and exports.
7. Remove APIs only when absent from the supported target major or clearly document historical migration.
8. Run link and internal-reference checks.
