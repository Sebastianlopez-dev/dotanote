# Settings Persistence Specification

## Purpose

Define the save/load roundtrip behavior for all localStorage-backed settings — AIConfig, GeneralSettings, MagicFormats, and UI state — so that future state migration preserves this contract.

## Requirements

### Requirement: AIConfig Roundtrip

The system MUST persist `AIConfig` under key `vnote_ai_config` and restore it on load. Unrecognized keys in stored JSON MUST be silently ignored.

#### Scenario: Save then restore AIConfig with custom keys

- GIVEN an AIConfig with `useCustomKeys: true`, `geminiKey: "sk-abc"`, `groqKey: "sk-def"`
- WHEN the config is serialized to JSON, written to localStorage, read back, and deserialized
- THEN all recognized fields MUST match the original values

#### Scenario: Empty AIConfig returns default shape

- GIVEN no stored value for `vnote_ai_config`
- WHEN settings are loaded
- THEN the default `{ useCustomKeys: false }` SHALL be returned

#### Scenario: Malformed JSON does not crash

- GIVEN `vnote_ai_config` contains `"not valid json"`
- WHEN settings are loaded
- THEN the default SHALL be returned without throwing

### Requirement: GeneralSettings Roundtrip

The system MUST persist `GeneralSettings` under key `vnote_general_settings` and restore it on load.

#### Scenario: Save then restore GeneralSettings

- GIVEN a GeneralSettings object with `language: "en"`, `autoExportFormat: "markdown"`
- WHEN the object is serialized, written, reloaded, and deserialized
- THEN all fields MUST match the original

#### Scenario: Missing key returns defaults

- GIVEN no stored value for `vnote_general_settings`
- WHEN settings are loaded
- THEN the default `{ language: "es", autoExportFormat: "none", showHints: true, defaultSidebarVisible: true, defaultDashboardVisible: true }` SHALL be returned

### Requirement: MagicFormats Roundtrip

The system MUST persist `MagicFormat[]` under key `vnote_formats` with four default formats (Executive, Formal, Casual, Puntual).

#### Scenario: Custom formats survive reload

- GIVEN a modified MagicFormat array with one format deleted and a new format added
- WHEN the array is persisted and reloaded
- THEN the loaded array MUST match the modified version exactly

#### Scenario: No stored formats returns defaults

- GIVEN no stored value for `vnote_formats`
- WHEN formats are loaded
- THEN exactly 4 default formats SHALL be returned with Executive as `isDefault: true`

### Requirement: UI State Persistence

The system MUST persist sidebar and dashboard visibility as boolean-derived strings under keys `sidebarOpen` and `dashboardOpen`.

#### Scenario: Sidebar visibility roundtrip

- GIVEN sidebar is closed (`sidebarOpen: false`)
- WHEN the state is saved, cleared from localStorage, and reloaded
- THEN `sidebarOpen` MUST be `"false"`

#### Scenario: Dashboard visibility roundtrip

- GIVEN dashboard is open (`dashboardOpen: true`)
- WHEN the state is saved, cleared from localStorage, and reloaded
- THEN `dashboardOpen` MUST be `"true"`
