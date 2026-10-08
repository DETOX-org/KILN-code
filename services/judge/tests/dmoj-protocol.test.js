const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");

async function loadProtocol() {
  return import("../dist/services/judge/dmoj/dmoj-protocol.js");
}

test("DMOJ packet round-trip", async () => {
  const { createDmojPacketReader, sendDmojPacket } =
    await loadProtocol();

  const server = net.createServer();

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");

  const received = new Promise((resolve, reject) => {
    server.once("connection", (socket) => {
      createDmojPacketReader(
        socket,
        (packet) => resolve(packet),
        reject
      );
    });
  });

  const client = net.createConnection({
    host: "127.0.0.1",
    port: address.port
  });

  await new Promise((resolve, reject) => {
    client.once("connect", resolve);
    client.once("error", reject);
  });

  const packet = {
    name: "handshake",
    id: "test-judge",
    key: "test-key",
    problems: [["helloworld", 123]],
    executors: {
      PY3: "python3 3.14.7"
    }
  };

  await sendDmojPacket(client, packet);

  assert.deepEqual(await received, packet);

  client.destroy();
  server.close();
});
