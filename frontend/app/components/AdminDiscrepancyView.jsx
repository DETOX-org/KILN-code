'use client';

import React, { useState, useMemo } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Cpu, FileCode, Check, RefreshCw, Plus, Trash2 } from 'lucide-react';

export default function AdminDiscrepancyView() {
  const [adminSubTab, setAdminSubTab] = useState('discrepancy'); // 'discrepancy' | 'problem_creator' | 'subtasks'

  // Problem creator state
  const [problemTitle, setProblemTitle] = useState('Maximum Subarray Sum with Modulo K');
  const [problemSlug, setProblemSlug] = useState('maximum-subarray-sum-modulo-k');
  const [problemDifficulty, setProblemDifficulty] = useState('medium');
  const [gradingType, setGradingType] = useState('subtask_ioi');
  const [executionEngine, setExecutionEngine] = useState('judge0');
  const [timeLimit, setTimeLimit] = useState(1500);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [checkerCode, setCheckerCode] = useState(`#include "testlib.h"\n\nint main(int argc, char* argv[]) {\n    registerTestlibCmd(argc, argv);\n    int n = inf.readInt();\n    quitf(_ok, "Valid answer verified by custom checker");\n}`);
  const [subtasks, setSubtasks] = useState([
    {
      id: 'st-1',
      title: 'Subtask 1: N <= 100, K <= 10^3',
      description: 'Brute force O(N^2) solutions can pass within time limit.',
      points: 20,
      testCount: 4
    },
    {
      id: 'st-2',
      title: 'Subtask 2: N <= 5,000, K <= 10^9',
      description: 'O(N log N) solutions with sorted prefix sums.',
      points: 50,
      testCount: 6
    },
    {
      id: 'st-3',
      title: 'Subtask 3: N <= 200,000, K <= 10^18',
      description: 'Full constraints requiring balanced BST / Fenwick tree prefix lookup.',
      points: 30,
      testCount: 6
    }
  ]);

  const totalSubtaskPoints = useMemo(() => {
    return subtasks.reduce((sum, st) => sum + (Number(st.points) || 0), 0);
  }, [subtasks]);

  const isPointsValid = totalSubtaskPoints === 100;

  // Discrepancy Queue State
  const [hasDiscrepancy, setHasDiscrepancy] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState('accept_primary');
  const [resolutionNotes, setResolutionNotes] = useState('Compiler optimization flag variance (-O3 vs -O2). Approved as Accepted per contest specification.');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveDiscrepancy = () => {
    setIsResolving(true);
    setTimeout(() => {
      setHasDiscrepancy(false);
      setIsResolving(false);
    }, 600);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Admin Navigation Header */}
      <div className="card" style={{ padding: '22px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-wrong">
                <ShieldAlert size={12} />
                Contest Integrity &amp; Administration
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Staff &amp; Arbiter Panel</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Dual-Engine Verification &amp; Problem Management
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Resolve discrepancies between Judge0 and Piston execution pools, configure 3-way grading pipelines, and manage subtasks.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-subtle)' }}>
            <button
              onClick={() => setAdminSubTab('discrepancy')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: adminSubTab === 'discrepancy' ? 'var(--line-active)' : 'transparent',
                color: adminSubTab === 'discrepancy' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Discrepancy Queue {hasDiscrepancy && <span style={{ background: '#F43F5E', color: '#fff', padding: '1px 5px', borderRadius: '8px', fontSize: '10px', marginLeft: '4px' }}>1</span>}
            </button>
            <button
              onClick={() => setAdminSubTab('problem_creator')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: adminSubTab === 'problem_creator' ? 'var(--line-active)' : 'transparent',
                color: adminSubTab === 'problem_creator' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Problem Creator &amp; Subtasks
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- SUB-TAB 1: DISCREPANCY QUEUE ----------------- */}
      {adminSubTab === 'discrepancy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {hasDiscrepancy ? (
            <div className="card" style={{ padding: '24px 28px', borderLeft: '4px solid #F43F5E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="mono" style={{ fontSize: '12px', color: '#F43F5E', fontWeight: 700 }}>
                      ⚠️ VERIFICATION DIVERGENCE FLAGGED #DISC-8841
                    </span>
                    <span className="badge badge-wrong">Pending Resolution</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    Alex Code (@alex_code) — Problem A: Dynamic Prefix Range Sum
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Primary Engine (Judge0) produced <strong>Accepted (100 pts)</strong>, while Secondary Audit Engine (Piston) timed out on Subtask 3 with <strong>TLE (70 pts)</strong>.
                  </div>
                </div>

                <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)', background: 'var(--bg-deep)', padding: '6px 12px', borderRadius: 'var(--r-sm)' }}>
                  Contest #14 · Impact on Rank: #2 ↔ #4
                </div>
              </div>

              {/* Side-by-Side Engine Execution Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                
                {/* Engine 1: Judge0 */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#10B981' }}>
                      Primary Pool: Judge0 (Worker #4)
                    </div>
                    <span className="badge badge-accepted">Verdict: Accepted (100)</span>
                  </div>
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Time: 1,420 ms (Limit: 1,500 ms)</div>
                    <div>Memory: 184 MB (Limit: 256 MB)</div>
                    <div>Subtask 1: Passed (20/20)</div>
                    <div>Subtask 2: Passed (50/50)</div>
                    <div>Subtask 3: Passed (30/30)</div>
                  </div>
                </div>

                {/* Engine 2: Piston */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#F43F5E' }}>
                      Audit Pool: Piston (Worker #2)
                    </div>
                    <span className="badge badge-wrong">Verdict: TLE (70)</span>
                  </div>
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Time: 1,518 ms (Limit: 1,500 ms)</div>
                    <div>Memory: 188 MB (Limit: 256 MB)</div>
                    <div>Subtask 1: Passed (20/20)</div>
                    <div>Subtask 2: Passed (50/50)</div>
                    <div>Subtask 3: <strong style={{ color: '#F43F5E' }}>TLE (0/30)</strong> (+18ms variance)</div>
                  </div>
                </div>

              </div>

              {/* Resolution Form */}
              <div style={{
                marginTop: '20px',
                paddingTop: '18px',
                borderTop: '1px solid var(--line-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)', display: 'block', marginBottom: '6px' }}>
                    Select Authorized Resolution Decision:
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="resDecision"
                        checked={selectedResolution === 'accept_primary'}
                        onChange={() => setSelectedResolution('accept_primary')}
                      />
                      Accept Primary Verdict (Judge0 100 pts) — Jitter Allowance
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="resDecision"
                        checked={selectedResolution === 'accept_verification'}
                        onChange={() => setSelectedResolution('accept_verification')}
                      />
                      Apply Strict Audit Verdict (Piston 70 pts TLE)
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>
                    Arbiter Audit Notes:
                  </label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    style={{ width: '100%', fontSize: '12.5px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={handleResolveDiscrepancy}
                    disabled={isResolving}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    {isResolving ? 'Finalizing Consensus...' : 'Resolve Discrepancy & Finalize Contest Standings'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={26} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                All Discrepancies Successfully Resolved
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Contest #14 final standings verified across both Judge0 and Piston execution clusters.
              </p>
              <button
                onClick={() => setHasDiscrepancy(true)}
                className="btn-secondary"
                style={{ marginTop: '16px', fontSize: '12px' }}
              >
                Reset Discrepancy Demo
              </button>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SUB-TAB 2: PROBLEM CREATOR & SUBTASK CONFIGURATION ----------------- */}
      {adminSubTab === 'problem_creator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          {/* Left: General Settings & 3-Way Grading */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '16px' }}>
              Problem Metadata &amp; Engine Pipeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Problem Title</label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Difficulty Tier</label>
                  <select
                    value={problemDifficulty}
                    onChange={(e) => setProblemDifficulty(e.target.value)}
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    <option value="easy">Easy (10-30 pts)</option>
                    <option value="medium">Medium (40-60 pts)</option>
                    <option value="hard">Hard (70-100 pts)</option>
                    <option value="expert">Expert (120-200 pts)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Grading Pipeline</label>
                  <select
                    value={gradingType}
                    onChange={(e) => setGradingType(e.target.value)}
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    <option value="standard_diff">Standard Diff Output</option>
                    <option value="custom_checker">Custom Checker (testlib.h)</option>
                    <option value="subtask_ioi">Subtask IOI (Partial Points)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Time Limit (ms)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Custom checker code if selected */}
              {gradingType === 'custom_checker' && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>testlib.h Checker Code</label>
                  <textarea
                    value={checkerCode}
                    onChange={(e) => setCheckerCode(e.target.value)}
                    style={{ width: '100%', height: '120px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Subtasks Point Allocation */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                  Subtasks Allocation
                </h3>
                <span className="mono" style={{ fontSize: '11px', color: isPointsValid ? '#10B981' : '#F43F5E' }}>
                  Total Points: {totalSubtaskPoints} / 100 {isPointsValid ? '✓' : '(Must equal 100)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {subtasks.map((st, idx) => (
                <div
                  key={st.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#818CF8' }}>{st.title}</span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B' }}>
                      {st.points} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>{st.description}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ marginTop: '16px', justifyContent: 'center' }}>
              Publish Problem to Catalog
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
