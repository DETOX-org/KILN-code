# Judge Engine Contract

## Purpose

This document defines the engine-neutral contract between the Judge service and execution engines.

The contract allows future execution engines to be introduced without requiring changes to the Backend, Frontend, or shared Judge Result consumers.

## Current Execution Engine

Piston is the current temporary execution engine used by the Judge service.

Piston is **not Engine A or Engine B** of the future two-engine architecture.

Future Engine A and Engine B implementations will be introduced separately.

## Engine Interface

All execution engines must implement:

- `submit(request)`
- `pollStatus(jobId)`
- `cancel(jobId)`
- `healthcheck()`

The Judge service must interact with engines through the `JudgeEngine` interface rather than engine-specific implementation details.

## Engine Request

An engine request contains:

- `language`
- `code`
- `input`

## Engine Result

An engine result contains:

- `status`
- `exitCode`
- `stdout`
- `stderr`
- `executedBy`
- `verificationMode`

## Execution Metadata

`executedBy` contains:

- `engineId`
- `engineVersion`
- `runtime`
- `runtimeVersion`
- `workerId` — optional
- `sandboxConfigVersion` — optional

Engine-specific implementations may populate the optional fields when available.

## Verification Mode

The shared verification mode values are:

- `NONE`
- `DUAL_RUN`

`NONE` represents normal single-engine execution.

`DUAL_RUN` is reserved for future execution through two engines for verification.

The Backend / orchestration layer owns the decision to trigger `DUAL_RUN`.

The Compiler Team owns the execution-engine implementation required to perform `DUAL_RUN`.

## Result States

The engine-neutral Judge Result states are:

- `Accepted`
- `Wrong Answer`
- `Compilation Error`
- `Runtime Error`
- `Time Limit Exceeded`
- `Memory Limit Exceeded`
- `Judge Error`

Engine implementations must map their native execution outcomes into these shared states.

## Test Contract

Execution engines receive test input through the engine request.

The Judge service owns test-case handling, including:

- `input`
- `expectedOutput`
- `visibility`

Visibility values are:

- `public`
- `hidden`

Engine implementations must not introduce engine-specific test visibility semantics.

## Engine-Neutral Boundary

Other services must depend only on:

- shared Judge Result types
- Judge Engine interface
- test-case contract
- execution metadata
- verification mode

Other services must not depend on:

- Piston-specific APIs
- Piston-specific response fields
- Piston-specific runtime behavior
- engine-specific implementation classes

## Ownership

### Compiler & Execution Team

Owns:

- execution engine adapters
- runtime integration
- native result mapping
- sandbox execution behavior
- engine health integration
- future Engine A implementation
- future Engine B implementation
- dual-engine execution
- verification mismatch handling

### Backend / Orchestration

Owns:

- deciding when verification is required
- routing policy
- execution workflow orchestration
- consuming engine-neutral results

### Frontend

Consumes engine-neutral Judge results and execution metadata.

The Frontend must not depend on a specific execution engine.

## Future Engine Integration

When Engine A and Engine B are introduced:

1. Implement the existing `JudgeEngine` interface.
2. Map native engine results to the shared `JudgeStatus` values.
3. Populate `ExecutionMetadata`.
4. Support the existing test-case contract.
5. Support the existing `VerificationMode` contract.
6. Integrate through the engine-neutral routing boundary.

Existing Backend and Frontend consumers should not require architectural changes solely because Engine A or Engine B is introduced.

## Contract Rule

The execution engine implementation may change.

The engine-neutral contract must remain stable unless a deliberate cross-team contract change is approved.