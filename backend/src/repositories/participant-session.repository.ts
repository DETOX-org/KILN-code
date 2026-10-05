import { and, eq, or } from "drizzle-orm";

import { db } from "../db/index.js";

import {
    users,
    challenges,
    challengeParticipants,
    participantSessions,
} from "../db/schema.js";

const DEFAULT_MAX_STRIKES = 3;

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );
}

function normalizeUsername(username: string): string {
    const cleaned = username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");

    return cleaned.slice(0, 50) || `student_${Date.now()}`;
}

function normalizeDisplayName(
    username: string,
    displayName?: string,
): string {
    return (
        displayName?.trim().slice(0, 100) ||
        username.trim().slice(0, 100) ||
        "KILN Student"
    );
}

function generateLocalEmail(
    username: string,
): string {
    const normalized = normalizeUsername(username);

    return `${normalized}@local.kiln`;
}

async function resolveUser(input: {
    userId?: string;
    username?: string;
    displayName?: string;
    email?: string;
}): Promise<{
    id: string;
    username: string;
    displayName: string;
    email: string;
}> {
    // ------------------------------------------------------------
    // 1. Existing user by UUID
    // ------------------------------------------------------------

    if (input.userId && isUuid(input.userId)) {
        const existingUser = await db
            .select({
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, input.userId))
            .limit(1);

        if (existingUser[0]) {
            return existingUser[0];
        }
    }

    // ------------------------------------------------------------
    // 2. Existing user by username
    // ------------------------------------------------------------

    if (input.username) {
        const username = normalizeUsername(
            input.username,
        );

        const existingUser = await db
            .select({
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                email: users.email,
            })
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUser[0]) {
            return existingUser[0];
        }
    }

    // ------------------------------------------------------------
    // 3. Create a new student account
    // ------------------------------------------------------------

    const username = normalizeUsername(
        input.username || `student_${Date.now()}`,
    );

    const displayName = normalizeDisplayName(
        username,
        input.displayName,
    );

    const email =
        input.email?.trim().toLowerCase() ||
        generateLocalEmail(username);

    // Make sure username is unique.
    let finalUsername = username;

    const usernameConflict = await db
        .select({
            id: users.id,
        })
        .from(users)
        .where(eq(users.username, finalUsername))
        .limit(1);

    if (usernameConflict.length > 0) {
        finalUsername = `${username}_${Date.now()
            .toString()
            .slice(-6)}`.slice(0, 50);
    }

    // Make sure email is unique.
    let finalEmail = email;

    const emailConflict = await db
        .select({
            id: users.id,
        })
        .from(users)
        .where(eq(users.email, finalEmail))
        .limit(1);

    if (emailConflict.length > 0) {
        finalEmail = `student_${Date.now()}@local.kiln`;
    }

    const createdUsers = await db
        .insert(users)
        .values({
            username: finalUsername,
            displayName,
            email: finalEmail,
            role: "student",
        })
        .returning({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            email: users.email,
        });

    const createdUser = createdUsers[0];

    if (!createdUser) {
        throw new Error(
            "Failed to create student user",
        );
    }

    return createdUser;
}

// ============================================================================
// FIND CHALLENGE
// ============================================================================

async function findChallenge(
    sessionCode: string,
) {
    const normalizedCode =
        sessionCode.trim().toUpperCase();

    const rows = await db
        .select({
            id: challenges.id,
            code: challenges.code,
            title: challenges.title,
            status: challenges.status,
            rules: challenges.rules,
            durationMinutes:
                challenges.durationMinutes,
        })
        .from(challenges)
        .where(
            or(
                eq(challenges.code, normalizedCode),
                eq(
                    challenges.slug,
                    normalizedCode.toLowerCase(),
                ),
            ),
        )
        .limit(1);

    return rows[0];
}

// ============================================================================
// JOIN CHALLENGE
// ============================================================================

export async function joinChallenge(
    sessionCode: string,
    input: {
        userId?: string;
        username?: string;
        displayName?: string;
        email?: string;
    },
) {
    const challenge =
        await findChallenge(sessionCode);

    if (!challenge) {
        throw new Error(
            `Challenge Session '${sessionCode}' was not found.`,
        );
    }

    // At the moment, participants can enter
    // an actively running/live challenge.
    if (challenge.status !== "live") {
        throw new Error(
            `Challenge '${challenge.code}' is not currently live.`,
        );
    }

    const user =
        await resolveUser(input);

    const maxStrikes =
        Number(
            (challenge.rules as Record<
                string,
                unknown
            > | null)?.maxStrikes,
        ) || DEFAULT_MAX_STRIKES;

    // ------------------------------------------------------------
    // Use one transaction so participant membership
    // and session creation stay consistent.
    // ------------------------------------------------------------

    const result = await db.transaction(
        async (tx) => {
            await tx
                .insert(challengeParticipants)
                .values({
                    challengeId: challenge.id,
                    userId: user.id,
                })
                .onConflictDoNothing();

            const existingSession =
                await tx
                    .select()
                    .from(participantSessions)
                    .where(
                        and(
                            eq(
                                participantSessions.challengeId,
                                challenge.id,
                            ),
                            eq(
                                participantSessions.userId,
                                user.id,
                            ),
                        ),
                    )
                    .limit(1);

            if (existingSession[0]) {
                const session =
                    existingSession[0];

                // Existing active session.
                if (
                    session.status ===
                    "active"
                ) {
                    const updated =
                        await tx
                            .update(
                                participantSessions,
                            )
                            .set({
                                lastActiveAt:
                                    new Date(),
                            })
                            .where(
                                eq(
                                    participantSessions.id,
                                    session.id,
                                ),
                            )
                            .returning();

                    return updated[0];
                }

                // A submitted session should not
                // silently become active again.
                if (
                    session.status ===
                    "submitted"
                ) {
                    return session;
                }

                // A terminated/disqualified participant
                // remains terminated/disqualified.
                if (
                    session.status ===
                    "terminated" ||
                    session.status ===
                    "disqualified"
                ) {
                    return session;
                }
            }

            const created =
                await tx
                    .insert(participantSessions)
                    .values({
                        challengeId:
                            challenge.id,
                        userId: user.id,
                        status: "active",
                        strikes: 0,
                        maxStrikes,
                        enteredAt:
                            new Date(),
                        lastActiveAt:
                            new Date(),
                    })
                    .returning();

            return created[0];
        },
    );

    if (!result) {
        throw new Error(
            "Failed to create participant session.",
        );
    }

    return {
        participantSessionId:
            result.id,
        challengeId:
            challenge.id,
        sessionCode:
            challenge.code,
        challengeTitle:
            challenge.title,
        user: {
            id: user.id,
            username:
                user.username,
            displayName:
                user.displayName,
            email:
                user.email,
        },
        status:
            result.status,
        strikes:
            result.strikes,
        maxStrikes:
            result.maxStrikes,
        enteredAt:
            result.enteredAt.toISOString(),
        lastActiveAt:
            result.lastActiveAt.toISOString(),
        terminatedAt:
            result.terminatedAt
                ? result.terminatedAt.toISOString()
                : null,
        terminationReason:
            result.terminationReason,
    };
}

// ============================================================================
// GET PARTICIPANT SESSION
// ============================================================================

export async function getParticipantSession(
    sessionCode: string,
    userId: string,
) {
    const challenge =
        await findChallenge(sessionCode);

    if (!challenge) {
        return undefined;
    }

    if (!isUuid(userId)) {
        return undefined;
    }

    const rows = await db
        .select({
            sessionId:
                participantSessions.id,
            status:
                participantSessions.status,
            strikes:
                participantSessions.strikes,
            maxStrikes:
                participantSessions.maxStrikes,
            enteredAt:
                participantSessions.enteredAt,
            lastActiveAt:
                participantSessions.lastActiveAt,
            terminatedAt:
                participantSessions.terminatedAt,
            terminationReason:
                participantSessions.terminationReason,

            userId:
                users.id,
            username:
                users.username,
            displayName:
                users.displayName,
            email:
                users.email,
        })
        .from(participantSessions)
        .innerJoin(
            users,
            eq(
                participantSessions.userId,
                users.id,
            ),
        )
        .where(
            and(
                eq(
                    participantSessions.challengeId,
                    challenge.id,
                ),
                eq(
                    participantSessions.userId,
                    userId,
                ),
            ),
        )
        .limit(1);

    const session = rows[0];

    if (!session) {
        return undefined;
    }

    return {
        participantSessionId:
            session.sessionId,
        challengeId:
            challenge.id,
        sessionCode:
            challenge.code,
        challengeTitle:
            challenge.title,
        user: {
            id: session.userId,
            username:
                session.username,
            displayName:
                session.displayName,
            email:
                session.email,
        },
        status:
            session.status,
        strikes:
            session.strikes,
        maxStrikes:
            session.maxStrikes,
        enteredAt:
            session.enteredAt.toISOString(),
        lastActiveAt:
            session.lastActiveAt.toISOString(),
        terminatedAt:
            session.terminatedAt
                ? session.terminatedAt.toISOString()
                : null,
        terminationReason:
            session.terminationReason,
    };
}

// ============================================================================
// UPDATE LAST ACTIVE
// ============================================================================

export async function touchParticipantSession(
    participantSessionId: string,
) {
    if (!isUuid(participantSessionId)) {
        throw new Error(
            "Invalid participant session ID.",
        );
    }

    const updated =
        await db
            .update(participantSessions)
            .set({
                lastActiveAt:
                    new Date(),
            })
            .where(
                eq(
                    participantSessions.id,
                    participantSessionId,
                ),
            )
            .returning();

    return updated[0];
}