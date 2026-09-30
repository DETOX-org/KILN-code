import { desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
    challenges,
    challengeParticipants,
    participantSessions,
    submissions,
    submissionResults,
    integrityEvents,
    codeSnapshots,
    users,
    problems,
    challengeProblems,
} from "../db/schema.js";

async function resolveChallenge(identifier: string) {
    const value = identifier.trim();

    const rows = await db
        .select({
            id: challenges.id,
            code: challenges.code,
            title: challenges.title,
            status: challenges.status,
            rules: challenges.rules,
            description: challenges.description,
            durationMinutes: challenges.durationMinutes,
            points: challenges.points,
            createdAt: challenges.createdAt,
        })
        .from(challenges)
        .where(eq(challenges.code, value.toUpperCase()))
        .limit(1);

    return rows[0];
}

export async function getAdminSessionList() {
    const rows = await db
        .select({
            id: challenges.id,
            code: challenges.code,
            title: challenges.title,
            description: challenges.description,
            durationMinutes:
                challenges.durationMinutes,
            points: challenges.points,
            status: challenges.status,
            createdAt: challenges.createdAt,
        })
        .from(challenges)
        .orderBy(desc(challenges.createdAt));

    return Promise.all(
        rows.map(async (challenge) => {
            const [
                participantRows,
                submissionRows,
                problemRows,
            ] = await Promise.all([
                db
                    .select({
                        userId:
                            challengeParticipants.userId,
                    })
                    .from(challengeParticipants)
                    .where(
                        eq(
                            challengeParticipants.challengeId,
                            challenge.id,
                        ),
                    ),

                db
                    .select({
                        id: submissions.id,
                    })
                    .from(submissions)
                    .where(
                        eq(
                            submissions.challengeId,
                            challenge.id,
                        ),
                    ),

                db
                    .select({
                        title: problems.title,
                        slug: problems.slug,
                    })
                    .from(challengeProblems)
                    .innerJoin(
                        problems,
                        eq(
                            challengeProblems.problemId,
                            problems.id,
                        ),
                    )
                    .where(
                        eq(
                            challengeProblems.challengeId,
                            challenge.id,
                        ),
                    )
                    .orderBy(
                        challengeProblems.orderIndex,
                    )
                    .limit(1),
            ]);

            const problem = problemRows[0];

            return {
                id: challenge.code,
                databaseId: challenge.id,
                title: challenge.title,
                description:
                    challenge.description ?? "",
                durationMinutes:
                    challenge.durationMinutes,
                points: challenge.points,
                status: challenge.status,

                problemTitle:
                    problem?.title ?? "",
                problemSlug:
                    problem?.slug ?? "",

                participantsCount:
                    participantRows.length,
                submissionsCount:
                    submissionRows.length,
                createdAt:
                    challenge.createdAt,
            };
        }),
    );
}

export async function getAdminSessionAudit(
    identifier: string,
) {
    const challenge =
        await resolveChallenge(identifier);

    if (!challenge) {
        return undefined;
    }

    const [
        participantRows,
        submissionRows,
        integrityRows,
        snapshotRows,
    ] = await Promise.all([
        db
            .select({
                session: participantSessions,
                username: users.username,
                displayName:
                    users.displayName,
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
                eq(
                    participantSessions.challengeId,
                    challenge.id,
                ),
            )
            .orderBy(
                desc(
                    participantSessions.enteredAt,
                ),
            ),

        db
            .select({
                submission: submissions,
                username: users.username,
                displayName:
                    users.displayName,
                problemTitle:
                    problems.title,
                problemSlug:
                    problems.slug,
            })
            .from(submissions)
            .innerJoin(
                users,
                eq(
                    submissions.userId,
                    users.id,
                ),
            )
            .innerJoin(
                problems,
                eq(
                    submissions.problemId,
                    problems.id,
                ),
            )
            .where(
                eq(
                    submissions.challengeId,
                    challenge.id,
                ),
            )
            .orderBy(
                desc(
                    submissions.submittedAt,
                ),
            ),

        db
            .select({
                event: integrityEvents,
                username: users.username,
            })
            .from(integrityEvents)
            .innerJoin(
                users,
                eq(
                    integrityEvents.userId,
                    users.id,
                ),
            )
            .where(
                eq(
                    integrityEvents.challengeId,
                    challenge.id,
                ),
            )
            .orderBy(
                desc(
                    integrityEvents.timestamp,
                ),
            ),

        db
            .select({
                snapshot: codeSnapshots,
                username: users.username,
            })
            .from(codeSnapshots)
            .innerJoin(
                users,
                eq(
                    codeSnapshots.userId,
                    users.id,
                ),
            )
            .where(
                eq(
                    codeSnapshots.challengeId,
                    challenge.id,
                ),
            )
            .orderBy(
                desc(
                    codeSnapshots.capturedAt,
                ),
            ),
    ]);

    const submissionsWithResults =
        await Promise.all(
            submissionRows.map(
                async (row) => {
                    const results =
                        await db
                            .select()
                            .from(
                                submissionResults,
                            )
                            .where(
                                eq(
                                    submissionResults.submissionId,
                                    row.submission.id,
                                ),
                            )
                            .orderBy(
                                submissionResults.id,
                            );

                    return {
                        id: row.submission.id,
                        userId:
                            row.submission.userId,
                        username:
                            row.username,
                        displayName:
                            row.displayName,
                        problemId:
                            row.submission.problemId,
                        problemTitle:
                            row.problemTitle,
                        problemSlug:
                            row.problemSlug,
                        language:
                            row.submission.language,
                        sourceCode:
                            row.submission.sourceCode,
                        status:
                            row.submission.status,
                        score:
                            row.submission.score,
                        runtimeMs:
                            row.submission.executionTimeMs,
                        memoryKb:
                            row.submission.memoryUsedKb,
                        attemptNumber:
                            row.submission.attemptNumber,
                        submittedAt:
                            row.submission.submittedAt,
                        judgedAt:
                            row.submission.judgedAt,
                        results,
                    };
                },
            ),
        );

    return {
        sessionId:
            challenge.code,
        databaseSessionId:
            challenge.id,
        title:
            challenge.title,
        description:
            challenge.description ?? "",
        durationMinutes:
            challenge.durationMinutes,
        points:
            challenge.points,
        status:
            challenge.status,
        rules:
            challenge.rules,

        participants:
            participantRows.map(
                (row) => ({
                    participantSessionId:
                        row.session.id,
                    userId:
                        row.session.userId,
                    username:
                        row.username,
                    displayName:
                        row.displayName,
                    status:
                        row.session.status,
                    strikes:
                        row.session.strikes,
                    maxStrikes:
                        row.session.maxStrikes,
                    enteredAt:
                        row.session.enteredAt,
                    lastActiveAt:
                        row.session.lastActiveAt,
                    terminatedAt:
                        row.session.terminatedAt,
                    terminationReason:
                        row.session.terminationReason,
                }),
            ),

        submissions:
            submissionsWithResults,

        integrityEvents:
            integrityRows.map(
                (row) => ({
                    id: row.event.id,
                    userId:
                        row.event.userId,
                    username:
                        row.username,
                    eventType:
                        row.event.eventType,
                    details:
                        row.event.details,
                    timestamp:
                        row.event.timestamp,
                }),
            ),

        codeSnapshots:
            snapshotRows.map(
                (row) => ({
                    id: row.snapshot.id,
                    userId:
                        row.snapshot.userId,
                    username:
                        row.username,
                    problemId:
                        row.snapshot.problemId,
                    code:
                        row.snapshot.code,
                    language:
                        row.snapshot.language,
                    capturedAt:
                        row.snapshot.capturedAt,
                }),
            ),
    };
}
