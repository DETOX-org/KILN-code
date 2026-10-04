/**
 * DETOX Code — Admin Command Portal & Challenge Configurator
 * Tactical HUD // Zero Border-Radius // Random ID Auth & Admin Dashboard
 */

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:3000/api"
  : `${window.location.origin}/api`;

// Auth State
let currentAdminId = localStorage.getItem("detox_admin_id") || null;
let currentAdminProfile = null;
let currentGeneratedSessionId = null;

// DOM Elements: Auth
const adminAuthView = document.getElementById("adminAuthView");
const adminDashboardView = document.getElementById("adminDashboardView");
const hudAdminStatus = document.getElementById("hudAdminStatus");
const adminUserPill = document.getElementById("adminUserPill");
const adminPillId = document.getElementById("adminPillId");
const adminPillName = document.getElementById("adminPillName");
const btnLogoutAdmin = document.getElementById("btnLogoutAdmin");
const adminRegisterForm = document.getElementById("adminRegisterForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const btnQuickLoginDefault = document.getElementById("btnQuickLoginDefault");
const newKeyAlertBox = document.getElementById("newKeyAlertBox");
const newKeyAlertCode = document.getElementById("newKeyAlertCode");
const btnCopyNewAdminKey = document.getElementById("btnCopyNewAdminKey");

// DOM Elements: Metrics & Tabs
const metricTotalRooms = document.getElementById("metricTotalRooms");
const metricTotalParticipants = document.getElementById("metricTotalParticipants");
const metricTotalSubmissions = document.getElementById("metricTotalSubmissions");
const adminRoomsTableBody = document.getElementById("adminRoomsTableBody");
const tabButtons = document.querySelectorAll(".admin-tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const btnTabGoCreate = document.getElementById("btnTabGoCreate");

// DOM Elements: Create Room Form
const createSessionForm = document.getElementById("createSessionForm");
const btnAddTestCase = document.getElementById("btnAddTestCase");
const testCasesContainer = document.getElementById("testCasesContainer");
const sessionGeneratedBadge = document.getElementById("sessionGeneratedBadge");
const generatedSessionIdEl = document.getElementById("generatedSessionId");
const btnCopySessionCode = document.getElementById("btnCopySessionCode");
const btnCopyDirectLink = document.getElementById("btnCopyDirectLink");
const btnViewCreatedRoom = document.getElementById("btnViewCreatedRoom");

// DOM Elements: Room Detail Modal
const roomDetailModal = document.getElementById("roomDetailModal");
const roomDetailModalTitle = document.getElementById("roomDetailModalTitle");
const roomDetailModalContent = document.getElementById("roomDetailModalContent");
const btnCloseRoomDetailModal = document.getElementById("btnCloseRoomDetailModal");

// DOM Elements: Discrepancies & Firebase
const discrepancyQueueContainer = document.getElementById("discrepancyQueueContainer");
const fbProjectId = document.getElementById("fbProjectId");
const fbApiKey = document.getElementById("fbApiKey");
const btnSaveFirebaseConfig = document.getElementById("btnSaveFirebaseConfig");
const firebaseStatusTag = document.getElementById("firebaseStatusTag");
const toastContainer = document.getElementById("toastContainer");

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

/* ================== AUTHENTICATION FLOW ================== */
async function checkAuth() {
  if (!currentAdminId) {
    showAuthGate();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: { "x-admin-id": currentAdminId }
    });
    const data = await res.json();

    if (!data.success || !data.data) {
      logoutAdmin();
      return;
    }

    currentAdminProfile = data.data;
    showDashboard();
  } catch (err) {
    showAuthGate();
  }
}

function showAuthGate() {
  if (adminAuthView) adminAuthView.style.display = "block";
  if (adminDashboardView) adminDashboardView.style.display = "none";
  if (adminUserPill) adminUserPill.style.display = "none";
  if (hudAdminStatus) hudAdminStatus.innerText = "ACCESS: UNSECURED";
}

function showDashboard() {
  if (adminAuthView) adminAuthView.style.display = "none";
  if (adminDashboardView) adminDashboardView.style.display = "block";
  if (adminUserPill) {
    adminUserPill.style.display = "flex";
    adminPillId.innerText = currentAdminProfile.adminId;
    adminPillName.innerText = currentAdminProfile.displayName || "Admin";
  }
  if (hudAdminStatus) {
    hudAdminStatus.innerText = `COMMAND: ${currentAdminProfile.adminId} (AUTHENTICATED)`;
  }

  loadAdminRooms();
  loadDiscrepancies();
}

function logoutAdmin() {
  currentAdminId = null;
  currentAdminProfile = null;
  localStorage.removeItem("detox_admin_id");
  showAuthGate();
  showToast("Logged out of Admin Command", "info");
}

if (btnLogoutAdmin) {
  btnLogoutAdmin.addEventListener("click", logoutAdmin);
}

// Register New Admin (Random ID)
if (adminRegisterForm) {
  adminRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const displayName = document.getElementById("regDisplayName").value.trim();

    try {
      const res = await fetch(`${API_BASE}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName })
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Registration failed");

      const profile = data.data;
      currentAdminId = profile.adminId;
      currentAdminProfile = profile;
      localStorage.setItem("detox_admin_id", currentAdminId);

      // Show generated key notification
      if (newKeyAlertBox && newKeyAlertCode) {
        newKeyAlertCode.innerText = profile.adminId;
        newKeyAlertBox.style.display = "flex";
      }

      showToast(`⚡ Generated Admin ID: ${profile.adminId}`, "success");
      setTimeout(() => {
        showDashboard();
      }, 1200);

    } catch (err) {
      showToast(`Error: ${err.message}`, "danger");
    }
  });
}

// Copy New Key Button
if (btnCopyNewAdminKey) {
  btnCopyNewAdminKey.addEventListener("click", () => {
    if (!newKeyAlertCode) return;
    navigator.clipboard.writeText(newKeyAlertCode.innerText).then(() => {
      showToast("📋 Copied Admin ID to clipboard!", "success");
    });
  });
}

// Login Returning Admin
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const adminId = document.getElementById("loginAdminId").value.trim().toUpperCase();

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId })
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Invalid Admin Key");

      currentAdminId = data.data.adminId;
      currentAdminProfile = data.data;
      localStorage.setItem("detox_admin_id", currentAdminId);

      showToast(`Welcome back, ${currentAdminProfile.displayName}!`, "success");
      showDashboard();

    } catch (err) {
      showToast(`Login Failed: ${err.message}`, "danger");
    }
  });
}

// Quick Login as default ADMIN-CORE
if (btnQuickLoginDefault) {
  btnQuickLoginDefault.addEventListener("click", async () => {
    const adminId = "ADMIN-CORE";
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId })
      });
      const data = await res.json();

      if (data.success) {
        currentAdminId = data.data.adminId;
        currentAdminProfile = data.data;
        localStorage.setItem("detox_admin_id", currentAdminId);
        showToast("Logged in as default ADMIN-CORE", "success");
        showDashboard();
      }
    } catch (err) {
      showToast("Failed to login as ADMIN-CORE", "danger");
    }
  });
}

/* ================== TABS NAVIGATION ================== */
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetTab = btn.getAttribute("data-tab");
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    const activeContent = document.getElementById(targetTab);
    if (activeContent) activeContent.classList.add("active");

    if (targetTab === "tabRooms") loadAdminRooms();
    if (targetTab === "tabDiscrepancies") loadDiscrepancies();
  });
});

if (btnTabGoCreate) {
  btnTabGoCreate.addEventListener("click", () => {
    const createTabBtn = document.querySelector(`.admin-tab-btn[data-tab="tabCreate"]`);
    if (createTabBtn) createTabBtn.click();
  });
}

/* ================== MY ROOMS LIST & METRICS ================== */
async function loadAdminRooms() {
  if (!currentAdminId || !adminRoomsTableBody) return;

  try {
    const res = await fetch(`${API_BASE}/admin/rooms`, {
      headers: { "x-admin-id": currentAdminId }
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    const rooms = data.data || [];

    // Calculate metrics
    const totalRooms = rooms.length;
    const totalParticipants = rooms.reduce((sum, r) => sum + (r.participantsCount || 0), 0);
    const totalSubmissions = rooms.reduce((sum, r) => sum + (r.submissionsCount || 0), 0);

    if (metricTotalRooms) metricTotalRooms.innerText = totalRooms;
    if (metricTotalParticipants) metricTotalParticipants.innerText = totalParticipants;
    if (metricTotalSubmissions) metricTotalSubmissions.innerText = totalSubmissions;

    if (rooms.length === 0) {
      adminRoomsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 24px;">
            No rooms created yet under Admin ID <strong>${escapeHtml(currentAdminId)}</strong>.<br>
            <button type="button" class="btn btn-sharp btn-primary" onclick="document.querySelector('.admin-tab-btn[data-tab=\\'tabCreate\\']').click()" style="margin-top: 10px; padding: 6px 14px; font-size: 0.75rem;">
              + CREATE YOUR FIRST ROOM
            </button>
          </td>
        </tr>
      `;
      return;
    }

    adminRoomsTableBody.innerHTML = rooms.map(room => `
      <tr>
        <td>
          <strong style="color: var(--orange-flame); font-family: var(--font-display); letter-spacing: 1px;">
            ${room.id}
          </strong>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(room.problemTitle || room.title)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${escapeHtml(room.title)}</div>
        </td>
        <td>
          <span class="sharp-tag ${room.difficulty === 'easy' ? 'tag-easy' : room.difficulty === 'hard' ? 'tag-hard' : 'tag-pts'}">
            ${(room.difficulty || "easy").toUpperCase()}
          </span>
        </td>
        <td>${room.durationMinutes}m</td>
        <td>
          <strong style="color: var(--text-main); font-family: var(--font-code);">
            ${room.participantsCount || 0} CODERS
          </strong>
        </td>
        <td>
          <span style="font-family: var(--font-code); color: var(--text-muted);">
            ${room.submissionsCount || 0} SUBMITS
          </span>
        </td>
        <td>
          <span class="sharp-tag tag-easy">${(room.status || "live").toUpperCase()}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sharp btn-primary btn-inspect-room" data-room-id="${room.id}" style="padding: 4px 8px; font-size: 0.72rem;">
              INSPECT
            </button>
            <a href="index.html?session=${room.id}" target="_blank" class="btn btn-sharp btn-secondary" style="padding: 4px 8px; font-size: 0.72rem; text-decoration: none;">
              OPEN ↗
            </a>
          </div>
        </td>
      </tr>
    `).join("");

    // Attach inspect click handlers
    adminRoomsTableBody.querySelectorAll(".btn-inspect-room").forEach(btn => {
      btn.addEventListener("click", () => {
        const rid = btn.getAttribute("data-room-id");
        openRoomDetail(rid);
      });
    });

  } catch (err) {
    adminRoomsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--red-fatal);">Error loading rooms: ${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ================== ROOM DETAIL & PARTICIPANT INSPECTOR ================== */
async function openRoomDetail(roomId) {
  if (!roomDetailModal) return;
  roomDetailModalTitle.innerText = `ROOM PERFORMANCE DOSSIER: ${roomId}`;
  roomDetailModalContent.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 28px;">FETCHING ROOM PERFORMANCE & AUDIT RECORDS...</div>`;
  roomDetailModal.classList.add("active");

  try {
    const res = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      headers: { "x-admin-id": currentAdminId }
    });
    const data = await res.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Room details not found");
    }

    const { room, leaderboard, participants } = data.data;

    const participantsHtml = participants.length === 0
      ? `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 20px;">No participant submissions recorded in this room yet. Share Room ID <strong>${room.id}</strong> to begin combat!</td></tr>`
      : participants.map((p, idx) => {
          const isAccepted = p.verdict === "Accepted";
          const isDisqualified = p.strikes >= 3 || (p.verdict && p.verdict.toLowerCase().includes("disqualified"));
          return `
            <tr>
              <td>#${String(idx + 1).padStart(2, "0")}</td>
              <td>
                <strong style="color: #fff;">${escapeHtml(p.username)}</strong>
                <span style="font-size: 0.7rem; color: var(--text-dim); display: block;">${escapeHtml(p.userId)}</span>
              </td>
              <td><strong style="color: var(--orange-flame); font-size: 0.95rem;">${p.score}</strong></td>
              <td>${p.runtimeMs}ms (${(p.memoryKb / 1024).toFixed(1)}MB)</td>
              <td>
                <span style="color: ${p.strikes > 0 ? 'var(--red-fatal)' : 'var(--green-pass)'}; font-weight: 700;">
                  ${p.strikes} / 3 STRIKES
                </span>
              </td>
              <td>
                <span class="sharp-tag ${isAccepted ? 'tag-easy' : isDisqualified ? 'tag-hard' : 'tag-pts'}">
                  ${escapeHtml(p.verdict)}
                </span>
              </td>
              <td style="font-size: 0.72rem; color: var(--text-dim);">
                ${new Date(p.submittedAt).toLocaleTimeString()}
              </td>
            </tr>
          `;
        }).join("");

    roomDetailModalContent.innerHTML = `
      <!-- Room Specifications Banner -->
      <div style="background: var(--bg-deep); border: 1px solid var(--border-subtle); padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 2px;">${escapeHtml(room.title)}</h3>
            <div style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-code);">
              HOSTED BY: <strong style="color: var(--orange-flame);">${escapeHtml(room.createdBy)}</strong> | CREATED: ${new Date(room.createdAt).toLocaleString()}
            </div>
          </div>
          <span class="sharp-tag tag-easy">${(room.status || "live").toUpperCase()}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 0.78rem; background: rgba(0,0,0,0.3); padding: 8px 12px; margin-top: 8px;">
          <div><span style="color: var(--text-dim);">PROBLEM:</span> <strong style="color: #fff;">${escapeHtml(room.problem.title)}</strong></div>
          <div><span style="color: var(--text-dim);">DIFFICULTY:</span> <strong>${(room.problem.difficulty || 'easy').toUpperCase()}</strong></div>
          <div><span style="color: var(--text-dim);">DURATION:</span> <strong>${room.durationMinutes} MINUTES</strong></div>
          <div><span style="color: var(--text-dim);">MAX POINTS:</span> <strong>${room.points} PTS</strong></div>
        </div>

        <div style="margin-top: 10px; display: flex; gap: 8px;">
          <button class="btn btn-sharp btn-secondary" onclick="navigator.clipboard.writeText('${room.id}'); showToast('Copied Room ID: ${room.id}', 'info')" style="padding: 4px 10px; font-size: 0.72rem;">
            📋 COPY ROOM ID
          </button>
          <button class="btn btn-sharp btn-primary" onclick="navigator.clipboard.writeText(new URL('index.html?session=${room.id}', window.location.href).href); showToast('Copied Invite Link', 'info')" style="padding: 4px 10px; font-size: 0.72rem;">
            🔗 COPY DIRECT INVITE LINK
          </button>
        </div>
      </div>

      <!-- Participant Performance Table -->
      <div style="margin-bottom: 8px; font-family: var(--font-display); font-size: 0.85rem; color: #fff;">
        PARTICIPANT PERFORMANCE &amp; SCORING (${participants.length} CODERS RECORDED)
      </div>

      <div class="admin-table-container" style="max-height: 280px;">
        <table class="sharp-table" style="font-size: 0.78rem;">
          <thead>
            <tr>
              <th>#</th>
              <th>PARTICIPANT</th>
              <th>SCORE</th>
              <th>RUNTIME / RAM</th>
              <th>STRIKES</th>
              <th>VERDICT</th>
              <th>SUBMITTED</th>
            </tr>
          </thead>
          <tbody>
            ${participantsHtml}
          </tbody>
        </table>
      </div>
    `;

  } catch (err) {
    roomDetailModalContent.innerHTML = `<div style="padding: 24px; color: var(--red-fatal); text-align: center;">Error: ${escapeHtml(err.message)}</div>`;
  }
}

if (btnCloseRoomDetailModal) {
  btnCloseRoomDetailModal.addEventListener("click", () => {
    roomDetailModal.classList.remove("active");
  });
}

/* ================== CREATE ROOM (OPPORTUNITY) FORM ================== */
let testCaseCounter = 2;

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

  row.querySelector(".tc-delete-btn").addEventListener("click", () => {
    if (testCasesContainer.querySelectorAll(".test-case-row").length <= 1) {
      showToast("Room must retain at least 1 test case.", "danger");
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

// Delete listeners on initial rows
document.querySelectorAll(".tc-delete-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const row = e.target.closest(".test-case-row");
    if (row && testCasesContainer.querySelectorAll(".test-case-row").length > 1) {
      row.remove();
      renumberTestCases();
    }
  });
});

if (createSessionForm) {
  createSessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentAdminId) {
      showToast("Please authenticate as admin first", "danger");
      return;
    }

    const publishBtn = document.getElementById("btnPublishSession");
    publishBtn.disabled = true;
    publishBtn.innerText = "⏳ COMPILING ROOM METADATA & PERSISTING...";

    try {
      const sessionTitle = document.getElementById("sessionTitle").value.trim();
      const sessionDuration = parseInt(document.getElementById("sessionDuration").value, 10) || 45;
      const probTitle = document.getElementById("probTitle").value.trim();
      const probDifficulty = document.getElementById("probDifficultySelect").value;
      const probTimeLimit = parseInt(document.getElementById("probTimeLimit").value, 10) || 2000;
      const probMemoryLimit = parseInt(document.getElementById("probMemoryLimit").value, 10) || 256;
      const probStatement = document.getElementById("probStatement").value.trim();

      const ruleFullscreen = document.getElementById("ruleFullscreen").checked;
      const ruleBlockPaste = document.getElementById("ruleBlockPaste").checked;
      const ruleAutoSave = document.getElementById("ruleAutoSave").checked;
      const ruleMaxStrikes = parseInt(document.getElementById("ruleMaxStrikes").value, 10) || 3;

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

      const probSlug = probTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-challenge";

      const sessionPayload = {
        title: sessionTitle,
        description: `Room opportunity for '${probTitle}'. Hosted by ${currentAdminId}.`,
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
        createdBy: currentAdminId
      };

      const res = await fetch(`${API_BASE}/sessions/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": currentAdminId
        },
        body: JSON.stringify(sessionPayload)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to publish room");

      currentGeneratedSessionId = data.data.sessionId;

      generatedSessionIdEl.innerText = currentGeneratedSessionId;
      sessionGeneratedBadge.style.display = "block";
      sessionGeneratedBadge.scrollIntoView({ behavior: "smooth", block: "center" });

      showToast(`⚡ ROOM ${currentGeneratedSessionId} CREATED BY ${currentAdminId}!`, "success");

      // Refresh My Rooms
      await loadAdminRooms();

    } catch (err) {
      showToast(`❌ Room Error: ${err.message}`, "danger");
    } finally {
      publishBtn.disabled = false;
      publishBtn.innerText = "⚡ GENERATE ROOM ID & PUBLISH (SINGLE WRITE)";
    }
  });
}

// Copy Code Button
if (btnCopySessionCode) {
  btnCopySessionCode.addEventListener("click", () => {
    if (!currentGeneratedSessionId) return;
    navigator.clipboard.writeText(currentGeneratedSessionId).then(() => {
      showToast(`📋 Copied '${currentGeneratedSessionId}' to clipboard`, "info");
    });
  });
}

// Copy Direct Link Button
if (btnCopyDirectLink) {
  btnCopyDirectLink.addEventListener("click", () => {
    const directUrl = new URL(`index.html?session=${currentGeneratedSessionId}`, window.location.href).href;
    navigator.clipboard.writeText(directUrl).then(() => {
      showToast(`🔗 Copied direct invite URL to clipboard`, "info");
    });
  });
}

if (btnViewCreatedRoom) {
  btnViewCreatedRoom.addEventListener("click", () => {
    const myRoomsTabBtn = document.querySelector(`.admin-tab-btn[data-tab="tabRooms"]`);
    if (myRoomsTabBtn) myRoomsTabBtn.click();
  });
}

/* ================== DUAL-JUDGE DISCREPANCIES (PRESERVED) ================== */
async function loadDiscrepancies() {
  if (!discrepancyQueueContainer) return;
  try {
    const res = await fetch(`${API_BASE}/admin/discrepancies`);
    const data = await res.json();

    const items = data.items || [];
    if (items.length === 0) {
      discrepancyQueueContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim);">
          ✓ ZERO DISCREPANCIES FLAGGED.<br>
          <span style="font-size: 0.78rem; color: var(--text-muted);">
            All Primary and Verification judge outputs match within allowable thresholds.
          </span>
        </div>
      `;
      return;
    }

    discrepancyQueueContainer.innerHTML = items.map(item => `
      <div class="audit-card disqualified">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong>SUBMISSION: ${item.submission_id}</strong>
          <span class="sharp-tag tag-hard">CONFLICT</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
          ${escapeHtml(item.discrepancy_details || "Verdict mismatch between judges")}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sharp btn-secondary" onclick="resolveDiscrepancy('${item.submission_id}', 'accept_primary')" style="padding: 4px 8px; font-size: 0.72rem;">ACCEPT PRIMARY</button>
          <button class="btn btn-sharp btn-secondary" onclick="resolveDiscrepancy('${item.submission_id}', 'accept_verification')" style="padding: 4px 8px; font-size: 0.72rem;">ACCEPT VERIFICATION</button>
          <button class="btn btn-sharp btn-primary" onclick="resolveDiscrepancy('${item.submission_id}', 'rerun_benchmark')" style="padding: 4px 8px; font-size: 0.72rem;">RERUN</button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    discrepancyQueueContainer.innerHTML = `<div style="color: var(--text-dim); text-align: center; padding: 18px;">No active discrepancies.</div>`;
  }
}

window.resolveDiscrepancy = async function(id, action) {
  try {
    const res = await fetch(`${API_BASE}/admin/discrepancies/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    showToast(data.message || "Resolved discrepancy", "success");
    loadDiscrepancies();
  } catch (err) {
    showToast("Failed to resolve discrepancy", "danger");
  }
};

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
      const res = await fetch(`${API_BASE}/admin/firebase-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, apiKey })
      });

      const data = await res.json();
      if (data.success) {
        firebaseStatusTag.innerText = "MODE: FIREBASE FIRESTORE ACTIVE";
        firebaseStatusTag.className = "sharp-tag tag-easy";
        showToast("🔥 Connected to Firebase Firestore Cluster!", "success");
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

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});
