import {
    and,
    asc,
    count,
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../db/index.js";
import {
    challenges,
    challengeParticipants,
    challengeProblems,
    codeSnapshots,
    integrityEvents,
    participantSessions,
    users,
} from "../db/schema.js";

import type {
    IntegrityEvent,
    ParticipantSession,
    CodeSnapshot,
    TelemetryEventInput,
    AutoSaveInput,
    TerminateSessionInput,
} from "../types/telemetry.types.js";

interface SessionRules {
    fullscreenEnforced: boolean;
    maxStrikes: number;
    blockExternalPaste: boolean;
    autoSaveIntervalSec: number;
}

const DEFAULT_RULES: SessionRules = {
    fullscreenEnforced: true,
    maxStrikes: 3,
    blockExternalPaste: true,
    autoSaveIntervalSec: 10,
};

const STRIKE_EVENTS = new Set([
    "FULLSCREEN_EXIT",
    "WINDOW_BLUR",
    "TAB_SWITCH",
    "EXTERNAL_PASTE_BLOCKED",
    "BURST_TYPING_FLAGGED",
]);

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_PATTERN.test(value);
}

function normalizeRules(value: unknown): SessionRules {
    if (!value || typeof value !== "object") {
        return { ...DEFAULT_RULES };
    }

    const rules = value as Partial<SessionRules>;

    return {
        fullscreenEnforced:
            typeof rules.fullscreenEnforced === "boolean"
                ? rules.fullscreenEnforced
                : DEFAULT_RULES.fullscreenEnforced,

        maxStrikes:
            typeof rules.maxStrikes === "number" &&
                Number.isFinite(rules.maxStrikes) &&
                rules.maxStrikes > 0
                ? Math.trunc(rules.maxStrikes)
                : DEFAULT_RULES.maxStrikes,

        blockExternalPaste:
            typeof rules.blockExternalPaste === "boolean"
                ? rules.blockExternalPaste
                : DEFAULT_RULES.blockExternalPaste,

        autoSaveIntervalSec:
            typeof rules.autoSaveIntervalSec === "number" &&
                Number.isFinite(rules.autoSaveIntervalSec) &&
                rules.autoSaveIntervalSec > 0
                ? Math.trunc(rules.autoSaveIntervalSec)
                : DEFAULT_RULES.autoSaveIntervalSec,
    };
}

async function resolveChallenge(identifier: string) {
    const normalized = identifier.trim();

    if (!normalized) {
        throw new Error("Challenge identifier is required.");
    }

    const rows = isUuid(normalized)
        ? await db
            .select()
            .from(challenges)
            .where(eq(challenges.id, normalized))
            .limit(1)
        : await db
            .select()
            .from(challenges)
            .where(eq(challenges.code, normalized.toUpperCase()))
            .limit(1);

    const challenge = rows[0];

    if (!challenge) {
        throw new Error(`Challenge '${identifier}' was not found.`);
    }

    return challenge;
}

async function ensureUserExists(userId: string): Promise<void> {
    if (!isUuid(userId)) {
        throw new Error("userId must be a valid UUID.");
    }

    const rows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!rows[0]) {
        throw new Error("User was not found.");
    }
}

function mapSessionStatus(
    status: string,
): ParticipantSession["status"] {
    switch (status) {
        case "active":
            return "ACTIVE";

        case "strike_warning":
            return "STRIKE_WARNING";

        case "submitted":
            return "SUBMITTED";

        case "terminated":
            return "TERMINATED";

        case "disqualified":
            return "DISQUALIFIED";

        default:
            return "ACTIVE";
    }
}

function mapSession(
    row: typeof participantSessions.$inferSelect,
    challengeReference: string,
    latestSnapshot?: CodeSnapshot,
): ParticipantSession {
    const session: ParticipantSession = {
        userId: row.userId,
        challengeId: challengeReference,
        status: mapSessionStatus(row.status),
        strikes: row.strikes,
        maxStrikes: row.maxStrikes,
        enteredAt: row.enteredAt.toISOString(),
        lastActiveAt: row.lastActiveAt.toISOString(),
    };

    if (row.terminatedAt) {
        session.terminatedAt =
            row.terminatedAt.toISOString();
    }

    if (row.terminationReason) {
        session.terminationReason =
            row.terminationReason;
    }

    if (latestSnapshot) {
        session.latestSnapshot = latestSnapshot;
    }

    return session;
}

function mapIntegrityEvent(
    row: typeof integrityEvents.$inferSelect,
    challengeReference: string,
): IntegrityEvent {
    return {
        id: row.id,
        challengeId: challengeReference,
        userId: row.userId,
        eventType: row.eventType,
        details: row.details ?? {},
        timestamp: row.timestamp.toISOString(),
    };
}

function mapCodeSnapshot(
    row: typeof codeSnapshots.$inferSelect,
    challengeReference: string,
): CodeSnapshot {
    return {
        id: row.id,
        challengeId: challengeReference,
        userId: row.userId,
        problemId: row.problemId,
        code: row.code,
        language: row.language,
        timestamp: row.capturedAt.toISOString(),
    };
}

async function ensureParticipantSession(
    tx: any,
    challengeId: string,
    userId: string,
    maxStrikes: number,
) {
    const existingRows = await tx
        .select()
        .from(participantSessions)
        .where(
            and(
                eq(
                    participantSessions.challengeId,
                    challengeId,
                ),
                eq(
                    participantSessions.userId,
                    userId,
                ),
            ),
        )
        .limit(1);

    if (existingRows[0]) {
        return existingRows[0];
    }

    await tx
        .insert(challengeParticipants)
        .values({
            challengeId,
            userId,
        })
        .onConflictDoNothing();

    const insertedRows = await tx
        .insert(participantSessions)
        .values({
            challengeId,
            userId,
            status: "active",
            strikes: 0,
            maxStrikes,
        })
        .onConflictDoNothing()
        .returning();

    if (insertedRows[0]) {
        return insertedRows[0];
    }

    const retryRows = await tx
        .select()
        .from(participantSessions)
        .where(
            and(
                eq(
                    participantSessions.challengeId,
                    challengeId,
                ),
                eq(
                    participantSessions.userId,
                    userId,
                ),
            ),
        )
        .limit(1);

    const session = retryRows[0];

    if (!session) {
        throw new Error(
            "Unable to create or load participant session.",
        );
    }

    return session;
}

async function getPrimaryProblemId(
    tx: any,
    challengeId: string,
): Promise<string | undefined> {
    const rows = await tx
        .select({
            problemId: challengeProblems.problemId,
        })
        .from(challengeProblems)
        .where(
            eq(
                challengeProblems.challengeId,
                challengeId,
            ),
        )
        .orderBy(
            asc(challengeProblems.orderIndex),
        )
        .limit(1);

    return rows[0]?.problemId;
}

export async function recordTelemetryEvent(
    challengeReference: string,
    input: TelemetryEventInput,
): Promise<{
    event: IntegrityEvent;
    session: ParticipantSession;
    strikeAdded: boolean;
}> {
    await ensureUserExists(input.userId);

    const challenge = await resolveChallenge(
        challengeReference,
    );

    const rules = normalizeRules(challenge.rules);

    return db.transaction(async (tx) => {
        const session = await ensureParticipantSession(
            tx,
            challenge.id,
            input.userId,
            rules.maxStrikes,
        );

        const now = new Date();

        let strikes = session.strikes;
        let status = session.status;
        let terminatedAt = session.terminatedAt;
        let terminationReason =
            session.terminationReason;

        let strikeAdded = false;

        const isSessionLive =
            status === "active" ||
            status === "strike_warning";

        if (
            STRIKE_EVENTS.has(input.eventType) &&
            isSessionLive
        ) {
            strikes += 1;
            strikeAdded = true;

            if (
                strikes >= session.maxStrikes
            ) {
                status = "terminated";
                terminatedAt = now;
                terminationReason =
                    `Exceeded maximum anti-cheat violation strikes (${strikes}/${session.maxStrikes})`;
            } else {
                status = "strike_warning";
            }
        }

        const updatedRows = await tx
            .update(participantSessions)
            .set({
                strikes,
                status,
                lastActiveAt: now,
                terminatedAt,
                terminationReason,
            })
            .where(
                eq(
                    participantSessions.id,
                    session.id,
                ),
            )
            .returning();

        const updatedSession =
            updatedRows[0] ?? session;

        const eventRows = await tx
            .insert(integrityEvents)
            .values({
                challengeId: challenge.id,
                userId: input.userId,
                eventType: input.eventType,
                details: input.details ?? {},
                timestamp: now,
            })
            .returning();

        const eventRow = eventRows[0];

        if (!eventRow) {
            throw new Error(
                "Failed to persist integrity telemetry event.",
            );
        }

        return {
            event: mapIntegrityEvent(
                eventRow,
                challengeReference,
            ),
            session: mapSession(
                updatedSession,
                challengeReference,
            ),
            strikeAdded,
        };
    });
}

export async function saveTelemetrySnapshot(
    challengeReference: string,
    input: AutoSaveInput,
): Promise<{
    snapshot: CodeSnapshot;
    totalSnapshots: number;
}> {
    await ensureUserExists(input.userId);

    if (!isUuid(input.problemId)) {
        throw new Error(
            "problemId must be a valid UUID.",
        );
    }

    const challenge = await resolveChallenge(
        challengeReference,
    );

    const linkedProblem = await db
        .select({
            problemId: challengeProblems.problemId,
        })
        .from(challengeProblems)
        .where(
            and(
                eq(
                    challengeProblems.challengeId,
                    challenge.id,
                ),
                eq(
                    challengeProblems.problemId,
                    input.problemId,
                ),
            ),
        )
        .limit(1);

    if (!linkedProblem[0]) {
        throw new Error(
            "The specified problem is not part of this challenge.",
        );
    }

    const rules = normalizeRules(challenge.rules);

    return db.transaction(async (tx) => {
        const session =
            await ensureParticipantSession(
                tx,
                challenge.id,
                input.userId,
                rules.maxStrikes,
            );

        const now = new Date();

        const snapshotRows = await tx
            .insert(codeSnapshots)
            .values({
                challengeId: challenge.id,
                userId: input.userId,
                problemId: input.problemId,
                code: input.code,
                language: input.language,
                capturedAt: now,
            })
            .returning();

        const snapshotRow =
            snapshotRows[0];

        if (!snapshotRow) {
            throw new Error(
                "Failed to persist code snapshot.",
            );
        }

        await tx
            .update(participantSessions)
            .set({
                lastActiveAt: now,
            })
            .where(
                eq(
                    participantSessions.id,
                    session.id,
                ),
            );

        const countRows = await tx
            .select({
                count: count(),
            })
            .from(codeSnapshots)
            .where(
                and(
                    eq(
                        codeSnapshots.challengeId,
                        challenge.id,
                    ),
                    eq(
                        codeSnapshots.userId,
                        input.userId,
                    ),
                    eq(
                        codeSnapshots.problemId,
                        input.problemId,
                    ),
                ),
            );

        return {
            snapshot: mapCodeSnapshot(
                snapshotRow,
                challengeReference,
            ),
            totalSnapshots: Number(
                countRows[0]?.count ?? 0,
            ),
        };
    });
}

export async function terminateTelemetrySession(
    challengeReference: string,
    input: TerminateSessionInput,
): Promise<ParticipantSession> {
    await ensureUserExists(input.userId);

    const challenge = await resolveChallenge(
        challengeReference,
    );

    const rules = normalizeRules(challenge.rules);

    return db.transaction(async (tx) => {
        const session =
            await ensureParticipantSession(
                tx,
                challenge.id,
                input.userId,
                rules.maxStrikes,
            );

        const now = new Date();

        const newStatus =
            input.action === "SUBMIT_AND_EXIT"
                ? "submitted"
                : "terminated";

        const updatedRows = await tx
            .update(participantSessions)
            .set({
                status: newStatus,
                terminatedAt: now,
                lastActiveAt: now,
                terminationReason:
                    input.reason ||
                    "User initiated termination",
            })
            .where(
                eq(
                    participantSessions.id,
                    session.id,
                ),
            )
            .returning();

        const updatedSession =
            updatedRows[0] ?? session;

        /*
         * code_snapshots.problem_id is a foreign key.
         * When a final code payload is supplied, attach
         * it to the first problem linked to this challenge.
         */
        if (
            input.code &&
            input.language
        ) {
            const problemId =
                await getPrimaryProblemId(
                    tx,
                    challenge.id,
                );

            if (!problemId) {
                throw new Error(
                    "Cannot persist final snapshot because the challenge has no linked problem.",
                );
            }

            await tx
                .insert(codeSnapshots)
                .values({
                    challengeId: challenge.id,
                    userId: input.userId,
                    problemId,
                    code: input.code,
                    language: input.language,
                    capturedAt: now,
                });
        }

        const latestSnapshotRows = await tx
            .select()
            .from(codeSnapshots)
            .where(
                and(
                    eq(
                        codeSnapshots.challengeId,
                        challenge.id,
                    ),
                    eq(
                        codeSnapshots.userId,
                        input.userId,
                    ),
                ),
            )
            .orderBy(
                desc(codeSnapshots.capturedAt),
            )
            .limit(1);

        const latestSnapshot =
            latestSnapshotRows[0]
                ? mapCodeSnapshot(
                    latestSnapshotRows[0],
                    challengeReference,
                )
                : undefined;

        return mapSession(
            updatedSession,
            challengeReference,
            latestSnapshot,
        );
    });
}

export async function getTelemetryAudit(
    challengeReference: string,
    userId: string,
): Promise<{
    session: ParticipantSession;
    events: IntegrityEvent[];
    snapshots: CodeSnapshot[];
}> {
    await ensureUserExists(userId);

    const challenge = await resolveChallenge(
        challengeReference,
    );

    const rules = normalizeRules(challenge.rules);

    return db.transaction(async (tx) => {
        const sessionRow =
            await ensureParticipantSession(
                tx,
                challenge.id,
                userId,
                rules.maxStrikes,
            );

        const eventRows = await tx
            .select()
            .from(integrityEvents)
            .where(
                and(
                    eq(
                        integrityEvents.challengeId,
                        challenge.id,
                    ),
                    eq(
                        integrityEvents.userId,
                        userId,
                    ),
                ),
            )
            .orderBy(
                asc(integrityEvents.timestamp),
            );

        const snapshotRows = await tx
            .select()
            .from(codeSnapshots)
            .where(
                and(
                    eq(
                        codeSnapshots.challengeId,
                        challenge.id,
                    ),
                    eq(
                        codeSnapshots.userId,
                        userId,
                    ),
                ),
            )
            .orderBy(
                asc(codeSnapshots.capturedAt),
            );

        const snapshots =
            snapshotRows.map((row) =>
                mapCodeSnapshot(
                    row,
                    challengeReference,
                ),
            );

        const latestSnapshot =
            snapshots.length > 0
                ? snapshots[
                snapshots.length - 1
                ]
                : undefined;

        return {
            session: mapSession(
                sessionRow,
                challengeReference,
                latestSnapshot,
            ),
            events: eventRows.map(
                (row) =>
                    mapIntegrityEvent(
                        row,
                        challengeReference,
                    ),
            ),
            snapshots,
        };
    });
}
