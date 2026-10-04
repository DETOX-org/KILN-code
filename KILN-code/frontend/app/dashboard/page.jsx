'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Trophy,
  Target,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.displayName || user?.username || 'Student';

  // Activity heatmap 28 weeks (simulated)
  const weeks = 28;
  const daysPerWeek = 7;
  const heatmapData = Array.from({ length: weeks }, (_, wIdx) => {
    return Array.from({ length: daysPerWeek }, (_, dIdx) => {
      return (wIdx * 7 + dIdx) % 5 === 0 ? 4 : (wIdx + dIdx) % 3 === 0 ? 2 : (wIdx * 3 + dIdx) % 7 === 0 ? 1 : 0;
    });
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />

          {/* Clean Dashboard Header per Specification #2 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Welcome, {userName} 👋
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Here is your overview of problems solved, active assignments, and recent contest submissions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/problems" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12.5px', textDecoration: 'none' }}>
                <BookOpen size={14} /> View Problems
              </Link>
              <Link href="/assignments" className="btn-primary" style={{ padding: '8px 18px', fontSize: '12.5px', textDecoration: 'none' }}>
                <ClipboardList size={14} /> View Assignments
              </Link>
            </div>
          </div>

          {/* 3 Overview Stat Cards per Spec #2: Problems Solved, Assignments Active, Rating */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Card 1: Problems Solved */}
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  PROBLEMS SOLVED
                </span>
                <Target size={16} color="#38BDF8" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span className="mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  24 Solved
                </span>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  / 150 Total
                </span>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '3px', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '55%', background: '#10B981' }} title="Easy: 14" />
                <div style={{ width: '35%', background: '#F59E0B' }} title="Medium: 8" />
                <div style={{ width: '10%', background: '#F43F5E' }} title="Hard: 2" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#10B981' }}>Easy: 14</span>
                <span style={{ color: '#F59E0B' }}>Med: 8</span>
                <span style={{ color: '#F43F5E' }}>Hard: 2</span>
              </div>
            </div>

            {/* Card 2: Assignments Active */}
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  ASSIGNMENTS
                </span>
                <ClipboardList size={16} color="#818CF8" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span className="mono" style={{ fontSize: '28px', fontWeight: 800, color: '#818CF8' }}>
                  3 Active
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '12px' }}>
                Next Due: <strong>DSA Assignment 1</strong> (Oct 05)
              </div>
            </div>

            {/* Card 3: Rating & Streak */}
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  RATING &amp; RANK
                </span>
                <Trophy size={16} color="#F59E0B" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span className="mono" style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B' }}>
                  1,248
                </span>
                <span className="badge badge-accepted" style={{ fontSize: '10.5px' }}>
                  Silver Tier
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Streak: <strong>7 Days</strong></span>
                <Flame size={13} color="#F97316" />
                <span style={{ color: 'var(--line-strong)' }}>•</span>
                <span>Global Rank: <strong>#1,284</strong></span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN SECTION: ACTIVE ASSIGNMENTS & RECENT SUBMISSIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Active Assignments */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} color="#38BDF8" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                    Active Assignments
                  </h3>
                </div>
                <Link href="/assignments" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                  View All Assignments →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/assignments/dsa-assignment-1"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 14px',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      DSA Assignment 1
                    </span>
                    <span className="mono" style={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>
                      6/10 Completed
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Linear Arrays &amp; Two Pointers · Due Oct 05
                  </div>
                </Link>

                <Link
                  href="/assignments/algorithms-2"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 14px',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Algorithms Assignment
                    </span>
                    <span className="mono" style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 700 }}>
                      3/8 Completed
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Dynamic Programming &amp; Graphs · Due Oct 10
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                    Recent Submissions
                  </h3>
                </div>
                <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                  Verified by Judge0
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Two Sum Optimal Lookup
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                      C++20 · Runtime 38ms · Memory 14.2 MB
                    </div>
                  </div>
                  <span className="badge badge-accepted">Accepted</span>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Binary Search
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                      Python 3.12 · Runtime 42ms · Memory 11.5 MB
                    </div>
                  </div>
                  <span className="badge badge-accepted">Accepted</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED PROBLEMS ROW & UPCOMING CONTESTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            {/* Recommended Problems */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#818CF8" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                    Recommended Problems
                  </h3>
                </div>
                <Link href="/problems" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                  View All Problems →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Two Sum
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                      Hash Tables &amp; Index Acceleration · Easy · 20 pts
                    </div>
                  </div>
                  <Link href="/problems/two-sum" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '11.5px', textDecoration: 'none' }}>
                    View Problem →
                  </Link>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Container With Most Water
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                      Two-Pointer Geometric Invariants · Medium · 40 pts
                    </div>
                  </div>
                  <Link href="/problems/container-with-most-water" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '11.5px', textDecoration: 'none' }}>
                    View Problem →
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Contests */}
            <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={16} color="#F59E0B" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                      Upcoming Contests
                    </h3>
                  </div>
                  <Link href="/contests" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                    Contests →
                  </Link>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                      Weekly Competitive Match #42
                    </span>
                    <span className="badge badge-ai">Registered</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Starts in: <strong>2d 14h</strong> · 4 Problems · 120 mins
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <Link
                  href="/problems"
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '12px', textDecoration: 'none' }}
                >
                  <BookOpen size={13} /> View Problems
                </Link>
                <Link
                  href="/assignments"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '12px', textDecoration: 'none' }}
                >
                  <ClipboardList size={13} /> View Assignments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
