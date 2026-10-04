'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { CONTESTS } from '../data/contestsData';
import { Trophy, Clock, Users, ArrowRight, Play, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export default function ContestsPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'completed'

  const filteredContests = CONTESTS.filter(c => {
    if (filter === 'all') return true;
    return c.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Contests' }]} />

          {/* Page Title & Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Contest Arena
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Synchronized, timed competitive programming events and real-time rated matches.
              </p>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'live', 'upcoming', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: filter === f ? 'var(--line-active)' : 'var(--bg-surface)',
                    color: filter === f ? '#fff' : 'var(--ink-muted)',
                    border: '1px solid var(--line-subtle)'
                  }}
                >
                  {f === 'live' ? '🔴 Live Matches' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Contests Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredContests.map(contest => {
              const isLive = contest.status === 'Live';
              const isUpcoming = contest.status === 'Upcoming';

              return (
                <div
                  key={contest.id}
                  className="card"
                  style={{
                    padding: '24px 28px',
                    border: isLive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--line-subtle)',
                    boxShadow: isLive ? '0 0 20px -4px rgba(16, 185, 129, 0.25)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}
                >
                  <div style={{ maxWidth: '700px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {isLive ? (
                        <span className="badge badge-accepted" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulseGlow 2s infinite' }} />
                          LIVE COMPETITION
                        </span>
                      ) : isUpcoming ? (
                        <span className="badge badge-pending">UPCOMING MATCH</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--ink-muted)' }}>
                          COMPLETED
                        </span>
                      )}

                      <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                        {contest.startTime}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                      {contest.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>
                      {contest.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--ink-muted)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#38BDF8" /> Duration: <strong>{contest.duration}</strong>
                      </div>
                      <span>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={13} color="#818CF8" /> <strong>{contest.participantsCount}</strong> registered
                      </div>
                      <span>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Trophy size={13} color="#F59E0B" /> {contest.problems.length} Subtasks
                      </div>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                    <Link
                      href={`/contests/${contest.id}`}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '12.5px', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      Contest Details
                    </Link>

                    {isLive ? (
                      <Link
                        href={`/contests/${contest.id}/arena`}
                        className="btn-success"
                        style={{ padding: '10px 18px', fontSize: '13px', justifyContent: 'center', textDecoration: 'none' }}
                      >
                        ⚡ Enter Match Arena
                      </Link>
                    ) : (
                      <Link
                        href={`/contests/${contest.id}`}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px', justifyContent: 'center', textDecoration: 'none' }}
                      >
                        {isUpcoming ? 'Register for Event' : 'View Standings'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
