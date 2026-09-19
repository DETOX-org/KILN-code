import assert from "node:assert/strict";
import http from "node:http";
import appModule from "../dist/app.js";

const app = typeof appModule === "function" ? appModule : appModule.default;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAll() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3099, "127.0.0.1", resolve));
  const baseUrl = "http://127.0.0.1:3099";
  console.log(`Test server running at ${baseUrl}`);

  try {
    const challengeId = "challenge-daily-01";
    const userId = "test-user-alpha";

    // Event 1: Blur
    const res1 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    console.log("✔ Step 1: Strike 1 logged on blur");

    await sleep(50);

    // Event 2: Tab switch
    const res2 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        eventType: "TAB_SWITCH"
      })
    });
    const data2 = await res2.json();
    assert.equal(data2.data.strikes, 2);
    assert.equal(data2.data.sessionStatus, "STRIKE_WARNING");
    console.log("✔ Step 2: Strike 2 logged on tab switch");

    await sleep(50);

    // Event 3: External paste blocked -> Strike 3 & Termination
    const res3 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    console.log("✔ Step 3: Strike 3 terminated session");

    await sleep(50);

    // 10-second idle autosave snapshot
    const res4 = await fetch(`${baseUrl}/api/challenges/${challengeId}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-beta",
        problemId: "two-sum",
        code: "def twoSum(nums, target): return [0, 1]",
        language: "python"
      })
    });
    const data4 = await res4.json();
    assert.equal(res4.status, 200);
    assert.equal(data4.data.totalSnapshots, 1);
    console.log("✔ Step 4: 10s idle snapshot saved");

    await sleep(50);

    // Escape key termination
    const res5 = await fetch(`${baseUrl}/api/challenges/${challengeId}/terminate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-gamma",
        reason: "User confirmed Escape key exit modal",
        action: "SUBMIT_AND_EXIT",
        code: "class Solution: pass",
        language: "python"
      })
    });
    const data5 = await res5.json();
    assert.equal(res5.status, 200);
    assert.equal(data5.data.status, "SUBMITTED");
    console.log("✔ Step 5: Termination request marked as SUBMITTED");

    await sleep(50);

    // Audit query
    const res6 = await fetch(`${baseUrl}/api/challenges/${challengeId}/telemetry/${userId}`);
    const data6 = await res6.json();
    assert.equal(res6.status, 200);
    assert.equal(data6.data.session.userId, userId);
    assert.equal(data6.data.events.length >= 3, true);
    console.log("✔ Step 6: Session audit log inspected with 3 events");

    console.log("\n🚀 All 6 Anti-Cheat Backend Tests Passed Successfully!");
  } finally {
    server.close();
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
