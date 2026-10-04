# Execution Engine Decision

## Decision

Piston is the single execution engine for the KILN code execution system.

## Architecture

Submission flow:

User Submission

→ Judge Service

→ Piston Engine Adapter

→ Self-Hosted Piston

→ Language Runtime

→ Execution Result

→ Judge Result

## Why Piston

- Supports multiple programming languages.
- Provides isolated code execution.
- Supports execution time, CPU, memory, process, file, and output limits.
- Can be self-hosted.
- Provides a REST API suitable for integration with the Judge service.
- Allows language-specific resource-limit overrides.

## Current Runtimes

| Language | Version |
|---|---|
| Python | 3.10.0 |
| C | 10.2.0 |
| C++ | 10.2.0 |
| Java | 15.0.2 |
| JavaScript | 18.15.0 |
| TypeScript | 5.0.3 |
| Go | 1.16.2 |
| Rust | 1.68.2 |
| C# | 6.12.0 |
| Kotlin | 1.8.20 |
| SQL | SQLite3 3.36.0 |

## Resource Controls

Piston provides the execution sandbox and enforces execution restrictions.

Kotlin has a language-specific compile CPU-time override because its compiler requires more than the default compilation limit.

## Result States

The Judge service exposes:

- Accepted
- Wrong Answer
- Compilation Error
- Runtime Error
- Time Limit Exceeded
- Memory Limit Exceeded
- Judge Error