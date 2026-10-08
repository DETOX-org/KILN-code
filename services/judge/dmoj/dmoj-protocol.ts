import { Socket } from "node:net";
import { promisify } from "node:util";
import * as zlib from "node:zlib";

const SIZE_BYTES = 4;
const MAX_PACKET_SIZE = 16 * 1024 * 1024;

const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

export async function encodeDmojPacket(
  packet: Record<string, unknown>
): Promise<Buffer> {
  const json = JSON.stringify(packet);
  const compressed = await deflate(Buffer.from(json, "utf8"));

  if (compressed.length > MAX_PACKET_SIZE) {
    throw new Error("DMOJ packet exceeds maximum allowed size");
  }

  const header = Buffer.allocUnsafe(SIZE_BYTES);
  header.writeUInt32BE(compressed.length, 0);

  return Buffer.concat([header, compressed]);
}

export function createDmojPacketReader(
  socket: Socket,
  onPacket: (packet: Record<string, unknown>) => void,
  onError: (error: Error) => void
): void {
  let buffer = Buffer.alloc(0);

  socket.on("data", async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    try {
      while (buffer.length >= SIZE_BYTES) {
        const size = buffer.readUInt32BE(0);

        if (size > MAX_PACKET_SIZE) {
          throw new Error(
            `DMOJ packet exceeds maximum allowed size: ${size}`
          );
        }

        if (buffer.length < SIZE_BYTES + size) {
          return;
        }

        const payload = buffer.subarray(
          SIZE_BYTES,
          SIZE_BYTES + size
        );

        buffer = buffer.subarray(SIZE_BYTES + size);

        const decompressed = await inflate(payload);
        const packet = JSON.parse(
          decompressed.toString("utf8")
        ) as Record<string, unknown>;

        onPacket(packet);
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? error
          : new Error(String(error))
      );
    }
  });

  socket.on("error", onError);
}

export async function sendDmojPacket(
  socket: Socket,
  packet: Record<string, unknown>
): Promise<void> {
  const encoded = await encodeDmojPacket(packet);

  await new Promise<void>((resolve, reject) => {
    socket.write(encoded, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
