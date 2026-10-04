import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    verifyAccessToken,
    type AuthUser,
} from "../auth/jwt.js";

declare global {
    namespace Express {
        interface Request {
            authUser?: AuthUser;
        }
    }
}

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        !authorization.startsWith(
            "Bearer ",
        )
    ) {
        res.status(401).json({
            success: false,
            error:
                "Authentication required. Provide a Bearer token.",
        });
        return;
    }

    const token =
        authorization.slice(7).trim();

    if (!token) {
        res.status(401).json({
            success: false,
            error:
                "Authentication token is missing.",
        });
        return;
    }

    try {
        req.authUser =
            verifyAccessToken(token);

        next();
    } catch {
        res.status(401).json({
            success: false,
            error:
                "Invalid or expired authentication token.",
        });
    }
}

export function requireRole(
    ...allowedRoles: AuthUser["role"][]
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        if (!req.authUser) {
            res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
            return;
        }

        if (
            !allowedRoles.includes(
                req.authUser.role,
            )
        ) {
            res.status(403).json({
                success: false,
                error:
                    "You do not have permission to access this resource.",
            });
            return;
        }

        next();
    };
}