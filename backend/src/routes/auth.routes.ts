import {
    Router,
    type Request,
    type Response,
} from "express";
import {
    registerRateLimiter,
    loginRateLimiter,
} from "../middleware/rate-limit.middleware.js";
import { and, eq, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";

import {
    hashPassword,
    verifyPassword,
} from "../auth/password.js";

import {
    createAccessToken,
} from "../auth/jwt.js";

import {
    requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

function cleanString(
    value: unknown,
): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

/*
 * POST /api/auth/register
 *
 * Public registration creates only student accounts.
 * Existing admin/instructor roles cannot be created through this endpoint.
 */
router.post("/register", registerRateLimiter, async (
    req: Request,
    res: Response,
) => {
    try {
        const username =
            cleanString(req.body?.username);

        const displayName =
            cleanString(
                req.body?.displayName,
            );

        const email =
            cleanString(req.body?.email)
                .toLowerCase();

        const password =
            typeof req.body?.password ===
                "string"
                ? req.body.password
                : "";

        if (
            !username ||
            !displayName ||
            !email ||
            !password
        ) {
            res.status(400).json({
                success: false,
                error:
                    "username, displayName, email and password are required.",
            });
            return;
        }

        if (
            !/^[A-Za-z0-9_]{3,50}$/.test(
                username,
            )
        ) {
            res.status(400).json({
                success: false,
                error:
                    "Username must contain 3-50 letters, numbers or underscores.",
            });
            return;
        }

        if (
            password.length < 8
        ) {
            res.status(400).json({
                success: false,
                error:
                    "Password must contain at least 8 characters.",
            });
            return;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email,
            )
        ) {
            res.status(400).json({
                success: false,
                error:
                    "A valid email address is required.",
            });
            return;
        }

        const existing =
            await db
                .select({
                    id: users.id,
                    username: users.username,
                    email: users.email,
                })
                .from(users)
                .where(
                    or(
                        eq(
                            users.username,
                            username,
                        ),
                        eq(
                            users.email,
                            email,
                        ),
                    ),
                )
                .limit(1);

        if (existing[0]) {
            res.status(409).json({
                success: false,
                error:
                    "Username or email is already registered.",
            });
            return;
        }

        const passwordHash =
            hashPassword(password);

        const inserted =
            await db
                .insert(users)
                .values({
                    username,
                    displayName,
                    email,
                    role: "student",
                    passwordHash,
                })
                .returning({
                    id: users.id,
                    username: users.username,
                    displayName:
                        users.displayName,
                    email: users.email,
                    role: users.role,
                });

        const user = inserted[0];

        if (!user) {
            res.status(500).json({
                success: false,
                error:
                    "Failed to create user account.",
            });
            return;
        }

        const token =
            createAccessToken({
                id: user.id,
                username: user.username,
                role: user.role,
            });

        res.status(201).json({
            success: true,
            message:
                "Account created successfully.",
            data: {
                token,
                user,
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error:
                err.message ||
                "Failed to register account.",
        });
    }
},
);

/*
 * POST /api/auth/login
 *
 * Login accepts either username or email.
 */
router.post("/login", loginRateLimiter, async (
    req: Request,
    res: Response,
) => {
    try {
        const identifier =
            cleanString(
                req.body?.identifier ??
                req.body?.username ??
                req.body?.email,
            );

        const password =
            typeof req.body?.password ===
                "string"
                ? req.body.password
                : "";

        if (
            !identifier ||
            !password
        ) {
            res.status(400).json({
                success: false,
                error:
                    "identifier and password are required.",
            });
            return;
        }

        const userRows =
            await db
                .select({
                    id: users.id,
                    username: users.username,
                    displayName:
                        users.displayName,
                    email: users.email,
                    role: users.role,
                    passwordHash:
                        users.passwordHash,
                })
                .from(users)
                .where(
                    or(
                        eq(
                            users.username,
                            identifier,
                        ),
                        eq(
                            users.email,
                            identifier
                                .toLowerCase(),
                        ),
                    ),
                )
                .limit(1);

        const user =
            userRows[0];

        if (
            !user ||
            !user.passwordHash ||
            !verifyPassword(
                password,
                user.passwordHash,
            )
        ) {
            res.status(401).json({
                success: false,
                error:
                    "Invalid username/email or password.",
            });
            return;
        }

        const token =
            createAccessToken({
                id: user.id,
                username: user.username,
                role: user.role,
            });

        res.json({
            success: true,
            message:
                "Login successful.",
            data: {
                token,
                user: {
                    id: user.id,
                    username:
                        user.username,
                    displayName:
                        user.displayName,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error:
                err.message ||
                "Failed to authenticate.",
        });
    }
},
);

/*
 * GET /api/auth/me
 *
 * Returns the authenticated identity from the JWT.
 */
router.get(
    "/me",
    requireAuth,
    async (
        req: Request,
        res: Response,
    ) => {
        try {
            const user =
                await db
                    .select({
                        id: users.id,
                        username:
                            users.username,
                        displayName:
                            users.displayName,
                        email: users.email,
                        role: users.role,
                    })
                    .from(users)
                    .where(
                        eq(
                            users.id,
                            req.authUser!.id,
                        ),
                    )
                    .limit(1);

            if (!user[0]) {
                res.status(404).json({
                    success: false,
                    error:
                        "Authenticated user no longer exists.",
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    user: user[0],
                },
            });
        } catch (err: any) {
            res.status(500).json({
                success: false,
                error:
                    err.message ||
                    "Failed to load authenticated user.",
            });
        }
    },
);

export default router;