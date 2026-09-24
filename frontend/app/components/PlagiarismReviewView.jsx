'use client';

import React, { useState } from 'react';
import { GitCompare, AlertOctagon, CheckCircle2, Sliders, ShieldAlert, Cpu, ArrowRightLeft, FileCode } from 'lucide-react';

export default function PlagiarismReviewView() {
  const [selectedPair, setSelectedPair] = useState('pair_1');
  const [syncScroll, setSyncScroll] = useState(true);
  const [reviewVerdict, setReviewVerdict] = useState(null); // 'flagged' | 'cleared'

  const pairs = {
    pair_1: {
      studentA: { name: 'Jordan K.', handle: '@jordan_k', submissionId: 'sub-94812', timestamp: '14:22:04' },
      studentB: { name: 'Dev M.', handle: '@dev_m', submissionId: 'sub-94829', timestamp: '14:23:41' },
      overallSimilarity: 91.4,
      tokenMatch: 94.2,
      astMatch: 91.8,
      variableRenaming: 89.0,
      reason: 'Type-III Structural Similarity (MOSS/JPlag AST match with renamed identifiers and transformed for-to-while constructs)',
      codeA: [
        { num: 1, text: '// Student A Solution - Jordan K.', highlight: false },
        { num: 2, text: '#include <vector>', highlight: false },
        { num: 3, text: 'using namespace std;', highlight: false },
        { num: 4, text: '', highlight: false },
        { num: 5, text: 'int maxSubArrayLen(vector<int>& nums, int k) {', highlight: true, matchType: 'ast' },
        { num: 6, text: '    unordered_map<int, int> prefix_map;', highlight: true, matchType: 'ast' },
        { num: 7, text: '    prefix_map[0] = -1;', highlight: true, matchType: 'ast' },
        { num: 8, text: '    int running_sum = 0, max_len = 0;', highlight: true, matchType: 'ast' },
        { num: 9, text: '    for (int i = 0; i < nums.size(); ++i) {', highlight: true, matchType: 'ast' },
        { num: 10, text: '        running_sum += nums[i];', highlight: true, matchType: 'ast' },
        { num: 11, text: '        if (prefix_map.count(running_sum - k)) {', highlight: true, matchType: 'ast' },
        { num: 12, text: '            max_len = max(max_len, i - prefix_map[running_sum - k]);', highlight: true, matchType: 'ast' },
        { num: 13, text: '        }', highlight: true, matchType: 'ast' },
        { num: 14, text: '        if (!prefix_map.count(running_sum)) {', highlight: true, matchType: 'ast' },
        { num: 15, text: '            prefix_map[running_sum] = i;', highlight: true, matchType: 'ast' },
        { num: 16, text: '        }', highlight: true, matchType: 'ast' },
        { num: 17, text: '    }', highlight: true, matchType: 'ast' },
        { num: 18, text: '    return max_len;', highlight: true, matchType: 'ast' },
        { num: 19, text: '}', highlight: false }
      ],
      codeB: [
        { num: 1, text: '// Student B Solution - Dev M. (Renamed vars)', highlight: false },
        { num: 2, text: '#include <unordered_map>', highlight: false },
        { num: 3, text: '#include <vector>', highlight: false },
        { num: 4, text: 'using namespace std;', highlight: false },
        { num: 5, text: 'int maxSubArrayLen(vector<int>& arr, int target) {', highlight: true, matchType: 'ast' },
        { num: 6, text: '    unordered_map<int, int> lookup;', highlight: true, matchType: 'ast' },
        { num: 7, text: '    lookup[0] = -1;', highlight: true, matchType: 'ast' },
        { num: 8, text: '    int cur_acc = 0, longest = 0;', highlight: true, matchType: 'ast' },
        { num: 9, text: '    int idx = 0;', highlight: true, matchType: 'ast' },
        { num: 10, text: '    while (idx < arr.size()) {', highlight: true, matchType: 'ast' },
        { num: 11, text: '        cur_acc += arr[idx];', highlight: true, matchType: 'ast' },
        { num: 12, text: '        if (lookup.find(cur_acc - target) != lookup.end()) {', highlight: true, matchType: 'ast' },
        { num: 13, text: '            longest = max(longest, idx - lookup[cur_acc - target]);', highlight: true, matchType: 'ast' },
        { num: 14, text: '        }', highlight: true, matchType: 'ast' },
        { num: 15, text: '        if (lookup.find(cur_acc) == lookup.end()) {', highlight: true, matchType: 'ast' },
        { num: 16, text: '            lookup[cur_acc] = idx;', highlight: true, matchType: 'ast' },
        { num: 17, text: '        }', highlight: true, matchType: 'ast' },
        { num: 18, text: '        idx++;', highlight: true, matchType: 'ast' },
        { num: 19, text: '    }', highlight: true, matchType: 'ast' },
        { num: 20, text: '    return longest;', highlight: true, matchType: 'ast' },
        { num: 21, text: '}', highlight: false }
      ]
    },
    pair_2: {
      studentA: { name: 'Jordan K.', handle: '@jordan_k', submissionId: 'sub-94812', timestamp: '14:22:04' },
      studentB: { name: 'Sarah L.', handle: '@sarah_l', submissionId: 'sub-94801', timestamp: '14:15:19' },
      overallSimilarity: 12.8,
      tokenMatch: 14.5,
      astMatch: 11.2,
      variableRenaming: 8.0,
      reason: 'Independent Implementation (Clean divergence across data structures and algorithmic technique)',
      codeA: [
        { num: 1, text: '// Hashmap prefix sum approach', highlight: false },
        { num: 2, text: 'int solve(vector<int>& a) { return a.size(); }', highlight: false }
      ],
      codeB: [
        { num: 1, text: '// Binary indexed tree / Fenwick approach', highlight: false },
        { num: 2, text: 'int solve(vector<int>& b) { return 0; }', highlight: false }
      ]
    }
  };

  const current = pairs[selectedPair];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-wrong">
                <AlertOctagon size={12} />
                AST Structural Similarity &amp; MOSS Analyzer
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Spec §10 &amp; §16 Implementation</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Pairwise Code Similarity &amp; Plagiarism Investigation
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Investigative heat-map diff editor comparing Abstract Syntax Tree trees, variable rename patterns, and token normalization.
            </p>
          </div>

          {/* Pair Selector */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-subtle)' }}>
            <button
              onClick={() => { setSelectedPair('pair_1'); setReviewVerdict(null); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: selectedPair === 'pair_1' ? '#F43F5E' : 'transparent',
                color: selectedPair === 'pair_1' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              @jordan_k ↔ @dev_m (91.4% Match)
            </button>
            <button
              onClick={() => { setSelectedPair('pair_2'); setReviewVerdict(null); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: selectedPair === 'pair_2' ? 'var(--line-active)' : 'transparent',
                color: selectedPair === 'pair_2' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              @jordan_k ↔ @sarah_l (12.8% Match)
            </button>
          </div>
        </div>

        {/* Similarity Score Breakdown Strip */}
        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: current.overallSimilarity > 75 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${current.overallSimilarity > 75 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 'var(--r-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>OVERALL COMPOSITE</div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: current.overallSimilarity > 75 ? '#F43F5E' : '#10B981',
              marginTop: '2px'
            }}>
              {current.overallSimilarity}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              {current.overallSimilarity > 75 ? 'High Plagiarism Risk' : 'Normal Variance'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line-subtle)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>TOKEN SIMILARITY</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '2px' }}>
              {current.tokenMatch}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>Normalized lexer tokens</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line-subtle)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>AST FLOW OVERLAP</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#A855F7', marginTop: '2px' }}>
              {current.astMatch}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>Identical control structures</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line-subtle)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>VARIABLE RENAMING</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: '2px' }}>
              {current.variableRenaming}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>Systematic substitution flag</div>
          </div>
        </div>

        {/* Investigation Note */}
        <div style={{
          marginTop: '16px',
          background: 'var(--bg-deep)',
          border: '1px solid var(--line-subtle)',
          borderRadius: 'var(--r-sm)',
          padding: '10px 14px',
          fontSize: '12.5px',
          color: 'var(--ink-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} color="#F59E0B" flexShrink={0} />
          <span><strong>Investigative Signal:</strong> {current.reason}. Per spec policy, plagiarism metrics are an investigative guide; human review is required.</span>
        </div>
      </div>

      {/* Side-by-Side Dual Monaco Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* STUDENT A PANE */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--line-subtle)' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-primary)' }}>
                {current.studentA.name}
              </span>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)', marginLeft: '6px' }}>
                ({current.studentA.handle})
              </span>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
              {current.studentA.submissionId} · {current.studentA.timestamp}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-deep)',
            border: '1px solid var(--line-subtle)',
            borderRadius: 'var(--r-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            overflowX: 'auto',
            maxHeight: '440px',
            overflowY: 'auto'
          }}>
            {current.codeA.map((line) => (
              <div
                key={line.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 10px',
                  background: line.highlight ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  borderLeft: line.highlight ? '3px solid #F43F5E' : '3px solid transparent',
                  color: line.highlight ? '#FFE4E6' : 'var(--ink-secondary)'
                }}
              >
                <span style={{ width: '28px', color: 'var(--ink-faint)', userSelect: 'none', fontSize: '11px' }}>
                  {line.num}
                </span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STUDENT B PANE */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--line-subtle)' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-primary)' }}>
                {current.studentB.name}
              </span>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)', marginLeft: '6px' }}>
                ({current.studentB.handle})
              </span>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
              {current.studentB.submissionId} · {current.studentB.timestamp}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-deep)',
            border: '1px solid var(--line-subtle)',
            borderRadius: 'var(--r-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            overflowX: 'auto',
            maxHeight: '440px',
            overflowY: 'auto'
          }}>
            {current.codeB.map((line) => (
              <div
                key={line.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 10px',
                  background: line.highlight ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  borderLeft: line.highlight ? '3px solid #F43F5E' : '3px solid transparent',
                  color: line.highlight ? '#FFE4E6' : 'var(--ink-secondary)'
                }}
              >
                <span style={{ width: '28px', color: 'var(--ink-faint)', userSelect: 'none', fontSize: '11px' }}>
                  {line.num}
                </span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Human Review Decision Action Bar */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
            Instructor Review Verdict:
          </span>
          {reviewVerdict ? (
            <span className={reviewVerdict === 'flagged' ? 'badge badge-wrong' : 'badge badge-accepted'}>
              {reviewVerdict === 'flagged' ? '⚠️ Confirmed Plagiarism & Escalated' : '✓ Cleared as Permissible / False Positive'}
            </span>
          ) : (
            <span style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>
              Awaiting Instructor Action
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setReviewVerdict('cleared')}
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '8px 16px' }}
          >
            <CheckCircle2 size={15} color="#10B981" /> Dismiss as False Positive
          </button>
          <button
            onClick={() => setReviewVerdict('flagged')}
            className="btn-primary"
            style={{
              fontSize: '12.5px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
              boxShadow: '0 2px 10px rgba(244, 63, 94, 0.35)'
            }}
          >
            <AlertOctagon size={15} /> Confirm &amp; Escalate to Academic Board
          </button>
        </div>
      </div>

    </div>
  );
}
