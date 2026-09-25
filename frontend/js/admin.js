/**
 * DETOX Code — Admin Command Portal & Challenge Configurator
 * Tactical HUD // Zero Border-Radius // Single-Write Session Deployment
 */

const API_BASE = window.location.port === "3000" ? `${window.location.origin}/api` : "http://127.0.0.1:3000/api";

// DOM Elements
const createSessionForm = document.getElementById("createSessionForm");
const btnAddTestCase = document.getElementById("btnAddTestCase");
const testCasesContainer = document.getElementById("testCasesContainer");
const sessionGeneratedBadge = document.getElementById("sessionGeneratedBadge");
const generatedSessionIdEl = document.getElementById("generatedSessionId");
const btnCopySessionCode = document.getElementById("btnCopySessionCode");
const btnCopyDirectLink = document.getElementById("btnCopyDirectLink");
const adminSessionsTableBody = document.getElementById("adminSessionsTableBody");
const toastContainer = document.getElementById("toastContainer");

// Firebase config elements
const fbProjectId = document.getElementById("fbProjectId");
const fbApiKey = document.getElementById("fbApiKey");
const btnSaveFirebaseConfig = document.getElementById("btnSaveFirebaseConfig");
const firebaseStatusTag = document.getElementById("firebaseStatusTag");

// Audit Modal Elements
const auditModal = document.getElementById("auditModal");
const auditModalTitle = document.getElementById("auditModalTitle");
const auditModalContent = document.getElementById("auditModalContent");
const btnCloseAuditModal = document.getElementById("btnCloseAuditModal");

let currentGeneratedSessionId = null;

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

/* ================== TEST CASE BUILDER ================== */
let testCaseCounter = 2; // Default has 2

function createTestCaseRow(number, isSample = false, defaultInput = "", defaultOutput = "") {
  const row = document.createElement("div");
  row.className = "test-case-row";
  row.innerHTML = `
    <div class="test-case-header">
      <span>TEST CASE ${String(number).padStart(2, "0")} (${isSample ? "PUBLIC SAMPLE" : "HIDDEN BENCHMARK"})</span>
      <div style="display: flex; gap: 12px; align-items: center;">
        <label style="cursor: pointer; font-size: 0.75rem; color: var(--text-main);">
          <input type="checkbox" class="tc-is-sample" ${isSample ? "checked" : ""}> IS SAMPLE
        </label>
        <button type="button" class="btn btn-sharp btn-danger tc-delete-btn" style="padding: 2px 8px; font-size: 0.7rem;">DELETE</button>
      </div>
    </div>
    <div class="form-row">
      <div>
        <span class="tc-io-label" style="font-size: 0.7rem; color: var(--text-dim); display: block; margin-bottom: 4px;">INPUT (STDIN):</span>
        <textarea class="form-textarea tc-input" style="height: 60px;" placeholder="Standard input...">${defaultInput}</textarea>
      </div>
      <div>
        <span class="tc-io-label" style="font-size: 0.7rem; color: var(--text-dim); display: block; margin-bottom: 4px;">EXPECTED OUTPUT (STDOUT):</span>
        <textarea class="form-textarea tc-output" style="height: 60px;" placeholder="Expected standard output...">${defaultOutput}</textarea>
      </div>
    </div>
  `;

  // Attach delete listener
  row.querySelector(".tc-delete-btn").addEventListener("click", () => {
    if (testCasesContainer.querySelectorAll(".test-case-row").length <= 1) {
      showToast("Challenge must retain at least 1 test case.", "danger");
      return;
    }
    row.remove();
    renumberTestCases();
  });

  return row;
}

function renumberTestCases() {
  const rows = testCasesContainer.querySelectorAll(".test-case-row");
  rows.forEach((r, idx) => {
    const isSample = r.querySelector(".tc-is-sample").checked;
    r.querySelector(".test-case-header span").innerText = `TEST CASE ${String(idx + 1).padStart(2, "0")} (${isSample ? "PUBLIC SAMPLE" : "HIDDEN BENCHMARK"})`;
  });
  testCaseCounter = rows.length;
}

if (btnAddTestCase) {
  btnAddTestCase.addEventListener("click", () => {
    testCaseCounter++;
    const newRow = createTestCaseRow(testCaseCounter, false, "", "");
    testCasesContainer.appendChild(newRow);
    newRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

// Attach delete listener to existing default rows
document.querySelectorAll(".tc-delete-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const row = e.target.closest(".test-case-row");
    if (row && testCasesContainer.querySelectorAll(".test-case-row").length > 1) {
      row.remove();
      renumberTestCases();
    }
  });
});

/* ================== FORM SUBMISSION & ATOMIC SINGLE WRITE ================== */
if (createSessionForm) {
  createSessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const publishBtn = document.getElementById("btnPublishSession");
    publishBtn.disabled = true;
    publishBtn.innerText = "⏳ GENERATING UNIQUE ID & COMPILING METADATA...";

    try {
      const sessionTitle = document.getElementById("sessionTitle").value.trim();
      const sessionDuration = parseInt(document.getElementById("sessionDuration").value, 10) || 45;
      const probTitle = document.getElementById("probTitle").value.trim();
      const probDifficulty = document.getElementById("probDifficultySelect").value;
      const probTimeLimit = parseInt(document.getElementById("probTimeLimit").value, 10) || 2000;
      const probMemoryLimit = parseInt(document.getElementById("probMemoryLimit").value, 10) || 256;
      const probStatement = document.getElementById("probStatement").value.trim();

      // Proctored Rules
      const ruleFullscreen = document.getElementById("ruleFullscreen").checked;
      const ruleBlockPaste = document.getElementById("ruleBlockPaste").checked;
      const ruleAutoSave = document.getElementById("ruleAutoSave").checked;
      const ruleMaxStrikes = parseInt(document.getElementById("ruleMaxStrikes").value, 10) || 3;

      // Extract Test Cases
      const tcRows = testCasesContainer.querySelectorAll(".test-case-row");
      const testCases = [];
      tcRows.forEach((row, idx) => {
        const input = row.querySelector(".tc-input").value;
        const expectedOutput = row.querySelector(".tc-output").value;
        const isSample = row.querySelector(".tc-is-sample").checked;
        testCases.push({
          id: `tc_${idx + 1}`,
          input,
          expectedOutput,
          isSample,
          points: 50
        });
      });

      if (testCases.length === 0) {
        throw new Error("At least one test case is required.");
      }

      // Generate slug from problem title
      const probSlug = probTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-challenge";

      // Consolidated Challenge & Session Metadata Document
      const sessionPayload = {
        title: sessionTitle,
        description: `Proctored competitive arena match for '${probTitle}'. Single write atomic persistence.`,
        durationMinutes: sessionDuration,
        points: testCases.length * 50,
        rules: {
          fullscreenEnforced: ruleFullscreen,
          blockPaste: ruleBlockPaste,
          idleAutoSaveSeconds: ruleAutoSave ? 10 : 0,
          maxStrikes: ruleMaxStrikes
        },
        problem: {
          slug: probSlug,
          title: probTitle,
          difficulty: probDifficulty,
          statement: probStatement,
          points: testCases.length * 50,
          timeLimitMs: probTimeLimit,
          memoryLimitKb: probMemoryLimit * 1024,
          testCases
        },
        createdBy: "ADMIN_ORGANIZER"
      };

      // Single Atomic Write Request to Server
      const res = await fetch(`${API_BASE}/sessions/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to publish challenge session");
      }

      currentGeneratedSessionId = data.data.sessionId;

      // Show Generated Session Badge
      generatedSessionIdEl.innerText = currentGeneratedSessionId;
      sessionGeneratedBadge.style.display = "block";
      sessionGeneratedBadge.scrollIntoView({ behavior: "smooth", block: "center" });

      showToast(`⚡ SESSION ${currentGeneratedSessionId} DEPLOYED! (Single-Write Persisted)`, "success");

      // Reload Active Sessions Table
      await loadAdminSessions();

    } catch (err) {
      showToast(`❌ Publish Error: ${err.message}`, "danger");
    } finally {
      publishBtn.disabled = false;
      publishBtn.innerText = "⚡ GENERATE SESSION ID & PUBLISH (SINGLE WRITE)";
    }
  });
}

// Copy Code Button
if (btnCopySessionCode) {
  btnCopySessionCode.addEventListener("click", () => {
    if (!currentGeneratedSessionId) return;
    navigator.clipboard.writeText(currentGeneratedSessionId).then(() => {
      showToast(`📋 Copied '${currentGeneratedSessionId}' to clipboard`, "info");
    }).catch(() => {
      showToast(`Session Code: ${currentGeneratedSessionId}`, "info");
    });
  });
}

// Copy Direct Link Button
if (btnCopyDirectLink) {
  btnCopyDirectLink.addEventListener("click", () => {
    if (!currentGeneratedSessionId) return;
    const directUrl = `${window.location.origin}/index.html?session=${currentGeneratedSessionId}`;
    navigator.clipboard.writeText(directUrl).then(() => {
      showToast(`🔗 Copied direct invite URL to clipboard`, "info");
    }).catch(() => {
      showToast(`Invite Link: ${directUrl}`, "info");
    });
  });
}

/* ================== ACTIVE SESSIONS MONITOR ================== */
async function loadAdminSessions() {
  if (!adminSessionsTableBody) return;

  try {
    const res = await fetch(`${API_BASE}/sessions/admin/list`);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      adminSessionsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 18px;">NO SESSIONS REGISTERED YET</td></tr>`;
      return;
    }

    adminSessionsTableBody.innerHTML = data.data.map(session => `
      <tr>
        <td>
          <strong style="color: var(--orange-flame); font-family: var(--font-display); letter-spacing: 1px;">
            ${session.id}
          </strong>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(session.problemTitle)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${escapeHtml(session.title)} (${session.durationMinutes}m)</div>
        </td>
        <td>
          <span style="font-family: var(--font-code); color: var(--text-main);">
            ${session.submissionsCount || 0} SUBMITTED
          </span>
        </td>
        <td>
          <span class="sharp-tag tag-easy">ACTIVE</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sharp btn-secondary btn-inspect-audit" data-session-id="${session.id}" style="padding: 4px 8px; font-size: 0.72rem;">
              AUDIT
            </button>
            <a href="index.html?session=${session.id}" target="_blank" class="btn btn-sharp btn-outline" style="padding: 4px 8px; font-size: 0.72rem; text-decoration: none;">
              OPEN ↗
            </a>
          </div>
        </td>
      </tr>
    `).join("");

    // Attach click handlers to inspect buttons
    adminSessionsTableBody.querySelectorAll(".btn-inspect-audit").forEach(btn => {
      btn.addEventListener("click", () => {
        const sid = btn.getAttribute("data-session-id");
        openAuditDossier(sid);
      });
    });

  } catch (err) {
    adminSessionsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--red-fatal);">FAILED TO LOAD SESSIONS</td></tr>`;
  }
}

/* ================== AUDIT DOSSIER INSPECTOR ================== */
async function openAuditDossier(sessionId) {
  auditModalTitle.innerText = `SESSION AUDIT: ${sessionId}`;
  auditModalContent.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 24px;">FETCHING SUBMISSIONS & TELEMETRY MANIFEST...</div>`;
  auditModal.classList.add("active");

  try {
    const res = await fetch(`${API_BASE}/sessions/admin/${sessionId}/audit`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Failed to load audit");

    const auditData = data.data;
    const submissions = auditData.submissions || [];

    if (submissions.length === 0) {
      auditModalContent.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim);">
          No participant submissions or strike reports recorded for this session yet.<br>
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            Share Session ID <strong>${sessionId}</strong> with coders to begin.
          </span>
        </div>
      `;
      return;
    }

    auditModalContent.innerHTML = submissions.map((sub, idx) => {
      const isAccepted = sub.verdict === "Accepted";
      const isDisqualified = sub.verdict && sub.verdict.toLowerCase().includes("disqualified");
      const cardClass = isAccepted ? "accepted" : isDisqualified ? "disqualified" : "";

      const events = sub.telemetryEvents || [];
      const eventsHtml = events.length === 0 
        ? `<span style="color: var(--text-dim);">No violations flagged</span>`
        : events.map(e => `
            <div style="font-size: 0.72rem; margin-bottom: 4px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-left: 2px solid ${e.eventType.includes("BLUR") || e.eventType.includes("PASTE") ? "var(--red-fatal)" : "var(--orange-flame)"};">
              <span style="color: var(--orange-flame); font-weight: 600;">[${escapeHtml(e.eventType)}]</span> 
              <span style="color: var(--text-dim);">${e.details?.clientTime ? new Date(e.details.clientTime).toLocaleTimeString() : ""}</span>
              <span style="color: var(--text-main);">${escapeHtml(e.details?.reason || "")}</span>
            </div>
          `).join("");

      return `
        <div class="audit-card ${cardClass}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <span style="font-size: 1rem; font-weight: 700; color: #fff;">${escapeHtml(sub.username)}</span>
              <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: 8px;">(${escapeHtml(sub.userId)})</span>
            </div>
            <div>
              <span class="sharp-tag ${isAccepted ? "tag-easy" : isDisqualified ? "tag-hard" : "tag-pts"}">
                ${escapeHtml(sub.verdict)}
              </span>
              <span class="sharp-tag tag-spec" style="margin-left: 6px;">
                ${sub.score} PTS
              </span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 0.75rem; margin-bottom: 12px; background: rgba(0,0,0,0.25); padding: 8px;">
            <div><span style="color: var(--text-dim);">STRIKES:</span> <strong style="color: ${sub.strikes > 0 ? "var(--red-fatal)" : "var(--green-pass)"};">${sub.strikes} / 3</strong></div>
            <div><span style="color: var(--text-dim);">RUNTIME:</span> <strong>${sub.runtimeMs}ms</strong></div>
            <div><span style="color: var(--text-dim);">MEMORY:</span> <strong>${(sub.memoryKb / 1024).toFixed(1)}MB</strong></div>
            <div><span style="color: var(--text-dim);">SNAPSHOTS:</span> <strong>${sub.snapshotsCount || 0}</strong></div>
          </div>

          <!-- Telemetry Manifest -->
          <div style="margin-top: 8px;">
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-bottom: 6px; font-weight: 600;">ANTI-CHEAT TELEMETRY AUDIT TRAIL (${events.length} EVENTS):</div>
            <div style="max-height: 120px; overflow-y: auto; background: var(--bg-deep); padding: 8px; border: 1px solid var(--border-subtle);">
              ${eventsHtml}
            </div>
          </div>

          <!-- Source Code Inspection Toggle -->
          <details style="margin-top: 10px;">
            <summary style="cursor: pointer; font-size: 0.72rem; color: var(--orange-flame); outline: none;">VIEW SUBMITTED SOURCE CODE (${escapeHtml(sub.language.toUpperCase())})</summary>
            <pre style="background: #000; padding: 10px; margin-top: 6px; font-size: 0.75rem; color: #4ade80; overflow-x: auto; max-height: 180px;"><code>${escapeHtml(sub.sourceCode || "// No code")}</code></pre>
          </details>
        </div>
      `;
    }).join("");

  } catch (err) {
    auditModalContent.innerHTML = `<div style="padding: 24px; color: var(--red-fatal); text-align: center;">Error loading audit dossier: ${escapeHtml(err.message)}</div>`;
  }
}

if (btnCloseAuditModal) {
  btnCloseAuditModal.addEventListener("click", () => {
    auditModal.classList.remove("active");
  });
}

/* ================== FIREBASE CLUSTER CONNECTOR ================== */
if (btnSaveFirebaseConfig) {
  btnSaveFirebaseConfig.addEventListener("click", async () => {
    const projectId = fbProjectId.value.trim();
    const apiKey = fbApiKey.value.trim();

    if (!projectId) {
      showToast("Please enter a Firebase Project ID", "danger");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sessions/admin/firebase-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, apiKey })
      });

      const data = await res.json();
      if (data.success) {
        firebaseStatusTag.innerText = "MODE: FIREBASE FIRESTORE ACTIVE";
        firebaseStatusTag.className = "sharp-tag tag-easy";
        showToast("🔥 Connected to Firebase Firestore Cluster! Single writes active.", "success");
      }
    } catch (err) {
      showToast("Failed to update Firebase configuration", "danger");
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initial session load
document.addEventListener("DOMContentLoaded", () => {
  loadAdminSessions();
});
