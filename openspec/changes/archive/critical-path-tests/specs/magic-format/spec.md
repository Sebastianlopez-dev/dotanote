# Magic Format Specification

## Purpose

Define the text transformation pipeline — prompt construction, default format definitions, and format selection by ID — used to enhance raw transcripts into structured notes.

## Requirements

### Requirement: Default Format Definitions

The system MUST provide exactly four default MagicFormats: Executive (`isDefault: true`), Formal, Casual, and Puntual. Each SHALL have a non-empty `id`, `name`, and `prompt`.

#### Scenario: Default formats exist

- GIVEN no stored formats in localStorage
- WHEN the defaults are loaded
- THEN an array of 4 formats SHALL be returned
- AND Executive SHALL have `isDefault: true` and `isPinned: true`

#### Scenario: All defaults have required fields

- GIVEN the default formats array
- WHEN inspecting each format
- THEN every entry MUST have non-empty `id`, `name`, and `prompt` strings

### Requirement: Format Selection by ID

The system MUST select a format by `id` when specified, or fall back to the format with `isDefault: true`.

#### Scenario: Select by explicit ID

- GIVEN formats with IDs `["executive", "formal", "casual"]`
- WHEN selecting format `"formal"`
- THEN the format with `id: "formal"` SHALL be returned

#### Scenario: Fallback to default

- GIVEN formats where Executive has `isDefault: true`
- WHEN no format ID is specified
- THEN the Executive format SHALL be selected

### Requirement: Prompt Construction

The system MUST pass the selected format's `prompt` text as the `customPrompt` parameter to the orchestrator's `enhance()` method.

#### Scenario: Prompt forwarded to enhancer

- GIVEN an orchestrator and a selected format with prompt `"Reescribe este texto..."`
- WHEN `handleEnhance(id, formatId)` is invoked
- THEN the orchestrator SHALL receive `customPrompt` equal to the format's prompt text

### Requirement: Enhancement State

The system MUST track the enhancement lifecycle on each entry via `isEnhancing` and store the result in `enhancedText`.

#### Scenario: Enhancement lifecycle

- GIVEN a transcription entry with no `enhancedText`
- WHEN enhancement starts
- THEN `isEnhancing` SHALL be `true`
- WHEN enhancement completes
- THEN `enhancedText` SHALL contain the returned text
- AND `isEnhancing` SHALL be `false`
