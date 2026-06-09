# AI Orchestrator Specification

## Purpose

Define the provider selection, priority ordering, and circuit breaker fallback behavior of the AIOrchestrator for both transcription and enhancement pipelines.

## Requirements

### Requirement: Provider Priority Ordering

The system MUST register transcription providers in order Groq → Gemini, and enhancement providers in order Claude → Qwen → Gemini → Groq → OpenRouter. Providers MUST be skipped when the corresponding API key is absent.

#### Scenario: Full transcription provider list

- GIVEN an AIConfig with all API keys present
- WHEN the orchestrator is constructed
- THEN the transcription providers SHALL be `[GroqProvider, GeminiProvider]` in that order

#### Scenario: Skipped transcription provider

- GIVEN an AIConfig with only the Gemini key
- WHEN the orchestrator is constructed
- THEN the transcription providers SHALL contain only a single GeminiProvider

#### Scenario: Enhancement provider fallback chain

- GIVEN an AIConfig with all keys present
- WHEN the orchestrator is constructed
- THEN the enhancement providers SHALL be `[Claude, Qwen, Gemini, Groq, OpenRouter]` in that order

### Requirement: Circuit Breaker Fallback

The system MUST try providers in priority order. If a provider throws, the orchestrator MUST attempt the next provider. If ALL providers fail, the orchestrator MUST throw the last error.

#### Scenario: First provider succeeds

- GIVEN two transcription providers, where the first resolves successfully
- WHEN `transcribe()` is called
- THEN the result from the first provider SHALL be returned
- AND the second provider SHALL NOT be called

#### Scenario: All providers fail

- GIVEN two enhancement providers, where both throw errors
- WHEN `enhance()` is called
- THEN the orchestrator MUST throw the error from the last attempted provider

#### Scenario: First fails, second succeeds

- GIVEN two enhancement providers where the first throws and the second resolves
- WHEN `enhance()` is called
- THEN the result from the second provider SHALL be returned

### Requirement: No Providers Available

The system MUST throw a descriptive error if no providers were registered for a pipeline.

#### Scenario: Empty provider list

- GIVEN an AIConfig with no keys set
- WHEN `transcribe()` is called
- THEN the orchestrator MUST throw with a message indicating no providers are available

### Requirement: Error Aggregation

The system MUST collect all provider errors and surface the last error when all providers fail.

#### Scenario: Last error preserved

- GIVEN two providers that fail with different messages
- WHEN `transcribe()` is attempted and all fail
- THEN the thrown error SHALL match the second provider's error
