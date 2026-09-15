# Judge Queue Contract

## Queue

Redis queue:

`judge:queue`

Processing queue:

`judge:processing`

Result key:

`judge:result:<jobId>`

Processing lock:

`judge:processing:<jobId>`

## Judge Job

A job contains:

- `jobId` — unique job identifier
- `language` — supported programming language
- `code` — source code
- `tests` — test cases
- `attempt` — retry attempt number

Each test case contains:

- `input`
- `expectedOutput`
- `visibility` — `public` or `hidden`

## Processing Flow

```text
Judge Job
    ↓
Redis Queue
    ↓
Processing Queue
    ↓
Judge Worker
    ↓
JudgeEngine
    ↓
Piston
    ↓
Execution Result
    ↓
Redis Result