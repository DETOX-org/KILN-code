'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Cpu, Layers, Activity, Code, Sparkles } from 'lucide-react';

export default function AlgorithmVisualizerView() {
  const [selectedAlgo, setSelectedAlgo] = useState('two_pointers'); // 'two_pointers' | 'binary_search'
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
  const timerRef = useRef(null);

  // Algorithm 1: Container With Most Water (Two Pointers)
  const twoPointersData = {
    title: 'Container With Most Water — Two Pointer O(N) Execution Trace',
    complexity: 'Time: O(N) · Space: O(1)',
    array: [1, 8, 6, 2, 5, 4, 8, 3, 7],
    steps: [
      {
        step: 0,
        left: 0,
        right: 8,
        area: 8,
        maxArea: 8,
        codeLine: 4,
        explanation: 'Initialize left pointer at index 0 (height=1) and right pointer at index 8 (height=7). Width = 8, Area = min(1, 7) * 8 = 8.',
        action: 'Compare heights: height[0] < height[8], advance left pointer (left++)',
        stack: ['maxArea(height=[1, 8, 6, 2, 5, 4, 8, 3, 7])', 'evaluateWindow(left=0, right=8)'],
        vars: { left: 0, right: 8, 'height[left]': 1, 'height[right]': 7, width: 8, current_area: 8, max_area: 8 }
      },
      {
        step: 1,
        left: 1,
        right: 8,
        area: 49,
        maxArea: 49,
        codeLine: 6,
        explanation: 'Left moved to index 1 (height=8), right remains at 8 (height=7). Width = 7, Area = min(8, 7) * 7 = 49. New maximum area found!',
        action: 'Compare heights: height[1] > height[8], advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=8)', 'updateGlobalMax(49)'],
        vars: { left: 1, right: 8, 'height[left]': 8, 'height[right]': 7, width: 7, current_area: 49, max_area: 49 }
      },
      {
        step: 2,
        left: 1,
        right: 7,
        area: 18,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 7 (height=3). Width = 6, Area = min(8, 3) * 6 = 18. Does not exceed maxArea 49.',
        action: 'Compare heights: height[1] > height[7], advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=7)'],
        vars: { left: 1, right: 7, 'height[left]': 8, 'height[right]': 3, width: 6, current_area: 18, max_area: 49 }
      },
      {
        step: 3,
        left: 1,
        right: 6,
        area: 40,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 6 (height=8). Width = 5, Area = min(8, 8) * 5 = 40. High capacity container, but 40 < 49.',
        action: 'Heights are equal (8 == 8). Advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=6)'],
        vars: { left: 1, right: 6, 'height[left]': 8, 'height[right]': 8, width: 5, current_area: 40, max_area: 49 }
      },
      {
        step: 4,
        left: 1,
        right: 5,
        area: 16,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 5 (height=4). Width = 4, Area = min(8, 4) * 4 = 16.',
        action: 'Compare heights: height[1] > height[5], advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=5)'],
        vars: { left: 1, right: 5, 'height[left]': 8, 'height[right]': 4, width: 4, current_area: 16, max_area: 49 }
      },
      {
        step: 5,
        left: 1,
        right: 4,
        area: 15,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 4 (height=5). Width = 3, Area = min(8, 5) * 3 = 15.',
        action: 'Advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=4)'],
        vars: { left: 1, right: 4, 'height[left]': 8, 'height[right]': 5, width: 3, current_area: 15, max_area: 49 }
      },
      {
        step: 6,
        left: 1,
        right: 3,
        area: 4,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 3 (height=2). Width = 2, Area = min(8, 2) * 2 = 4.',
        action: 'Advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=3)'],
        vars: { left: 1, right: 3, 'height[left]': 8, 'height[right]': 2, width: 2, current_area: 4, max_area: 49 }
      },
      {
        step: 7,
        left: 1,
        right: 2,
        area: 6,
        maxArea: 49,
        codeLine: 8,
        explanation: 'Right moved to index 2 (height=6). Width = 1, Area = min(8, 6) * 1 = 6.',
        action: 'Advance right pointer (right--)',
        stack: ['maxArea(height=[...])', 'evaluateWindow(left=1, right=2)'],
        vars: { left: 1, right: 2, 'height[left]': 8, 'height[right]': 6, width: 1, current_area: 6, max_area: 49 }
      },
      {
        step: 8,
        left: 1,
        right: 1,
        area: 0,
        maxArea: 49,
        codeLine: 12,
        explanation: 'Pointers meet at index 1 (left == right). Loop terminates. Global optimal solution is 49.',
        action: 'Return optimal answer max_area = 49',
        stack: ['maxArea(height=[...])', 'return max_area (49)'],
        vars: { left: 1, right: 1, 'height[left]': 8, 'height[right]': 8, width: 0, current_area: 0, max_area: 49 }
      }
    ],
    codeSnippets: [
      'int maxArea(vector<int>& height) {',
      '    int left = 0, right = height.size() - 1;',
      '    int max_area = 0;',
      '    while (left < right) {',
      '        int current_area = min(height[left], height[right]) * (right - left);',
      '        max_area = max(max_area, current_area);',
      '        if (height[left] < height[right]) {',
      '            left++;',
      '        } else {',
      '            right--;',
      '        }',
      '    }',
      '    return max_area;',
      '}'
    ]
  };

  // Algorithm 2: Binary Search
  const binarySearchData = {
    title: 'Binary Search in Sorted Array — Logarithmic Execution Trace',
    complexity: 'Time: O(log N) · Space: O(1)',
    array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    target: 23,
    steps: [
      {
        step: 0,
        low: 0,
        high: 9,
        mid: 4,
        codeLine: 3,
        explanation: 'Initial search space: low=0 (val=2), high=9 (val=91). Mid = (0 + 9) / 2 = 4 (val=16). Target is 23.',
        action: 'nums[mid]=16 < target=23. Narrow search window to right half: low = mid + 1 = 5.',
        stack: ['binarySearch(nums, target=23)', 'searchWindow(low=0, high=9)'],
        vars: { low: 0, high: 9, mid: 4, 'nums[mid]': 16, target: 23 }
      },
      {
        step: 1,
        low: 5,
        high: 9,
        mid: 7,
        codeLine: 4,
        explanation: 'Low moved to 5 (val=23), high=9 (val=91). Mid = (5 + 9) / 2 = 7 (val=56).',
        action: 'nums[mid]=56 > target=23. Narrow search window to left half: high = mid - 1 = 6.',
        stack: ['binarySearch(nums, target=23)', 'searchWindow(low=5, high=9)'],
        vars: { low: 5, high: 9, mid: 7, 'nums[mid]': 56, target: 23 }
      },
      {
        step: 2,
        low: 5,
        high: 6,
        mid: 5,
        codeLine: 5,
        explanation: 'Low=5 (val=23), high=6 (val=38). Mid = (5 + 6) / 2 = 5 (val=23).',
        action: 'nums[mid]=23 == target=23. Match found at index 5!',
        stack: ['binarySearch(nums, target=23)', 'matchFound(index=5)'],
        vars: { low: 5, high: 6, mid: 5, 'nums[mid]': 23, target: 23, status: 'MATCH_FOUND' }
      }
    ],
    codeSnippets: [
      'int binarySearch(vector<int>& nums, int target) {',
      '    int low = 0, high = nums.size() - 1;',
      '    while (low <= high) {',
      '        int mid = low + (high - low) / 2;',
      '        if (nums[mid] == target) return mid;',
      '        else if (nums[mid] < target) low = mid + 1;',
      '        else high = mid - 1;',
      '    }',
      '    return -1;',
      '}'
    ]
  };

  const activeData = selectedAlgo === 'two_pointers' ? twoPointersData : binarySearchData;
  const currentStepData = activeData.steps[currentStep] || activeData.steps[0];
  const maxSteps = activeData.steps.length - 1;

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, maxSteps]);

  const handleStepChange = (newStep) => {
    setCurrentStep(Math.max(0, Math.min(maxSteps, newStep)));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Control Strip */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span className="badge badge-ai">
                <Sparkles size={12} />
                AST Execution Tracer &amp; Memory Inspector
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Spec §8 Implementation</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              {activeData.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--status-cyan)' }}>
                {activeData.complexity}
              </span>
              <span style={{ color: 'var(--line-strong)' }}>•</span>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                Step {currentStep + 1} of {activeData.steps.length}
              </span>
            </div>
          </div>

          {/* Algorithm Selector Buttons */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-subtle)' }}>
            <button
              onClick={() => { setSelectedAlgo('two_pointers'); setCurrentStep(0); setIsPlaying(false); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: selectedAlgo === 'two_pointers' ? 'var(--line-active)' : 'transparent',
                color: selectedAlgo === 'two_pointers' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Two Pointers (Container)
            </button>
            <button
              onClick={() => { setSelectedAlgo('binary_search'); setCurrentStep(0); setIsPlaying(false); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: selectedAlgo === 'binary_search' ? 'var(--line-active)' : 'transparent',
                color: selectedAlgo === 'binary_search' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Binary Search
            </button>
          </div>
        </div>

        {/* Scrubbable Timeline Slider */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handleStepChange(0)}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Reset to Step 0"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={currentStep === 0}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Step Backward"
              >
                <SkipBack size={13} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                {isPlaying ? 'Pause' : 'Play Simulation'}
              </button>
              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={currentStep === maxSteps}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Step Forward"
              >
                <SkipForward size={13} />
              </button>
            </div>

            {/* Playback speed buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>Speed:</span>
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    background: playbackSpeed === spd ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-surface)',
                    color: playbackSpeed === spd ? '#818CF8' : 'var(--ink-muted)',
                    border: '1px solid var(--line-subtle)'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min={0}
              max={maxSteps}
              value={currentStep}
              onChange={(e) => handleStepChange(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#6366F1',
                height: '6px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Start (Entry AST)</span>
            <span>Current: Step {currentStep + 1}</span>
            <span>Termination (O(N) Reached)</span>
          </div>
        </div>
      </div>

      {/* Main Visual Stage & Details Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN: Animated Data Structure Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Animated Array Bars */}
          <div className="card" style={{ padding: '24px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--status-accepted)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-secondary)' }}>
                  DOM Memory Geometric Transformation (Abstract Syntax Tree Driven)
                </span>
              </div>
              <span className="badge badge-accepted">
                Active Memory State
              </span>
            </div>

            {/* Visual Bar Chart for Container Problem */}
            {selectedAlgo === 'two_pointers' ? (
              <div style={{ marginTop: '20px', padding: '16px 0', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', height: '200px', borderBottom: '2px solid var(--line-strong)' }}>
                  {activeData.array.map((val, idx) => {
                    const isLeft = currentStepData.left === idx;
                    const isRight = currentStepData.right === idx;
                    const isBetween = idx >= currentStepData.left && idx <= currentStepData.right;
                    const heightPercent = (val / 9) * 100;

                    let barColor = 'rgba(255, 255, 255, 0.15)';
                    if (isLeft) barColor = 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)';
                    else if (isRight) barColor = 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)';
                    else if (isBetween) barColor = 'rgba(99, 102, 241, 0.2)';

                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          position: 'relative'
                        }}
                      >
                        {/* Pointer Badge Floating Above */}
                        {isLeft && (
                          <div style={{
                            position: 'absolute',
                            top: `${180 - heightPercent * 1.8 - 32}px`,
                            background: '#6366F1',
                            color: '#fff',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.5)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}>
                            L={idx}
                          </div>
                        )}
                        {isRight && (
                          <div style={{
                            position: 'absolute',
                            top: `${180 - heightPercent * 1.8 - 32}px`,
                            background: '#0EA5E9',
                            color: '#fff',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.5)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}>
                            R={idx}
                          </div>
                        )}

                        {/* Value on top of bar */}
                        <span style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: (isLeft || isRight) ? '#fff' : 'var(--ink-muted)',
                          marginBottom: '4px',
                          fontWeight: (isLeft || isRight) ? 700 : 400
                        }}>
                          {val}
                        </span>

                        {/* The animated vertical bar */}
                        <div
                          style={{
                            width: '100%',
                            height: `${heightPercent}%`,
                            background: barColor,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.35s ease, background 0.25s ease',
                            border: (isLeft || isRight) ? '1px solid #fff' : '1px solid transparent'
                          }}
                        />

                        {/* Index below bar */}
                        <span style={{
                          marginTop: '6px',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          color: (isLeft || isRight) ? '#F8FAFC' : 'var(--ink-faint)',
                          fontWeight: (isLeft || isRight) ? 700 : 400
                        }}>
                          [{idx}]
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Shaded Area Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--r-md)',
                  padding: '10px 16px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>Calculated Window:</span>
                    <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: '#38BDF8' }}>
                      Width = {currentStepData.vars.width} · MinHeight = {Math.min(currentStepData.vars['height[left]'], currentStepData.vars['height[right]'])}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>Window Area:</span>
                    <span className="mono" style={{ fontSize: '15px', fontWeight: 700, color: '#10B981' }}>
                      {currentStepData.area}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                      (Global Max: {currentStepData.maxArea})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Binary search visual */
              <div style={{ marginTop: '20px', padding: '16px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
                  {activeData.array.map((val, idx) => {
                    const isMid = currentStepData.mid === idx;
                    const inRange = idx >= currentStepData.low && idx <= currentStepData.high;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '14px 4px',
                          borderRadius: '8px',
                          background: isMid ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : inRange ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: isMid ? '2px solid #fff' : inRange ? '1px solid rgba(99, 102, 241, 0.3)' : '1px dashed rgba(255,255,255,0.06)',
                          opacity: inRange ? 1 : 0.35,
                          transition: 'all 0.3s'
                        }}
                      >
                        <span style={{ fontSize: '10px', color: isMid ? '#fff' : 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                          {isMid ? 'MID' : idx === currentStepData.low ? 'LOW' : idx === currentStepData.high ? 'HIGH' : `[${idx}]`}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: isMid ? '#fff' : 'var(--ink-primary)', marginTop: '4px' }}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation box */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--line-subtle)',
              padding: '14px 18px',
              marginTop: '16px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--status-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '4px' }}>
                CURRENT STEP ACTION:
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-primary)', margin: 0, lineHeight: 1.5 }}>
                {currentStepData.explanation}
              </p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-ai" style={{ fontSize: '11px' }}>
                  Next Transition → {currentStepData.action}
                </span>
              </div>
            </div>
          </div>

          {/* Variable State Machine & Memory Dump */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Cpu size={16} color="var(--status-cyan)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
                Live Stack Frame &amp; Variable Memory Inspector
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {Object.entries(currentStepData.vars).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 12px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{key}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Synchronized Code Execution & Call Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Synchronized Source Code */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={16} color="var(--line-active)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Active Execution Pointer (AST Map)
                </span>
              </div>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                Line {currentStepData.codeLine + 1}
              </span>
            </div>

            <div style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--line-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '12px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              overflowX: 'auto'
            }}>
              {activeData.codeSnippets.map((line, lIdx) => {
                const isCurrent = lIdx === currentStepData.codeLine;
                return (
                  <div
                    key={lIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '3px 12px',
                      background: isCurrent ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid #6366F1' : '3px solid transparent',
                      color: isCurrent ? '#FFFFFF' : 'var(--ink-muted)'
                    }}
                  >
                    <span style={{ width: '28px', color: 'var(--ink-faint)', userSelect: 'none', fontSize: '11px' }}>
                      {lIdx + 1}
                    </span>
                    <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Call Stack */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Layers size={16} color="#A855F7" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
                Runtime Call Stack
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentStepData.stack.map((frame, fIdx) => (
                <div
                  key={fIdx}
                  style={{
                    background: fIdx === currentStepData.stack.length - 1 ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface)',
                    border: fIdx === currentStepData.stack.length - 1 ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: fIdx === currentStepData.stack.length - 1 ? '#E9D5FF' : 'var(--ink-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{frame}</span>
                  {fIdx === currentStepData.stack.length - 1 && (
                    <span style={{ fontSize: '10px', background: '#A855F7', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                      TOP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
