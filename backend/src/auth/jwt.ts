import jwt, {
    type SignOptions,
} from "jsonwebtoken";

export interface AuthUser {
    id: string;
    username: string;
    role: "student" | "instructor" | "admin";
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            "JWT_SECRET is not configured.",
        );
    }

    return secret;
}

export function createAccessToken(
    user: AuthUser,
): string {
    const expiresIn =
        (process.env.JWT_EXPIRES_IN ||
            "2h") as SignOptions["expiresIn"];

    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role,
        },
        getJwtSecret(),
        {
            expiresIn,
        },
    );
}

export function verifyAccessToken(
    token: string,
): AuthUser {
    const decoded = jwt.verify(
        token,
        getJwtSecret(),
    );

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.sub !== "string" ||
        typeof decoded.username !== "string" ||
        !(
            decoded.role === "student" ||
            decoded.role === "instructor" ||
            decoded.role === "admin"
        )
    ) {
        throw new Error(
            "Invalid authentication token.",
        );
    }

    return {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role,
    };
}