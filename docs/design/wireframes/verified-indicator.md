# Wireframe & Design Spec: "Verified ✓" Trust Indicator
**Component**: `VerifiedBadge`  
**Locations**: Submission Results Header, Contest Standings / Leaderboard, Profile High-Rank Submissions

---

## 1. Specification & Semantics

> [!IMPORTANT]
> The **"Verified ✓"** badge is **NOT** displayed for every submission.  
> It is displayed **exclusively** for submissions that have been audited through the **contest-finalization dual-run verification process** (comparing Primary Engine `judge0` vs Verification Engine `piston`) and confirmed to have zero discrepancies or successfully resolved by contest administrators.

---

## 2. Visual Design

```text
Visual Appearance:
[ Verified ✓ ]
- Background: #E6F8F4 (var(--verified-badge-bg))
- Text: #0D7A68 (var(--verified-badge-text))
- Border: 1px solid #99E8D8 (var(--verified-badge-border))
- Font: IBM Plex Mono 11px, weight 600, uppercase letter-spacing
- Checkmark: Teal solid icon (#0EA5E9)

Popover / Tooltip (Hover or Tap):
+-------------------------------------------------------------+
| 🛡️ Official Contest Verification Audit                      |
|                                                             |
| This submission underwent dual-engine sandboxed execution   |
| (Judge0 + Piston) during contest finalization. Both engines |
| independently validated the algorithmic correctness and     |
| performance constraints.                                    |
|                                                             |
| Audited: 2026-09-21 21:30 UTC · Hash: #8f92ac              |
+-------------------------------------------------------------+
```

---

## 3. Placement Rules
1. **Leaderboard Rows**: Placed next to the participant's final accepted score in finalized contests.
2. **Submission Detail View**: Placed in the metadata summary ribbon alongside Runtime, Memory, and Language.
3. **Practice Problems**: Normal practice problems do not display this badge (unless explicitly subjected to verification benchmarking).
