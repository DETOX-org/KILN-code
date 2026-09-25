/**
 * DETOX Code — Tactical Battleground & Proctored Workspace Engine
 * Integrated Frontend-Backend-Compiler System
 * Strict Zero Border-Radius // High-Contrast Ember Orange // Technical HUD
 */

const API_BASE = window.location.port === "3000" ? `${window.location.origin}/api` : "http://127.0.0.1:3000/api";
const CHALLENGE_ID = "c0000000-0000-0000-0000-000000000014";
let currentProblemSlug = "two-sum";
let USER_ID = `CODER_${Math.floor(1000 + Math.random() * 9000)}`;

// State
let isContestActive = false;
let strikes = 0;
const MAX_STRIKES = 3;
let autoSaveTimer = null;
let internalCopyHistory = [];
let lastKeyTime = Date.now();
let lastTextLength = 0;
let isInternalPasteInProgress = false;
let contestTimeRemaining = 45 * 60;
let timerInterval = null;

// DOM Views
const lobbyView = document.getElementById("lobbyView");
const workspaceView = document.getElementById("workspaceView");

// DOM Header Elements
const hudMatchCenter = document.getElementById("hudMatchCenter");
const hudStrikesPanel = document.getElementById("hudStrikesPanel");
const hudAutosavePanel = document.getElementById("hudAutosavePanel");
const hudMatchActions = document.getElementById("hudMatchActions");
const hudLobbyLinks = document.getElementById("hudLobbyLinks");
const hudTimer = document.getElementById("hudTimer");
const autosaveStatus = document.getElementById("autosaveStatus");
const autosaveLed = document.querySelector(".autosave-led");

// Strike Pips
const strikePips = [
  document.getElementById("pip1"),
  document.getElementById("pip2"),
  document.getElementById("pip3")
];

// Editor Elements
const codeEditor = document.getElementById("codeEditor");
const editorGutter = document.getElementById("editorGutter");
const cursorMeta = document.getElementById("cursorMeta");
const languageSelect = document.getElementById("languageSelect");

// Modals
const entryModal = document.getElementById("entryModal");
const exitModal = document.getElementById("exitModal");
const strikeModal = document.getElementById("strikeModal");
const terminatedModal = document.getElementById("terminatedModal");
const leaderboardModal = document.getElementById("leaderboardModal");
const protocolModal = document.getElementById("protocolModal");

const strikeAlertMeter = document.getElementById("strikeAlertMeter");
const terminatedDetails = document.getElementById("terminatedDetails");
const toastContainer = document.getElementById("toastContainer");

/* ================== PROBLEM DOSSIER DEFINITIONS ================== */
const PROBLEM_DOSSIERS = {
  "two-sum": {
    slug: "two-sum",
    title: "1. Two Sum",
    difficulty: "EASY",
    points: "100 PTS",
    cpu: "2000MS CPU",
    ram: "256MB RAM",
    contentHtml: `
      <div class="content-block">
        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 01</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>nums = [2,7,11,15], target = 9</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>[0,1]</code>
        </div>
        <div class="case-row">
          <span class="case-key">EXPLANATION:</span>
          <span>Because nums[0] + nums[1] == 9, we return [0, 1].</span>
        </div>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 02</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>nums = [3,2,4], target = 6</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>[1,2]</code>
        </div>
      </div>

      <div class="constraints-block">
        <div class="constraints-title">OPERATIONAL CONSTRAINTS</div>
        <ul class="constraints-list">
          <li><code>2 &le; nums.length &le; 10<sup>4</sup></code></li>
          <li><code>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></code></li>
          <li><code>-10<sup>9</sup> &le; target &le; 10<sup>9</sup></code></li>
          <li>Only one valid answer exists.</li>
        </ul>
      </div>

      <div class="proctor-alert-box">
        <div class="alert-title">🔒 PROCTORED ARENA RULES ACTIVE</div>
        <p>
          Fullscreen mode locked. Tab switches, window blurring, and external copy-pastes are prohibited. Pasting from external applications will be purged instantly and increment your violation strikes.
        </p>
      </div>
    `,
    samples: [
      { id: "1", in: "4\n2 7 11 15\n9", out: "0 1" },
      { id: "2", in: "3\n3 2 4\n6", out: "1 2" }
    ]
  },
  "reverse-string": {
    slug: "reverse-string",
    title: "2. Reverse String",
    difficulty: "EASY",
    points: "100 PTS",
    cpu: "1000MS CPU",
    ram: "256MB RAM",
    contentHtml: `
      <div class="content-block">
        <p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
        <p>You must do this by modifying the input array <strong>in-place</strong> with $O(1)$ extra memory.</p>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 01</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>s = ["h","e","l","l","o"]</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>["o","l","l","e","h"]</code>
        </div>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 02</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>s = ["H","a","n","n","a","h"]</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>["h","a","n","n","a","H"]</code>
        </div>
      </div>

      <div class="constraints-block">
        <div class="constraints-title">OPERATIONAL CONSTRAINTS</div>
        <ul class="constraints-list">
          <li><code>1 &le; s.length &le; 10<sup>5</sup></code></li>
          <li><code>s[i]</code> is a printable ASCII character.</li>
        </ul>
      </div>

      <div class="proctor-alert-box">
        <div class="alert-title">🔒 PROCTORED ARENA RULES ACTIVE</div>
        <p>
          Fullscreen mode locked. Tab switches, window blurring, and external copy-pastes are prohibited.
        </p>
      </div>
    `,
    samples: [
      { id: "1", in: "hello", out: "olleh" },
      { id: "2", in: "Hannah", out: "hannaH" }
    ]
  },
  "palindrome-number": {
    slug: "palindrome-number",
    title: "3. Palindrome Number",
    difficulty: "EASY",
    points: "100 PTS",
    cpu: "1000MS CPU",
    ram: "256MB RAM",
    contentHtml: `
      <div class="content-block">
        <p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>
        <p>An integer is a palindrome when it reads the same backward as forward. For example, <code>121</code> is a palindrome while <code>123</code> is not.</p>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 01</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>x = 121</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>true</code>
        </div>
      </div>

      <div class="tactical-case-block">
        <div class="case-header">EXAMPLE CASE 02</div>
        <div class="case-row">
          <span class="case-key">INPUT:</span>
          <code>x = -121</code>
        </div>
        <div class="case-row">
          <span class="case-key">OUTPUT:</span>
          <code>false</code>
        </div>
      </div>

      <div class="constraints-block">
        <div class="constraints-title">OPERATIONAL CONSTRAINTS</div>
        <ul class="constraints-list">
          <li><code>-2<sup>31</sup> &le; x &le; 2<sup>31</sup> - 1</code></li>
        </ul>
      </div>

      <div class="proctor-alert-box">
        <div class="alert-title">🔒 PROCTORED ARENA RULES ACTIVE</div>
        <p>
          Solve under countdown timer. Solutions compile inside isolated sandbox enclaves.
        </p>
      </div>
    `,
    samples: [
      { id: "1", in: "121", out: "true" },
      { id: "2", in: "-121", out: "false" }
    ]
  }
};

/* ================== MULTI-PROBLEM STARTER TEMPLATES ================== */
const STARTER_TEMPLATES = {
  "two-sum": {
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []
`,
    cpp: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
};
`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                free(nums);
                return 0;
            }
        }
    }
    free(nums);
    return 0;
}
`
  },
  "reverse-string": {
    python: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        # In-place two-pointer reversal
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
`,
    cpp: `#include <vector>

class Solution {
public:
    void reverseString(std::vector<char>& s) {
        int left = 0, right = (int)s.size() - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }
};
`,
    javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        const temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        left++;
        right--;
    }
};
`,
    typescript: `function reverseString(s: string[]): void {
    let left = 0, right = s.length - 1;
    while (left < right) {
        const temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        left++;
        right--;
    }
}
`,
    c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%s", s) == 1) {
        int len = strlen(s);
        for (int i = 0, j = len - 1; i < j; i++, j--) {
            char t = s[i]; s[i] = s[j]; s[j] = t;
        }
        printf("%s\\n", s);
    }
    return 0;
}
`
  },
  "palindrome-number": {
    python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False
        s = str(x)
        return s == s[::-1]
`,
    cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        long long rev = 0, temp = x;
        while (temp > 0) {
            rev = rev * 10 + (temp % 10);
            temp /= 10;
        }
        return rev == x;
    }
};
`,
    javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    if (x < 0) return false;
    const s = String(x);
    return s === s.split('').reverse().join('');
};
`,
    typescript: `function isPalindrome(x: number): boolean {
    if (x < 0) return false;
    const s = String(x);
    return s === s.split('').reverse().join('');
}
`,
    c: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        if (x < 0) { printf("false\\n"); return 0; }
        long long rev = 0, t = x;
        while (t > 0) { rev = rev * 10 + (t % 10); t /= 10; }
        printf("%s\\n", rev == x ? "true" : "false");
    }
    return 0;
}
`
  }
};

/* ================== SHARP TOAST NOTIFICATIONS ================== */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

/* ================== MATRIX TACTICAL CANVAS GRAPHIC ================== */
function initMatrixCanvas() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Grid node points
  const nodes = [];
  const numNodes = 28;
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1
    });
  }

  function render() {
    ctx.fillStyle = "rgba(7, 8, 11, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 77, 0, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.strokeStyle = `rgba(255, 77, 0, ${0.35 * (1 - dist / 90)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (const node of nodes) {
      ctx.fillStyle = "#ff4d00";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
    }

    requestAnimationFrame(render);
  }
  render();
}

/* ================== GUTTER NUMBERS & CURSOR TRACKING ================== */
function updateGutters() {
  const lineCount = codeEditor.value.split("\n").length;
  let text = "";
  for (let i = 1; i <= lineCount; i++) {
    text += i + "\n";
  }
  editorGutter.innerText = text;
}

function updateCursorLocation() {
  const pos = codeEditor.selectionStart;
  const lines = codeEditor.value.substring(0, pos).split("\n");
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  cursorMeta.innerText = `LN ${line}, COL ${col}`;
}

/* ================== 10-SECOND IDLE AUTO-SAVE ENGINE ================== */
function handleEditorTyping() {
  updateGutters();
  updateCursorLocation();

  const now = Date.now();
  const currentLen = codeEditor.value.length;
  const deltaLen = currentLen - lastTextLength;
  const deltaTime = now - lastKeyTime;

  // Bot Cadence / Virtual Keystroke Injection Detection
  if (deltaLen > 40 && deltaTime < 60 && !isInternalPasteInProgress) {
    showToast("⚠️ Virtual keystroke injection flagged! Input purged.", "danger");
    logTelemetryEvent("BURST_TYPING_FLAGGED", { deltaLen, deltaTime });
  }

  lastKeyTime = now;
  lastTextLength = currentLen;

  autosaveLed.classList.add("saving");
  autosaveStatus.innerText = "TYPING...";

  if (autoSaveTimer) clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(() => {
    executeIdleSnapshot();
  }, 10000);
}

async function executeIdleSnapshot() {
  const code = codeEditor.value;
  const language = languageSelect.value;
  const nowIso = new Date().toISOString();

  // 1. Local Cache in LocalStorage
  const cacheKey = `kiln_snapshot_${CHALLENGE_ID}_${currentProblemSlug}`;
  const historyKey = `kiln_versions_${CHALLENGE_ID}_${currentProblemSlug}`;

  try {
    localStorage.setItem(cacheKey, code);
    const versions = JSON.parse(localStorage.getItem(historyKey) || "[]");
    versions.push({ timestamp: nowIso, length: code.length });
    localStorage.setItem(historyKey, JSON.stringify(versions.slice(-20)));

    document.getElementById("tabSnapshots").innerText = `10S SNAPSHOTS (${versions.length})`;
    renderSnapshotsList(versions);
  } catch (err) {}

  // 2. Sync to Backend Telemetry API
  try {
    const res = await fetch(`${API_BASE}/challenges/${CHALLENGE_ID}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        problemId: currentProblemSlug,
        code,
        language
      })
    });
    const data = await res.json();
    if (data.success) {
      autosaveLed.classList.remove("saving");
      autosaveStatus.innerText = "IDLE (SAVED)";
      showToast("💾 10-second idle snapshot synced to server", "info");
    }
  } catch (err) {
    autosaveLed.classList.remove("saving");
    autosaveStatus.innerText = "SAVED (LOCAL)";
  }
}

function renderSnapshotsList(versions) {
  const container = document.getElementById("snapshotList");
  if (!versions || versions.length === 0) {
    container.innerHTML = `<div class="snapshot-row">No snapshots created yet. Pause typing for 10s.</div>`;
    return;
  }
  container.innerHTML = versions.slice().reverse().map((v, idx) => `
    <div class="snapshot-row">
      <span>[VER ${versions.length - idx}]</span>
      <span>${new Date(v.timestamp).toLocaleTimeString()}</span>
      <span>${v.length} characters</span>
    </div>
  `).join("");
}

/* ================== BACKWARD CLIPBOARD INTEGRITY ================== */
codeEditor.addEventListener("copy", () => {
  const selection = codeEditor.value.substring(codeEditor.selectionStart, codeEditor.selectionEnd);
  if (selection && selection.trim().length > 0) {
    internalCopyHistory.push(selection);
    if (internalCopyHistory.length > 50) internalCopyHistory.shift();
  }
});

codeEditor.addEventListener("cut", () => {
  const selection = codeEditor.value.substring(codeEditor.selectionStart, codeEditor.selectionEnd);
  if (selection && selection.trim().length > 0) {
    internalCopyHistory.push(selection);
  }
});

codeEditor.addEventListener("paste", (e) => {
  if (!isContestActive) return;

  const pastedText = (e.clipboardData || window.clipboardData).getData("text");
  if (!pastedText) return;

  const isInternalSnippet = internalCopyHistory.some((item) => item.trim() === pastedText.trim());
  const isBackwardsMatch = codeEditor.value.includes(pastedText);
  const isAuthorized = isInternalSnippet || isBackwardsMatch;

  if (!isAuthorized) {
    e.preventDefault();
    showToast("⛔ EXTERNAL PASTE BLOCKED! Only internal workspace copies are permitted.", "danger");
    logTelemetryEvent("EXTERNAL_PASTE_BLOCKED", {
      rejectedLen: pastedText.length,
      samplePrefix: pastedText.substring(0, 15)
    });
  } else {
    isInternalPasteInProgress = true;
    setTimeout(() => {
      isInternalPasteInProgress = false;
      showToast("✔ Internal code snippet pasted", "success");
    }, 40);
  }
});

/* ================== TELEMETRY & 3-STRIKE PROTOCOL ================== */
async function logTelemetryEvent(eventType, details = {}) {
  if (!isContestActive) return;

  try {
    const res = await fetch(`${API_BASE}/challenges/${CHALLENGE_ID}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        eventType,
        details: { ...details, clientTime: new Date().toISOString() }
      })
    });

    const data = await res.json();
    if (data.success) {
      applyStrikes(data.data.strikes, data.data.sessionStatus, data.data.terminationReason);
    }
  } catch (err) {
    console.error("Telemetry request error:", err);
  }
}

function applyStrikes(currentStrikes, sessionStatus, reason) {
  strikes = currentStrikes;

  strikePips.forEach((pip, idx) => {
    if (idx < strikes) {
      pip.classList.add("active");
    } else {
      pip.classList.remove("active");
    }
  });

  if (sessionStatus === "STRIKE_WARNING") {
    strikeAlertMeter.innerText = `WARNING STRIKE ${strikes} OF ${MAX_STRIKES}`;
    strikeModal.classList.add("active");
    showToast(`⚠️ STRIKE REGISTERED (${strikes}/${MAX_STRIKES})`, "danger");
  } else if (sessionStatus === "TERMINATED") {
    triggerTermination(reason || "Maximum allowed anti-cheat strikes exceeded (3/3).");
  }
}

function triggerTermination(reason) {
  isContestActive = false;
  if (timerInterval) clearInterval(timerInterval);

  strikeModal.classList.remove("active");
  exitModal.classList.remove("active");

  codeEditor.readOnly = true;
  codeEditor.style.opacity = "0.4";

  terminatedDetails.innerText = `CODER CALLSIGN: ${USER_ID}\nCHALLENGE ID: ${CHALLENGE_ID}\nTERMINATION TIMESTAMP: ${new Date().toISOString()}\nOFFICIAL REASON: ${reason}`;
  terminatedModal.classList.add("active");
}

/* ================== DUAL-MONITOR & BLUR INTERCEPT ================== */
window.addEventListener("blur", () => {
  if (!isContestActive) return;
  logTelemetryEvent("WINDOW_BLUR", { reason: "Focus lost to another application or secondary display" });
});

document.addEventListener("visibilitychange", () => {
  if (!isContestActive) return;
  if (document.hidden) {
    logTelemetryEvent("TAB_SWITCH", { reason: "User switched browser tab or minimized window" });
  }
});

/* ================== KEYBOARD SHORTCUTS & GUARD ================== */
window.addEventListener("keydown", (e) => {
  // Suppress DevTools Shortcuts
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
    (e.ctrlKey && e.key === "u")
  ) {
    e.preventDefault();
    showToast("⚠️ Developer inspection tools are restricted during arena matches", "danger");
    logTelemetryEvent("DEVTOOLS_OPEN_ATTEMPT");
    return;
  }

  // Ctrl+Enter or Cmd+Enter to Run Tests
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    if (isContestActive) {
      document.getElementById("btnRunTests").click();
    }
  }

  // Ctrl+S to Force Autosave
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    if (isContestActive) {
      executeIdleSnapshot();
    }
  }

  // Escape Key Intercept
  if (e.key === "Escape") {
    e.preventDefault();
    if (isContestActive) {
      logTelemetryEvent("ESCAPE_KEY_PRESSED");
      exitModal.classList.add("active");
    }
  }
});

window.addEventListener("contextmenu", (e) => {
  if (isContestActive) {
    e.preventDefault();
    showToast("⚠️ Context menu disabled in proctored arena", "info");
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isContestActive) {
    logTelemetryEvent("FULLSCREEN_EXIT", { reason: "User exited fullscreen mode" });
    exitModal.classList.add("active");
  }
});

/* ================== NAVIGATION & ARENA ENTRY ================== */
function launchArenaLobby() {
  lobbyView.style.display = "flex";
  workspaceView.style.display = "none";
  hudMatchCenter.style.display = "none";
  hudStrikesPanel.style.display = "none";
  hudAutosavePanel.style.display = "none";
  hudMatchActions.style.display = "none";
  hudLobbyLinks.style.display = "flex";
}

function launchWorkspace() {
  lobbyView.style.display = "none";
  workspaceView.style.display = "flex";
  hudMatchCenter.style.display = "flex";
  hudStrikesPanel.style.display = "flex";
  hudAutosavePanel.style.display = "flex";
  hudMatchActions.style.display = "flex";
  hudLobbyLinks.style.display = "none";
}

// Button: Enter Arena from Hero
document.getElementById("btnEnterArena").addEventListener("click", () => {
  const callsignInput = document.getElementById("coderCallsign");
  if (callsignInput.value.trim().length > 0) {
    USER_ID = callsignInput.value.trim().toUpperCase();
  }
  entryModal.classList.add("active");
});

document.getElementById("btnGrantAccess").addEventListener("click", async () => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {}

  entryModal.classList.remove("active");
  launchWorkspace();
  isContestActive = true;
  logTelemetryEvent("FULLSCREEN_ENTER");
  showToast(`⚔️ WELCOME TO THE ARENA, ${USER_ID}. MATCH TIMER STARTED.`, "info");
  startMatchClock();
});

document.getElementById("btnAcknowledgeStrike").addEventListener("click", async () => {
  strikeModal.classList.remove("active");
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {}
});

document.getElementById("btnCancelExit").addEventListener("click", async () => {
  exitModal.classList.remove("active");
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {}
});

document.getElementById("btnConfirmSubmitAndExit").addEventListener("click", async () => {
  await handleExitAction("SUBMIT_AND_EXIT", "User submitted code and exited via Escape modal");
});

document.getElementById("btnConfirmAbandon").addEventListener("click", async () => {
  await handleExitAction("ABANDON_AND_TERMINATE", "User abandoned match via Escape modal");
});

document.getElementById("btnExitMatch").addEventListener("click", () => {
  exitModal.classList.add("active");
});

document.getElementById("btnFullscreenToggle").addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen().catch(() => {});
  } else {
    exitModal.classList.add("active");
  }
});

/* ================== LEADERBOARD MODAL ================== */
async function loadLiveLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">FETCHING LIVE STANDINGS...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/contests/${CHALLENGE_ID}/standings`);
    const data = await res.json();
    const standings = data.standings || [];

    if (standings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">NO STANDINGS REGISTERED YET</td></tr>`;
      return;
    }

    tbody.innerHTML = standings.map((item, idx) => {
      const isGold = idx === 0;
      const isSilver = idx === 1;
      const isBronze = idx === 2;
      const rankClass = isGold ? "rank-gold" : isSilver ? "rank-silver" : isBronze ? "rank-bronze" : "";
      const isCurrentPlayer = item.username === USER_ID || item.user_id === USER_ID;
      const highlightStyle = isCurrentPlayer ? "background: rgba(255, 77, 0, 0.15); font-weight: 700;" : "";

      return `
        <tr class="${rankClass}" style="${highlightStyle}">
          <td>#${String(item.rank).padStart(2, "0")}</td>
          <td class="coder-name">${item.display_name || item.username} ${isCurrentPlayer ? "(YOU)" : ""}</td>
          <td>${item.total_score >= 100 ? "1 / 1" : "0 / 1"}</td>
          <td class="score-val">${item.total_score}</td>
          <td>${item.penalty}m 00s</td>
          <td>
            <span class="sharp-tag ${item.is_verified ? "tag-easy" : "tag-pts"}">
              ${item.is_verified ? "ACCEPTED ✓" : "SUBMITTED"}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--red-fatal);">FAILED TO LOAD LEADERBOARD FROM SERVER</td></tr>`;
  }
}

document.getElementById("btnViewRanks").addEventListener("click", () => {
  loadLiveLeaderboard();
  leaderboardModal.classList.add("active");
});
document.getElementById("navLeaderboardBtn").addEventListener("click", () => {
  loadLiveLeaderboard();
  leaderboardModal.classList.add("active");
});
document.getElementById("btnCloseLeaderboard").addEventListener("click", () => {
  leaderboardModal.classList.remove("active");
});

document.getElementById("navProtocolBtn").addEventListener("click", () => {
  protocolModal.classList.add("active");
});
document.getElementById("btnCloseProtocol").addEventListener("click", () => {
  protocolModal.classList.remove("active");
});

document.getElementById("brandHomeBtn").addEventListener("click", () => {
  if (isContestActive) exitModal.classList.add("active");
  else launchArenaLobby();
});
document.getElementById("navLobbyBtn").addEventListener("click", () => {
  launchArenaLobby();
});

async function handleExitAction(action, reason) {
  try {
    await fetch(`${API_BASE}/challenges/${CHALLENGE_ID}/terminate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        reason,
        action,
        code: codeEditor.value,
        language: languageSelect.value
      })
    });
  } catch (err) {}
  triggerTermination(reason);
}

/* ================== MATCH COUNTDOWN CLOCK ================== */
function startMatchClock() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isContestActive) {
      clearInterval(timerInterval);
      return;
    }

    if (contestTimeRemaining <= 0) {
      clearInterval(timerInterval);
      hudTimer.innerText = "00:00";
      handleExitAction("SUBMIT_AND_EXIT", "Match timer elapsed (45:00)");
      return;
    }

    contestTimeRemaining--;
    const mins = Math.floor(contestTimeRemaining / 60).toString().padStart(2, "0");
    const secs = (contestTimeRemaining % 60).toString().padStart(2, "0");
    hudTimer.innerText = `${mins}:${secs}`;

    if (contestTimeRemaining < 300) {
      hudTimer.style.color = "#ef4444";
    }
  }, 1000);
}

/* ================== DYNAMIC PROBLEM SWITCHER ================== */
function switchProblem(slug) {
  const dossier = PROBLEM_DOSSIERS[slug];
  if (!dossier) return;

  currentProblemSlug = slug;

  // Update Breadcrumb & Header
  document.getElementById("breadcrumbId").innerText = slug.toUpperCase();
  document.getElementById("problemTitle").innerText = dossier.title;
  document.getElementById("probDifficulty").innerText = dossier.difficulty;
  document.getElementById("probPoints").innerText = dossier.points;
  document.getElementById("probCpu").innerText = dossier.cpu;
  document.getElementById("probRam").innerText = dossier.ram;

  // Update Statement Content
  document.getElementById("problemContent").innerHTML = dossier.contentHtml;

  // Update Active Switcher Button
  document.querySelectorAll(".prob-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-slug") === slug);
  });

  // Update Sample Test Cases in Console
  renderTestCasePills(dossier.samples);

  // Restore cached code or load template
  const cachedCode = localStorage.getItem(`kiln_snapshot_${CHALLENGE_ID}_${slug}`);
  const currentLang = languageSelect.value;
  if (cachedCode && cachedCode.trim().length > 0) {
    codeEditor.value = cachedCode;
  } else if (STARTER_TEMPLATES[slug] && STARTER_TEMPLATES[slug][currentLang]) {
    codeEditor.value = STARTER_TEMPLATES[slug][currentLang];
  } else if (STARTER_TEMPLATES["two-sum"][currentLang]) {
    codeEditor.value = STARTER_TEMPLATES["two-sum"][currentLang];
  }

  updateGutters();
  updateCursorLocation();
  showToast(`Switched problem dossier to: ${dossier.title}`, "info");
}

function renderTestCasePills(samples) {
  const pillsContainer = document.getElementById("tcPillsContainer");
  if (!pillsContainer || !samples || samples.length === 0) return;

  pillsContainer.innerHTML = samples.map((sample, idx) => `
    <button class="tc-pill ${idx === 0 ? "active" : ""}" data-tc="${idx + 1}">CASE 0${idx + 1}</button>
  `).join("");

  document.getElementById("sampleInput").innerText = samples[0].in;
  document.getElementById("sampleOutput").innerText = samples[0].out;

  pillsContainer.querySelectorAll(".tc-pill").forEach((pill, idx) => {
    pill.addEventListener("click", () => {
      pillsContainer.querySelectorAll(".tc-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      document.getElementById("sampleInput").innerText = samples[idx].in;
      document.getElementById("sampleOutput").innerText = samples[idx].out;
    });
  });
}

/* ================== TERMINAL CONSOLE TABS & RUNNER ================== */
function initConsoleTabs() {
  const tabTests = document.getElementById("tabTests");
  const tabOutput = document.getElementById("tabOutput");
  const tabSnapshots = document.getElementById("tabSnapshots");

  const secTests = document.getElementById("sectionTests");
  const secOutput = document.getElementById("sectionOutput");
  const secSnapshots = document.getElementById("sectionSnapshots");

  tabTests.addEventListener("click", () => {
    tabTests.classList.add("active");
    tabOutput.classList.remove("active");
    tabSnapshots.classList.remove("active");
    secTests.style.display = "block";
    secOutput.style.display = "none";
    secSnapshots.style.display = "none";
  });

  tabOutput.addEventListener("click", () => {
    tabOutput.classList.add("active");
    tabTests.classList.remove("active");
    tabSnapshots.classList.remove("active");
    secOutput.style.display = "block";
    secTests.style.display = "none";
    secSnapshots.style.display = "none";
  });

  tabSnapshots.addEventListener("click", () => {
    tabSnapshots.classList.add("active");
    tabTests.classList.remove("active");
    tabOutput.classList.remove("active");
    secSnapshots.style.display = "block";
    secTests.style.display = "none";
    secOutput.style.display = "none";
  });

  // Problem Switcher Bar Click Handlers
  document.querySelectorAll(".prob-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-slug");
      switchProblem(slug);
    });
  });

  // Run Tests Button (Real Backend Compiler Service Evaluation)
  document.getElementById("btnRunTests").addEventListener("click", async () => {
    tabOutput.click();
    const verdictTag = document.getElementById("verdictTag");
    const verdictTime = document.getElementById("verdictTime");
    const consoleLog = document.getElementById("consoleLog");
    const testResultsList = document.getElementById("testResultsList");

    verdictTag.className = "verdict-tag";
    verdictTag.innerText = "COMPILING...";
    verdictTime.innerText = `Dispatching ${languageSelect.value.toUpperCase()} to Native KILN Sandbox...`;
    testResultsList.style.display = "none";
    testResultsList.innerHTML = "";
    consoleLog.innerText = `[KILN ENGINE] Ingesting source code for ${currentProblemSlug.toUpperCase()}...\n[SANDBOX] Initializing isolated process enclaves...\nEvaluating public sample test cases...`;

    try {
      const res = await fetch(`${API_BASE}/submissions/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: currentProblemSlug,
          language: languageSelect.value,
          source_code: codeEditor.value
        })
      });

      const responseData = await res.json();
      if (!responseData.success) {
        throw new Error(responseData.error || "Evaluation failed on judge server.");
      }

      const evalData = responseData.data;

      // Update Verdict Banner
      verdictTag.innerText = evalData.status.toUpperCase();
      if (evalData.status === "Accepted") {
        verdictTag.className = "verdict-tag accepted";
        showToast(`✔ SAMPLE TESTS PASSED (${evalData.runtimeMs}ms)`, "success");
      } else {
        verdictTag.className = "verdict-tag";
        verdictTag.style.background = "#ef4444";
        verdictTag.style.color = "#fff";
        showToast(`❌ ${evalData.status.toUpperCase()}`, "danger");
      }

      verdictTime.innerText = `Runtime: ${evalData.runtimeMs}ms | Peak Memory: ${(evalData.memoryKb / 1024).toFixed(1)}MB | Passed: ${evalData.passedTests}/${evalData.totalTests}`;

      // Render Individual Test Result Cards
      if (evalData.results && evalData.results.length > 0) {
        testResultsList.style.display = "flex";
        testResultsList.innerHTML = evalData.results.map((r, i) => `
          <div class="tc-result-card ${r.passed ? "passed" : "failed"}">
            <div class="tc-card-header">
              <span>TEST CASE #${i + 1} (${r.isSample ? "SAMPLE" : "BENCHMARK"})</span>
              <span class="${r.passed ? "tc-badge-pass" : "tc-badge-fail"}">
                ${r.passed ? "ACCEPTED ✓" : r.status.toUpperCase()} (${r.runtimeMs}ms)
              </span>
            </div>
            <div class="tc-card-body">
              <div>
                <div class="tc-io-label">EXPECTED:</div>
                <code>${r.expectedOutput || "None"}</code>
              </div>
              <div>
                <div class="tc-io-label">ACTUAL OUTPUT:</div>
                <code>${r.actualOutput || r.error || "None"}</code>
              </div>
            </div>
          </div>
        `).join("");
      }

      // Display Logs
      consoleLog.innerText = (evalData.logs || []).join("\n");

    } catch (err) {
      verdictTag.className = "verdict-tag";
      verdictTag.style.background = "#ef4444";
      verdictTag.innerText = "JUDGE ERROR";
      verdictTime.innerText = err.message;
      consoleLog.innerText = `[ERROR] Failed to communicate with KILN compiler engine:\n${err.message}`;
      showToast("❌ Compiler communication error", "danger");
    }
  });

  // Submit Solution Button (Real Official Submission & Leaderboard Ranking)
  document.getElementById("btnSubmit").addEventListener("click", async () => {
    tabOutput.click();
    const verdictTag = document.getElementById("verdictTag");
    const verdictTime = document.getElementById("verdictTime");
    const consoleLog = document.getElementById("consoleLog");
    const testResultsList = document.getElementById("testResultsList");

    verdictTag.className = "verdict-tag";
    verdictTag.innerText = "EVALUATING...";
    verdictTime.innerText = "Dispatching official submission against all public & hidden benchmark cases...";
    testResultsList.style.display = "none";
    testResultsList.innerHTML = "";
    consoleLog.innerText = `[SUBMISSION] Dispatched for ${USER_ID} on ${currentProblemSlug.toUpperCase()}...\n[ENGINE] Evaluating against full test suite...`;

    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: currentProblemSlug,
          language: languageSelect.value,
          source_code: codeEditor.value,
          username: USER_ID,
          user_id: USER_ID,
          contest_id: CHALLENGE_ID
        })
      });

      const subData = await res.json();
      if (!subData.success && subData.error) {
        throw new Error(subData.error);
      }

      const evalData = subData.evaluation;

      verdictTag.innerText = `${subData.status.toUpperCase()} // ${subData.score} PTS`;
      if (subData.status === "accepted") {
        verdictTag.className = "verdict-tag accepted";
        showToast(`🎉 VERDICT: ACCEPTED (+${subData.score} PTS)`, "success");
      } else {
        verdictTag.className = "verdict-tag";
        verdictTag.style.background = "#ef4444";
        verdictTag.style.color = "#fff";
        showToast(`❌ VERDICT: ${subData.status.toUpperCase()}`, "danger");
      }

      verdictTime.innerText = `Submission ID: ${subData.id} | Execution: ${subData.runtime_ms}ms | Score: ${subData.score} Pts`;

      // Render Test Cards
      if (evalData && evalData.results && evalData.results.length > 0) {
        testResultsList.style.display = "flex";
        testResultsList.innerHTML = evalData.results.map((r, i) => `
          <div class="tc-result-card ${r.passed ? "passed" : "failed"}">
            <div class="tc-card-header">
              <span>TEST CASE #${i + 1} (${r.isSample ? "SAMPLE" : "HIDDEN BENCHMARK"})</span>
              <span class="${r.passed ? "tc-badge-pass" : "tc-badge-fail"}">
                ${r.passed ? "ACCEPTED ✓" : r.status.toUpperCase()} (${r.runtimeMs}ms)
              </span>
            </div>
            <div class="tc-card-body">
              <div>
                <div class="tc-io-label">EXPECTED:</div>
                <code>${r.expectedOutput || "Hidden"}</code>
              </div>
              <div>
                <div class="tc-io-label">ACTUAL:</div>
                <code>${r.actualOutput || r.error || "None"}</code>
              </div>
            </div>
          </div>
        `).join("");
      }

      consoleLog.innerText = (evalData?.logs || []).join("\n");

    } catch (err) {
      verdictTag.className = "verdict-tag";
      verdictTag.style.background = "#ef4444";
      verdictTag.innerText = "ERROR";
      verdictTime.innerText = err.message;
      consoleLog.innerText = `[ERROR] Submission evaluation failed:\n${err.message}`;
      showToast("❌ Submission evaluation failed", "danger");
    }
  });
}

/* ================== WORKSPACE INITIALIZATION ================== */
function setupWorkspace() {
  const cachedCode = localStorage.getItem(`kiln_snapshot_${CHALLENGE_ID}_${currentProblemSlug}`);
  if (cachedCode && cachedCode.trim().length > 0) {
    codeEditor.value = cachedCode;
    showToast("Restored from 10-second idle snapshot recovery cache", "info");
  } else {
    codeEditor.value = STARTER_TEMPLATES["two-sum"].python;
  }

  updateGutters();
  updateCursorLocation();
  lastTextLength = codeEditor.value.length;

  codeEditor.addEventListener("input", handleEditorTyping);
  codeEditor.addEventListener("keyup", updateCursorLocation);
  codeEditor.addEventListener("click", updateCursorLocation);

  // Tab key indents 4 spaces
  codeEditor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = codeEditor.selectionStart;
      const end = codeEditor.selectionEnd;
      codeEditor.value = codeEditor.value.substring(0, start) + "    " + codeEditor.value.substring(end);
      codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
      handleEditorTyping();
    }
  });

  // Language selector
  languageSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    const problemTemplates = STARTER_TEMPLATES[currentProblemSlug] || STARTER_TEMPLATES["two-sum"];
    if (problemTemplates && problemTemplates[lang]) {
      codeEditor.value = problemTemplates[lang];
      updateGutters();
    }
  });

  initConsoleTabs();
  initMatrixCanvas();
  renderTestCasePills(PROBLEM_DOSSIERS["two-sum"].samples);
}

document.addEventListener("DOMContentLoaded", setupWorkspace);
