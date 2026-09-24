'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Flame, ShieldCheck, ArrowUpRight, ArrowDownRight, Award, User, RefreshCw } from 'lucide-react';

export default function ContestArenaView({ onSelectProblem }) {
  const [contestTimer, setContestTimer] = useState(6138); // 01:42:18 in seconds
  const [isLive] = useState(true);

  // Contest Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setContestTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const contestProblems = [
    { id: 'A', title: 'Dynamic Prefix Range Sum', points: 100, solvedCount: 412, status: 'Solved' },
    { id: 'B', title: 'Topological DAG Dependency Scheduler', points: 250, solvedCount: 184, status: 'Attempted' },
    { id: 'C', title: 'Distributed Raft Consensus Election', points: 500, solvedCount: 42, status: 'Unsolved' },
    { id: 'D', title: 'Persistent Treap Matrix Interval', points: 750, solvedCount: 8, status: 'Unsolved' }
  ];

  // Leaderboard data
  const [standings, setStandings] = useState([
    { rank: 1, user: 'Elena Algo', handle: '@elena_algo', solved: 4, score: 1600, penalty: '01:12:44', rankDelta: 0, verified: true, avatar: '👩‍💻' },
    { rank: 2, user: 'Alex Code', handle: '@alex_code', solved: 3, score: 850, penalty: '00:54:12', rankDelta: 2, verified: true, avatar: '👨‍💻' },
    { rank: 3, user: 'Samiksha P.', handle: '@sam_dev', solved: 3, score: 850, penalty: '01:05:30', rankDelta: -1, verified: true, avatar: '🌟' },
    { rank: 4, user: 'Chen Wei', handle: '@chen_w', solved: 2, score: 350, penalty: '00:44:18', rankDelta: 1, verified: true, avatar: '🚀' },
    { rank: 5, user: 'Marcus Vance', handle: '@mvance', solved: 2, score: 350, penalty: '00:49:05', rankDelta: -2, verified: false, avatar: '⚡' }
  ]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Contest Banner Card */}
      <div className="card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        boxShadow: 'var(--glow-indigo)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-accepted" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulseGlow 1.5s infinite' }} />
                CONTEST ARENA LIVE · SERVER AUTHORITATIVE
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Contest #14 · Rated 1,200–2,800</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.3px' }}>
              DETOX Algorithm Grand Prix: Spring 2026
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: '4px 0 0' }}>
              4 Problems · 2 Hours · Server Authoritative Scoring &amp; Real-Time Multi-Engine Verification
            </p>
          </div>

          {/* Persistent Clock Countdown */}
          <div style={{
            background: '#090D15',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--r-md)',
            padding: '12px 22px',
            textAlign: 'right',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              TIME REMAINING
            </div>
            <div className="mono" style={{ fontSize: '28px', fontWeight: 800, color: '#38BDF8', letterSpacing: '1px' }}>
              {formatTimer(contestTimer)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--status-accepted)' }}>
              ● Synchronized with Server NTP
            </div>
          </div>
        </div>

        {/* Contest Problems Horizontal Grid */}
        <div style={{
          marginTop: '22px',
          paddingTop: '18px',
          borderTop: '1px solid var(--line-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}>
          {contestProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => onSelectProblem({ title: prob.title, id: prob.id })}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: '14px', fontWeight: 800, color: '#818CF8' }}>
                  Problem {prob.id}
                </span>
                <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B' }}>
                  {prob.points} pts
                </span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-primary)', marginTop: '4px' }}>
                {prob.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                  {prob.solvedCount} solves
                </span>
                <span className={prob.status === 'Solved' ? 'badge badge-accepted' : prob.status === 'Attempted' ? 'badge badge-pending' : 'badge badge-cyan'}>
                  {prob.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Standings Table */}
      <div className="card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#F59E0B" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
              Live Arena Standings &amp; Rank Shifts
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
              WebSocket Feed Connected
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line-strong)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <th style={{ padding: '10px 14px', width: '60px' }}>RANK</th>
              <th style={{ padding: '10px 14px' }}>COMPETITOR</th>
              <th style={{ padding: '10px 14px', width: '90px' }}>SOLVED</th>
              <th style={{ padding: '10px 14px', width: '100px' }}>SCORE</th>
              <th style={{ padding: '10px 14px', width: '120px' }}>PENALTY</th>
              <th style={{ padding: '10px 14px', width: '130px' }}>DUAL VERIFY</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row.rank}
                style={{
                  borderBottom: '1px solid var(--line-subtle)',
                  background: row.rank === 1 ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Rank & delta indicator */}
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{
                      fontWeight: 800,
                      fontSize: '14px',
                      color: row.rank === 1 ? '#F59E0B' : row.rank === 2 ? '#E2E8F0' : row.rank === 3 ? '#B45309' : 'var(--ink-muted)'
                    }}>
                      #{row.rank}
                    </span>
                    {row.rankDelta > 0 && <ArrowUpRight size={13} color="#10B981" />}
                    {row.rankDelta < 0 && <ArrowDownRight size={13} color="#F43F5E" />}
                  </div>
                </td>

                {/* Competitor */}
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{row.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>{row.user}</div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{row.handle}</div>
                    </div>
                  </div>
                </td>

                {/* Solved */}
                <td style={{ padding: '12px 14px' }}>
                  <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: '#38BDF8' }}>
                    {row.solved} / 4
                  </span>
                </td>

                {/* Score */}
                <td style={{ padding: '12px 14px' }}>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                    {row.score}
                  </span>
                </td>

                {/* Penalty */}
                <td style={{ padding: '12px 14px' }}>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                    {row.penalty}
                  </span>
                </td>

                {/* Verification badge */}
                <td style={{ padding: '12px 14px' }}>
                  {row.verified ? (
                    <span className="badge badge-accepted" style={{ fontSize: '10.5px' }}>
                      <ShieldCheck size={12} /> Verified ✓
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ fontSize: '10.5px' }}>
                      Audit Queued
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
