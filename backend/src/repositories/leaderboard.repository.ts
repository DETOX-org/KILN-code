import { eq, or, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import {
    challenges,
    challengeParticipants,
    participantSessions,
    users,
} from "../db/schema.js";

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    display_name: string;
    total_score: number;
    penalty: number;
    is_verified: boolean;
    problems_solved: number;
    submission_count: number;
    session_status: string | null;
}

async function resolveChallenge(identifier: string) {
    const value = identifier.trim();

    if (!value) {
        return undefined;
    }

    const rows = await db
        .select()
        .from(challenges)
        .where(
            or(
                eq(challenges.code, value.toUpperCase()),
                sql`${challenges.id}::text = ${value}`,
            ),
        )
        .limit(1);

    return rows[0];
}

/**
 * PostgreSQL-backed leaderboard.
 *
 * For each participant/problem, only the highest score counts.
 * The participant total is the sum of those best scores.
 * Penalty is elapsed whole seconds from challenge start to first submission.
 */
export async function getChallengeLeaderboard(identifier: string) {
    const challenge = await resolveChallenge(identifier);

    if (!challenge) {
        throw new Error(`Challenge '${identifier}' not found.`);
    }

    const result = await db.execute(sql`
        WITH best_per_problem AS (
            SELECT DISTINCT ON (
                s.challenge_id,
                s.user_id,
                s.problem_id
            )
                s.id,
                s.challenge_id,
                s.user_id,
                s.problem_id,
                s.score,
                s.status,
                s.submitted_at
            FROM submissions s
            WHERE s.challenge_id = ${challenge.id}
            ORDER BY
                s.challenge_id,
                s.user_id,
                s.problem_id,
                s.score DESC,
                s.submitted_at ASC
        ),
        aggregated AS (
            SELECT
                cp.user_id,

                COALESCE(
                    SUM(best.score),
                    0
                )::integer AS total_score,

                COALESCE(
                    FLOOR(
                        EXTRACT(
                            EPOCH FROM (
                                MIN(best.submitted_at)
                                - ${challenge.startAt}
                            )
                        )
                    ),
                    0
                )::integer AS penalty,

                COUNT(
                    DISTINCT CASE
                        WHEN best.status = 'accepted'
                        THEN best.problem_id
                    END
                )::integer AS problems_solved,

                COUNT(best.id)::integer AS submission_count,

                COALESCE(
                    BOOL_OR(
                        best.status = 'accepted'
                    ),
                    false
                ) AS is_verified

            FROM challenge_participants cp

            LEFT JOIN best_per_problem best
                ON best.challenge_id = cp.challenge_id
               AND best.user_id = cp.user_id

            WHERE cp.challenge_id = ${challenge.id}

            GROUP BY cp.user_id
        )

        SELECT
            ROW_NUMBER() OVER (
                ORDER BY
                    aggregated.total_score DESC,
                    aggregated.penalty ASC,
                    u.username ASC
            )::integer AS rank,

            u.id::text AS user_id,
            u.username,
            COALESCE(
                u.display_name,
                u.username
            ) AS display_name,

            aggregated.total_score,
            aggregated.penalty,
            aggregated.problems_solved,
            aggregated.submission_count,
            aggregated.is_verified,

            ps.status AS session_status

        FROM aggregated

        INNER JOIN users u
            ON u.id = aggregated.user_id

        LEFT JOIN participant_sessions ps
            ON ps.challenge_id = ${challenge.id}
           AND ps.user_id = u.id

        ORDER BY
            aggregated.total_score DESC,
            aggregated.penalty ASC,
            u.username ASC
    `);

    const rows = result.rows;

    const standings = rows.map((row) => ({
        rank: Number(row.rank),
        user_id: row.user_id,
        username: row.username,
        display_name: row.display_name,
        total_score: Number(row.total_score),
        penalty: Number(row.penalty),
        is_verified: Boolean(row.is_verified),
        problems_solved: Number(row.problems_solved),
        submission_count: Number(row.submission_count),
        session_status: row.session_status ?? null,
    }));

    return {
        challengeId: challenge.id,
        contestId: challenge.code,
        title: challenge.title,
        status: challenge.status,
        standings,
    };
}
// ============================================================================
// CONTEST LIST
// ============================================================================

export async function getContestList() {
    const result = await db.execute(sql`
        SELECT
            c.code AS id,
            c.title,
            c.status,
            COUNT(DISTINCT cp.user_id)::integer
                AS participants_count
        FROM challenges c
        LEFT JOIN challenge_participants cp
            ON cp.challenge_id = c.id
        GROUP BY
            c.id,
            c.code,
            c.title,
            c.status,
            c.created_at
        ORDER BY
            c.created_at DESC
    `);

    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        participantsCount:
            Number(row.participants_count),
    }));
}