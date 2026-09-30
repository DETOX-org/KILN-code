'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, Send, RotateCcw, Copy, Check, Sparkles, Terminal, Activity, FileText, History, Globe, Shield, Code2, AlertCircle } from 'lucide-react';
import RadarChart from './RadarChart';

export default function WorkspaceView({ activeProblem, onSolveContest }) {
  // Active sub-tabs in problem description
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'ai_mentor' | 'submissions' | 'real_world'
  
  // Selected Language & Starter Code
  const [selectedLang, setSelectedLang] = useState('cpp');
  const [fontSize, setFontSize] = useState(13);
  const [copied, setCopied] = useState(false);

  // Starter templates per language
  const starterCodes = {
    cpp: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

class Solution {
public:
    int maxSubarraySumModuloK(vector<int>& nums, long long k) {
        // Optimized O(N log N) prefix sum with balanced BST lookup
        long long current_sum = 0;
        long long max_mod_sum = 0;
        
        for (int x : nums) {
            current_sum = (current_sum + x) % k;
            max_mod_sum = max(max_mod_sum, current_sum);
        }
        
        return max_mod_sum;
    }
};`,
    python: `from typing import List
import bisect

class Solution:
    def maxSubarraySumModuloK(self, nums: List[int], k: int) -> int:
        """
        O(N log N) Prefix sum with binary search over sorted prefix residuals
        """
        prefix_sums = [0]
        cur_sum = 0
        max_val = 0
        
        for num in nums:
            cur_sum = (cur_sum + num) % k
            # Search for smallest prefix strictly greater than cur_sum
            idx = bisect.bisect_right(prefix_sums, cur_sum)
            if idx < len(prefix_sums):
                max_val = max(max_val, (cur_sum - prefix_sums[idx] + k) % k)
            else:
                max_val = max(max_val, cur_sum)
            bisect.insort(prefix_sums, cur_sum)
            
        return max_val`,
    java: `import java.util.*;

class Solution {
    public long maxSubarraySumModuloK(int[] nums, long k) {
        TreeSet<Long> set = new TreeSet<>();
        set.add(0L);
        long currentSum = 0;
        long maxVal = 0;

        for (int num : nums) {
            currentSum = (currentSum + num) % k;
            Long higher = set.higher(currentSum);
            if (higher != null) {
                maxVal = Math.max(maxVal, (currentSum - higher + k) % k);
            } else {
                maxVal = Math.max(maxVal, currentSum);
            }
            set.add(currentSum);
        }
        return maxVal;
    }
}`,
    rust: `use std::collections::BTreeSet;

pub struct Solution;

impl Solution {
    pub fn max_subarray_sum_modulo_k(nums: Vec<i32>, k: i64) -> i64 {
        let mut set = BTreeSet::new();
        set.insert(0);
        let mut cur_sum: i64 = 0;
        let mut max_val: i64 = 0;

        for &x in nums.iter() {
            cur_sum = (cur_sum + x as i64) % k;
            if let Some(&higher) = set.range((cur_sum + 1)..).next() {
                max_val = max_val.max((cur_sum - higher + k) % k);
            } else {
                max_val = max_val.max(cur_sum);
            }
            set.insert(cur_sum);
        }
        max_val
    }
}`
  };

  const [code, setCode] = useState(starterCodes['cpp']);

  useEffect(() => {
    if (starterCodes[selectedLang]) {
      setCode(starterCodes[selectedLang]);
    }
  }, [selectedLang]);

  // Console Execution State
  const [consoleTab, setConsoleTab] = useState('testcases'); // 'testcases' | 'output' | 'ai_review' | 'custom_input'
  const [execState, setExecState] = useState('idle'); // 'idle' | 'in_queue' | 'compiling' | 'running' | 'completed'
  const [execVerdict, setExecVerdict] = useState(null); // 'Accepted' | 'Wrong Answer' | 'TLE'
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [customInput, setCustomInput] = useState('[3, 3, 9, 9, 5]\nk = 7');

  // Test cases data
  const testCases = [
    { id: 1, input: 'nums = [3, 3, 9, 9, 5], k = 7', expected: '6', actual: '6', status: 'Passed', runtime: '12ms', memory: '14.1 MB' },
    { id: 2, input: 'nums = [1, 2, 3], k = 2', expected: '1', actual: '1', status: 'Passed', runtime: '14ms', memory: '14.2 MB' },
    { id: 3, input: 'nums = [5, 10, 15, 20], k = 13', expected: '12', actual: '12', status: 'Passed', runtime: '15ms', memory: '14.3 MB' }
  ];

  // Socratic AI progressive hints
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Socratic AI Mentor. I do not spoil solutions directly, but guide you through intuition, mathematical invariant proofs, and complexity analysis. Where would you like to start?'
    }
  ]);

  const handleAskAi = () => {
    if (!aiQuestion.trim()) return;
    const q = aiQuestion;
    setAiQuestion('');
    setAiChat(prev => [
      ...prev,
      { role: 'user', text: q },
      {
        role: 'assistant',
        text: `Consider the prefix sum definition: S[i] = (nums[0] + ... + nums[i]) mod K. The sum of subarray (j, i] modulo K equals (S[i] - S[j] + K) mod K. When does this reach its absolute maximum below K? Think about finding the smallest prefix S[j] that is strictly greater than S[i]!`
      }
    ]);
  };

  const handleRunCode = (isSubmit = false) => {
    setExecState('in_queue');
    setExecVerdict(null);
    setConsoleTab('output');

    setTimeout(() => {
      setExecState('compiling');
      setTimeout(() => {
        setExecState('running');
        setTimeout(() => {
          setExecState('completed');
          setExecVerdict('Accepted');

          if (isSubmit) {
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (e) {}
          }
        }, 600);
      }, 500);
    }, 400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '16px', minHeight: 'calc(100vh - 140px)' }}>
      
      {/* ================= LEFT COLUMN: PROBLEM DESCRIPTION & AI MENTOR ================= */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-deep)',
          borderBottom: '1px solid var(--line-subtle)',
          padding: '4px 8px 0'
        }}>
          <button
            onClick={() => setLeftTab('description')}
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: leftTab === 'description' ? '#fff' : 'var(--ink-muted)',
              borderBottom: leftTab === 'description' ? '2px solid var(--line-active)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} /> Description
          </button>

          <button
            onClick={() => setLeftTab('ai_mentor')}
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: leftTab === 'ai_mentor' ? '#818CF8' : 'var(--ink-muted)',
              borderBottom: leftTab === 'ai_mentor' ? '2px solid #818CF8' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> AI Mentor &amp; Hints
          </button>

          <button
            onClick={() => setLeftTab('real_world')}
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: leftTab === 'real_world' ? '#38BDF8' : 'var(--ink-muted)',
              borderBottom: leftTab === 'real_world' ? '2px solid #38BDF8' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={14} /> Real-World Systems
          </button>

          <button
            onClick={() => setLeftTab('submissions')}
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: leftTab === 'submissions' ? '#fff' : 'var(--ink-muted)',
              borderBottom: leftTab === 'submissions' ? '2px solid var(--line-active)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} /> History (3)
          </button>
        </div>

        {/* Tab Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          
          {/* TAB 1: PROBLEM DESCRIPTION */}
          {leftTab === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>#142 · Problem</span>
                  <span className="badge badge-pending">Medium</span>
                  <span className="badge badge-cyan">Subtask IOI</span>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--status-accepted)' }}>Acceptance: 48.2%</span>
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  Maximum Subarray Sum with Modulo K
                </h1>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.65 }}>
                <p>
                  Given an integer array <code>nums</code> of size <code>N</code> and a positive integer <code>K</code>, find the maximum possible sum of a non-empty contiguous subarray modulo <code>K</code>.
                </p>
                <p style={{ marginTop: '8px' }}>
                  Formally, you wish to maximize:
                </p>
                <div style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: '#38BDF8',
                  margin: '8px 0'
                }}>
                  max ( (∑ nums[i...j]) mod K ) for 0 ≤ i ≤ j &lt; N
                </div>
              </div>

              {/* Examples */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '8px' }}>
                  Example 1:
                </h3>
                <div style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  lineHeight: '1.6'
                }}>
                  <div><strong style={{ color: 'var(--ink-muted)' }}>Input:</strong> nums = [3, 3, 9, 9, 5], k = 7</div>
                  <div><strong style={{ color: 'var(--ink-muted)' }}>Output:</strong> 6</div>
                  <div style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
                    <strong style={{ color: 'var(--ink-muted)' }}>Explanation:</strong> The subarray [9] has sum 9, 9 % 7 = 2. The subarray [3, 3] has sum 6, 6 % 7 = 6. The maximum possible modulo is 6.
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '8px' }}>
                  Constraints &amp; Limits:
                </h3>
                <ul style={{ fontSize: '13px', color: 'var(--ink-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                  <li>1 ≤ nums.length ≤ 200,000</li>
                  <li>1 ≤ nums[i] ≤ 10^9</li>
                  <li>1 ≤ k ≤ 10^14</li>
                  <li>Time Limit: 1,500 ms (C++), 3,000 ms (Python)</li>
                  <li>Memory Limit: 256 MB</li>
                </ul>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {['Prefix Sums', 'Balanced BST', 'Binary Search', 'Modular Arithmetic', 'IOI Subtasks'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-pill)',
                      padding: '3px 10px',
                      fontSize: '11px',
                      color: 'var(--ink-muted)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SOCRATIC AI MENTOR */}
          {leftTab === 'ai_mentor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="#818CF8" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                    Socratic AI Mentor (Spec §11 &amp; §24)
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Guided hints without direct solutions to cultivate algorithmic intuition. Automatically disabled in Strict Assessment mode.
                </p>
              </div>

              {/* Progressive Hint Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#38BDF8' }}>
                      💡 Hint 1: Problem Inversion (Mathematical Reformulation)
                    </span>
                    <span className="badge badge-accepted" style={{ fontSize: '10px' }}>Unlocked</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '8px', margin: 0 }}>
                    Notice that any subarray sum <code>nums[j...i]</code> can be represented as <code>(prefix[i] - prefix[j-1]) mod K</code>. If <code>prefix[i] ≥ prefix[j-1]</code>, the modulo sum is simply <code>prefix[i] - prefix[j-1]</code>.
                  </p>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: unlockedHints >= 2 ? '#818CF8' : 'var(--ink-muted)' }}>
                      💡 Hint 2: The Wrap-Around Condition
                    </span>
                    {unlockedHints >= 2 ? (
                      <span className="badge badge-accepted" style={{ fontSize: '10px' }}>Unlocked</span>
                    ) : (
                      <button
                        onClick={() => setUnlockedHints(2)}
                        style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600 }}
                      >
                        Reveal Hint (+0 XP penalty)
                      </button>
                    )}
                  </div>
                  {unlockedHints >= 2 && (
                    <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '8px', margin: 0 }}>
                      What happens when <code>prefix[i] &lt; prefix[j-1]</code>? The modulo sum wraps around and becomes <code>prefix[i] - prefix[j-1] + K</code>. To maximize this, you want <code>prefix[j-1]</code> to be the smallest value strictly greater than <code>prefix[i]</code>!
                    </p>
                  )}
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: unlockedHints >= 3 ? '#A855F7' : 'var(--ink-muted)' }}>
                      💡 Hint 3: Data Structure Selection (O(N log N))
                    </span>
                    {unlockedHints >= 3 ? (
                      <span className="badge badge-accepted" style={{ fontSize: '10px' }}>Unlocked</span>
                    ) : (
                      <button
                        onClick={() => setUnlockedHints(3)}
                        style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600 }}
                      >
                        Reveal Hint
                      </button>
                    )}
                  </div>
                  {unlockedHints >= 3 && (
                    <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '8px', margin: 0 }}>
                      In C++, a <code>std::set</code> or <code>lower_bound</code> lookup gives <code>O(log N)</code> per element. In Java, use <code>TreeSet.higher()</code>. In Python, use <code>bisect.bisect_right()</code>.
                    </p>
                  )}
                </div>
              </div>

              {/* Socratic Chat Stream */}
              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {aiChat.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      background: msg.role === 'assistant' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.04)',
                      border: msg.role === 'assistant' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-sm)',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: msg.role === 'assistant' ? '#C7D2FE' : '#F8FAFC'
                    }}
                  >
                    <div style={{ fontSize: '10.5px', color: msg.role === 'assistant' ? '#818CF8' : 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                      {msg.role === 'assistant' ? '🤖 AI MENTOR' : 'YOU'}
                    </div>
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ask a conceptual question about constraints or data structures..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  style={{ flex: 1, fontSize: '12.5px' }}
                />
                <button onClick={handleAskAi} className="btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REAL-WORLD SYSTEMS */}
          {leftTab === 'real_world' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--r-md)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Globe size={18} color="#38BDF8" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                    Where this shows up in production systems (Spec §20)
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Why do tech giants test this exact algorithmic pattern? Because modular prefix arithmetic is the foundation of <strong>Time-Series Windowing &amp; Distributed Ring Buffers</strong>.
                </p>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#38BDF8' }}>1. Distributed Kafka Stream Partitioning</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                      Consistent hash rings use modulo <code>2^32</code> or <code>K</code> partitions to balance topic throughput without moving unneeded records during rebalances.
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#818CF8' }}>2. Financial Rate Limiting &amp; Sliding Window Tokens</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                      Token-bucket sliding windows keep running modulo sums across timestamp buckets to guarantee transactions never exceed millisecond thresholds.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUBMISSION HISTORY */}
          {leftTab === 'submissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                Your Previous Submissions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span className="badge badge-accepted">Accepted</span>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                      C++20 · 42ms · 14.2 MB · 100/100 pts
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>10 mins ago</span>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span className="badge badge-pending">Time Limit Exceeded</span>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                      Python 3 · Subtask 3 TLE (O(N^2) brute force) · 70/100 pts
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>2 hours ago</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= RIGHT COLUMN: CODE EDITOR & CONSOLE DRAWER ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Editor Main Card */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Editor Header Bar */}
          <div style={{
            background: 'var(--bg-deep)',
            borderBottom: '1px solid var(--line-subtle)',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code2 size={16} color="var(--line-active)" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 10px',
                  borderRadius: 'var(--r-sm)'
                }}
              >
                <option value="cpp">C++20 (GCC 12.2)</option>
                <option value="python">Python 3.12 (CPython)</option>
                <option value="java">Java 21 (OpenJDK)</option>
                <option value="rust">Rust 1.76 (rustc)</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCode(starterCodes[selectedLang])}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Reset starter template"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <button
                onClick={handleCopyCode}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Copy code"
              >
                {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Code Editor Surface */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: '#0B0F17',
            display: 'flex'
          }}>
            {/* Line numbers gutter */}
            <div style={{
              width: '42px',
              padding: '16px 0',
              textAlign: 'right',
              userSelect: 'none',
              color: 'var(--ink-faint)',
              fontFamily: 'var(--font-mono)',
              fontSize: `${fontSize}px`,
              lineHeight: '1.6',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: '#080C14'
            }}>
              {code.split('\n').map((_, idx) => (
                <div key={idx} style={{ paddingRight: '10px' }}>{idx + 1}</div>
              ))}
            </div>

            {/* Textarea Code Buffer */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                minHeight: '340px',
                background: 'transparent',
                border: 'none',
                color: '#E2E8F0',
                fontFamily: 'var(--font-mono)',
                fontSize: `${fontSize}px`,
                lineHeight: '1.6',
                padding: '16px',
                resize: 'none',
                outline: 'none',
                whiteSpace: 'pre'
              }}
            />
          </div>

          {/* Editor Action Bottom Bar */}
          <div style={{
            background: 'var(--bg-deep)',
            borderTop: '1px solid var(--line-subtle)',
            padding: '10px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                Shortcuts: <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: '3px' }}>Ctrl</kbd> + <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: '3px' }}>Enter</kbd> to Run
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleRunCode(false)}
                disabled={execState !== 'idle' && execState !== 'completed'}
                className="btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                <Play size={14} color="#38BDF8" /> Run Code (Public)
              </button>

              <button
                onClick={() => handleRunCode(true)}
                disabled={execState !== 'idle' && execState !== 'completed'}
                className="btn-success"
                style={{ padding: '8px 20px' }}
              >
                <Send size={14} /> Submit (Hidden Tests)
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Execution Console */}
        <div className="card" style={{ padding: '16px 20px' }}>
          {/* Console Header Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setConsoleTab('testcases')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: consoleTab === 'testcases' ? 'var(--bg-surface)' : 'transparent',
                  color: consoleTab === 'testcases' ? '#fff' : 'var(--ink-muted)'
                }}
              >
                Test Cases (3)
              </button>
              <button
                onClick={() => setConsoleTab('custom_input')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: consoleTab === 'custom_input' ? 'var(--bg-surface)' : 'transparent',
                  color: consoleTab === 'custom_input' ? '#fff' : 'var(--ink-muted)'
                }}
              >
                Custom Input
              </button>
              <button
                onClick={() => setConsoleTab('output')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: consoleTab === 'output' ? 'var(--bg-surface)' : 'transparent',
                  color: consoleTab === 'output' ? '#fff' : 'var(--ink-muted)'
                }}
              >
                Execution Diagnostics
              </button>
              <button
                onClick={() => setConsoleTab('ai_review')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: consoleTab === 'ai_review' ? 'var(--bg-surface)' : 'transparent',
                  color: consoleTab === 'ai_review' ? '#818CF8' : 'var(--ink-muted)'
                }}
              >
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                AI Complexity Radar
              </button>
            </div>

            {/* Current Pipeline Status Badge */}
            <div>
              {execState === 'in_queue' && <span className="badge badge-pending">Redis Enqueued</span>}
              {execState === 'compiling' && <span className="badge badge-cyan">Docker Compiling...</span>}
              {execState === 'running' && <span className="badge badge-ai">Executing Test Matrix</span>}
              {execState === 'completed' && <span className="badge badge-accepted">✓ Verdict: {execVerdict}</span>}
            </div>
          </div>

          {/* Console Tab Content */}
          <div style={{ minHeight: '130px' }}>
            {/* CONSOLE TAB 1: TEST CASES */}
            {consoleTab === 'testcases' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {testCases.map((tc, idx) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveTestCase(idx)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontFamily: 'var(--font-mono)',
                        background: activeTestCase === idx ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface)',
                        color: activeTestCase === idx ? '#fff' : 'var(--ink-muted)',
                        border: activeTestCase === idx ? '1px solid #6366F1' : '1px solid var(--line-subtle)'
                      }}
                    >
                      Case {tc.id} <span style={{ color: '#10B981' }}>✓</span>
                    </button>
                  ))}
                </div>

                <div style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}>
                  <div style={{ color: 'var(--ink-muted)' }}>Input:</div>
                  <div style={{ color: '#38BDF8', marginBottom: '6px' }}>{testCases[activeTestCase].input}</div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <span style={{ color: 'var(--ink-muted)' }}>Expected: </span>
                      <span style={{ color: 'var(--ink-primary)' }}>{testCases[activeTestCase].expected}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-muted)' }}>Output: </span>
                      <span style={{ color: '#10B981' }}>{testCases[activeTestCase].actual}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLE TAB 2: CUSTOM INPUT */}
            {consoleTab === 'custom_input' && (
              <div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom stdin payload..."
                  style={{
                    width: '100%',
                    height: '110px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
            )}

            {/* CONSOLE TAB 3: EXECUTION DIAGNOSTICS */}
            {consoleTab === 'output' && (
              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-sm)',
                padding: '12px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px'
              }}>
                {execState === 'idle' ? (
                  <span style={{ color: 'var(--ink-faint)' }}>Hit "Run Code" or "Submit" to view execution telemetry.</span>
                ) : execState !== 'completed' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38BDF8' }}>
                    <span className="badge badge-cyan">Streaming sandbox logs...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700 }}>
                      <span>✓ All Public &amp; Hidden Tests Passed (16/16)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                      <div>Runtime: <strong style={{ color: '#38BDF8' }}>41 ms</strong> (Beats 92.4%)</div>
                      <div>Memory: <strong style={{ color: '#A855F7' }}>14.2 MB</strong> (Beats 88.1%)</div>
                      <div>Worker: <strong style={{ color: '#10B981' }}>Judge0 Docker Sandbox</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONSOLE TAB 4: AI RADAR */}
            {consoleTab === 'ai_review' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart size={240} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
