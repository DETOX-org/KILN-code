'use client';

import React from 'react';
import { Flame, Trophy, Target, Zap, Clock, ArrowRight, Award, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export default function DashboardView({ onSelectProblem, onOpenContests, onOpenCourses }) {
  // Activity heatmap 52 weeks generation (simulated)
  const weeks = 28; // display 28 weeks
  const daysPerWeek = 7;
  
  const heatmapData = Array.from({ length: weeks }, (_, wIdx) => {
    return Array.from({ length: daysPerWeek }, (_, dIdx) => {
      // simulate realistic coding bursts
      const count = (wIdx * 7 + dIdx) % 5 === 0 ? 4 : (wIdx + dIdx) % 3 === 0 ? 2 : (wIdx * 3 + dIdx) % 7 === 0 ? 1 : 0;
      return count;
    });
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ----------------- TODAY'S CHALLENGE HERO CARD ----------------- */}
      <div className="card" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: 'var(--glow-indigo)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-ai">
                <Sparkles size={12} /> TODAY'S DAILY CHALLENGE
              </span>
              <span className="badge badge-pending">Medium</span>
              <span style={{ fontSize: '12px', color: '#F59E0B', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                +50 XP &amp; +1 Streak Day
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.3px', margin: '4px 0 8px' }}>
              Maximum Subarray Sum with Modulo K
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
              Find the maximum possible contiguous subarray sum modulo K in <code>O(N log N)</code> time using self-balancing binary search trees.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                <Clock size={14} color="#38BDF8" /> Expires in <strong>04h 22m 15s</strong>
              </div>
              <span style={{ color: 'var(--line-strong)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--status-accepted)' }}>
                ✓ Solved by 1,284 competitors today
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => onSelectProblem({ title: 'Maximum Subarray Sum with Modulo K', id: 142 })}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 700 }}
            >
              Solve Challenge Now <ArrowRight size={15} />
            </button>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              Integrated with Judge0 Docker sandbox
            </span>
          </div>
        </div>
      </div>

      {/* ----------------- METRICS ROW (4 KEY CARDS) ----------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Solved */}
        <div className="card card-interactive" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              PROBLEMS SOLVED
            </span>
            <Target size={16} color="#38BDF8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)' }}>
              142
            </span>
            <span className="mono" style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              / 450 (31.5%)
            </span>
          </div>
          {/* Difficulty breakdown mini bar */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '4px', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '45%', background: '#10B981' }} title="Easy: 64" />
            <div style={{ width: '43%', background: '#F59E0B' }} title="Medium: 62" />
            <div style={{ width: '12%', background: '#F43F5E' }} title="Hard: 16" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#10B981' }}>Easy: 64</span>
            <span style={{ color: '#F59E0B' }}>Med: 62</span>
            <span style={{ color: '#F43F5E' }}>Hard: 16</span>
          </div>
        </div>

        {/* Card 2: Contest Rating & League */}
        <div className="card card-interactive" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              CONTEST RATING
            </span>
            <Trophy size={16} color="#F59E0B" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B' }}>
              1,842
            </span>
            <span className="badge badge-accepted" style={{ fontSize: '10.5px' }}>
              Platinum Tier
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '10px' }}>
            Global Rank: <strong>#1,284</strong> (Top 4.2% percentile)
          </div>
        </div>

        {/* Card 3: Daily Streak */}
        <div className="card card-interactive" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              ACTIVE STREAK
            </span>
            <Flame size={18} color="#F97316" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '26px', fontWeight: 800, color: '#F97316' }}>
              7 Days
            </span>
            <span style={{ fontSize: '14px' }}>🔥</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '10px' }}>
            1.25x XP Multiplier Active · Keep practicing today!
          </div>
        </div>

        {/* Card 4: Execution Efficiency */}
        <div className="card card-interactive" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              ACCURACY &amp; RUNTIME
            </span>
            <Zap size={16} color="#818CF8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '26px', fontWeight: 800, color: '#818CF8' }}>
              78.4%
            </span>
            <span className="mono" style={{ fontSize: '12px', color: 'var(--status-accepted)' }}>
              (Avg 38ms)
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '10px' }}>
            Beats <strong>84.2%</strong> of submitted algorithmic solutions
          </div>
        </div>

      </div>

      {/* ----------------- TWO COLUMN SPLIT: HEATMAP & RECOMMENDATIONS ----------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        
        {/* LEFT: 52-Week Submission Activity Heatmap */}
        <div className="card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--status-accepted)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                Algorithmic Activity &amp; Consistency Heatmap
              </h3>
            </div>
            <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
              248 submissions in the last 6 months
            </span>
          </div>

          {/* GitHub-style matrix */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
            {heatmapData.map((week, w) => (
              <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((count, d) => {
                  let cellBg = 'rgba(255, 255, 255, 0.04)';
                  if (count === 1) cellBg = 'rgba(16, 185, 129, 0.3)';
                  if (count === 2) cellBg = 'rgba(16, 185, 129, 0.6)';
                  if (count >= 4) cellBg = '#10B981';

                  return (
                    <div
                      key={d}
                      title={`Week ${w + 1}, Day ${d + 1}: ${count} submissions`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2.5px',
                        background: cellBg,
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Learn how consistency compounds into ICPC/IOI readiness</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Less</span>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.3)' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.6)' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10B981' }} />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Personalized Algorithmic Recommendations */}
        <div className="card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={16} color="#818CF8" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                Algorithmic Recommendations
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)', margin: '0 0 14px' }}>
              Generated by diagnostic performance on graphs and tree queries:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                onClick={() => onSelectProblem({ title: 'Shortest Path in Directed Acyclic Graph', id: 88 })}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line-subtle)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                    Topological DAG Execution
                  </span>
                  <span className="badge badge-wrong" style={{ fontSize: '10px' }}>Hard</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  Target weakness: Graph dynamic programming
                </div>
              </div>

              <div
                onClick={() => onSelectProblem({ title: 'Container With Most Water', id: 104 })}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line-subtle)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                    Container With Most Water
                  </span>
                  <span className="badge badge-pending" style={{ fontSize: '10px' }}>Medium</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  Reinforce: Two-pointer geometric invariants
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onOpenCourses()}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
            >
              <BookOpen size={13} /> View Learning Paths
            </button>
            <button
              onClick={() => onOpenContests()}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
            >
              <Trophy size={13} /> Contest Arena
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
