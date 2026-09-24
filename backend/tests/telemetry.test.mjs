import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../dist/app.js";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      baseUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    if (typeof server.closeAllConnections === "function") {
      server.closeAllConnections();
    }
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Anti-Cheat: Logs telemetry and increments strikes on window blur", async () => {
  const challengeId = "challenge-daily-01";
  const userId = "test-user-alpha";

  // Event 1: Blur
  const res1 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Connection": "close" },
    body: JSON.stringify({
      userId,
      eventType: "WINDOW_BLUR",
      details: { clientTimestamp: Date.now() }
    })
  });
  const data1 = await res1.json();
  assert.equal(res1.status, 200);
  assert.equal(data1.data.strikes, 1);
  assert.equal(data1.data.sessionStatus, "STRIKE_WARNING");
  assert.equal(data1.data.isTerminated, false);

  // Event 2: Tab switch
  const res2 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Connection": "close" },
    body: JSON.stringify({
      userId,
      eventType: "TAB_SWITCH"
    })
  });
  const data2 = await res2.json();
  assert.equal(data2.data.strikes, 2);
  assert.equal(data2.data.sessionStatus, "STRIKE_WARNING");

  // Event 3: External Paste Blocked (Strike 3 -> Termination)
  const res3 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Connection": "close" },
    body: JSON.stringify({
      userId,
      eventType: "EXTERNAL_PASTE_BLOCKED",
      details: { rejectedLength: 120 }
    })
  });
  const data3 = await res3.json();
  assert.equal(data3.data.strikes, 3);
  assert.equal(data3.data.sessionStatus, "TERMINATED");
  assert.equal(data3.data.isTerminated, true);
});

test("Anti-Cheat: 10-second idle debounce snapshot autosave", async () => {
  const challengeId = "challenge-daily-01";
  const userId = "test-user-beta";

  const res = await fetch(`${baseUrl}/api/challenges/${challengeId}/autosave`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Connection": "close" },
    body: JSON.stringify({
      userId,
      problemId: "two-sum",
      code: "def twoSum(nums, target):\n    prevMap = {}\n    return [0, 1]",
      language: "python"
    })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.totalSnapshots, 1);
});

test("Anti-Cheat: Escape key or user-initiated termination", async () => {
  const challengeId = "challenge-daily-01";
  const userId = "test-user-gamma";

  const res = await fetch(`${baseUrl}/api/challenges/${challengeId}/terminate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Connection": "close" },
    body: JSON.stringify({
      userId,
      reason: "User pressed Escape and confirmed exit modal",
      action: "SUBMIT_AND_EXIT",
      code: "class Solution: pass",
      language: "python"
    })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.status, "SUBMITTED");
});

test("Anti-Cheat: Audit history inspection", async () => {
  const challengeId = "challenge-daily-01";
  const userId = "test-user-alpha";

  const res = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry/${userId}`, {
    headers: { "Connection": "close" }
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.data.session.userId, userId);
  assert.equal(data.data.events.length >= 3, true);
});
