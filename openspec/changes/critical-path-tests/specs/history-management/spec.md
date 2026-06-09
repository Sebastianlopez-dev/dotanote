# History Management Specification

## Purpose

Define the CRUD and display-ordering behavior for `TranscriptionResult` entries, including localStorage persistence under key `vozia-history`.

## Requirements

### Requirement: Add Entry

The system MUST prepend new `TranscriptionResult` entries to the history array. Each entry SHALL have a unique `id`, the transcription `text`, and a `timestamp` of `Date.now()`.

#### Scenario: Add new transcription result

- GIVEN an empty history array
- WHEN `addResult("Hello world", metadata)` is invoked
- THEN the history SHALL contain one entry with `text: "Hello world"`, a non-empty `id`, and `timestamp` within 100ms of `Date.now()`

### Requirement: Delete Entry

The system MUST remove an entry by `id` without affecting other entries.

#### Scenario: Delete existing entry

- GIVEN history with two entries `{ id: "a" }` and `{ id: "b" }`
- WHEN `deleteResult("a")` is invoked
- THEN history SHALL contain only the entry with `id: "b"`

#### Scenario: Delete non-existent id is no-op

- GIVEN history with one entry `{ id: "a" }`
- WHEN `deleteResult("nonexistent")` is invoked
- THEN history SHALL remain unchanged

### Requirement: Toggle Pin

The system MUST toggle the `isPinned` boolean on a matching entry without affecting other entries.

#### Scenario: Pin and unpin an entry

- GIVEN an entry with `id: "a"` and `isPinned: false`
- WHEN `togglePin("a")` is invoked twice
- THEN after the first call `isPinned` MUST be `true`
- AND after the second call `isPinned` MUST be `false`

### Requirement: Display Order

The system MUST display entries with pinned items first, then by timestamp descending.

#### Scenario: Pinned entries sort first

- GIVEN three entries: `{ id: "a", isPinned: true, timestamp: 100 }`, `{ id: "b", isPinned: false, timestamp: 200 }`, `{ id: "c", isPinned: false, timestamp: 300 }`
- WHEN the history is sorted for display
- THEN the order SHALL be `["a", "c", "b"]`

### Requirement: LocalStorage Sync

The system MUST persist and restore the full history array under key `vozia-history`.

#### Scenario: History survives reload

- GIVEN history with two entries
- WHEN the array is serialized to localStorage, the key is cleared, and reloaded
- THEN the restored array MUST be deep-equal to the original

#### Scenario: Corrupted history gracefully handled

- GIVEN `vozia-history` contains `"invalid json"`
- WHEN history is loaded
- THEN the system MUST return an empty array without throwing

### Requirement: Clear All

The system MUST replace the history array with an empty array when clear is invoked.

#### Scenario: Clear non-empty history

- GIVEN history with three entries
- WHEN `clearHistory()` is invoked
- THEN history SHALL be empty (`[]`)
