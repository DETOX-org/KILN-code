import {
    randomBytes,
    scryptSync,
    timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPassword(
    password: string,
): string {
    const salt = randomBytes(SALT_LENGTH).toString("hex");

    const derivedKey = scryptSync(
        password,
        salt,
        KEY_LENGTH,
    ).toString("hex");

    return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(
    password: string,
    storedHash: string,
): boolean {
    try {
        const parts = storedHash.split("$");

        if (parts.length !== 3) {
            return false;
        }

        const [algorithm, salt, storedKeyHex] =
            parts;

        if (algorithm !== "scrypt") {
            return false;
        }

        const storedKey = Buffer.from(
            storedKeyHex,
            "hex",
        );

        const derivedKey = scryptSync(
            password,
            salt,
            KEY_LENGTH,
        );

        if (
            storedKey.length !==
            derivedKey.length
        ) {
            return false;
        }

        return timingSafeEqual(
            storedKey,
            derivedKey,
        );
    } catch {
        return false;
    }
}