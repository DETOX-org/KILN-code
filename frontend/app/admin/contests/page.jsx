'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { CONTESTS } from '../../data/contestsData';
import { Trophy, Plus, Clock, Users, ArrowUpRight } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminContestsPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin/dashboard' },
              { label: 'Contest Orchestrator' }
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Contest Orchestrator &amp; Arena Manager
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Schedule synchronized rounds, adjust scoring decay, set freeze durations, and monitor live matches.
              </p>
            </div>

            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
              <Plus size={14} /> Schedule New Contest
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr',
              padding: '12px 20px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)'
            }}>
              <div>CONTEST TITLE</div>
              <div>STATUS</div>
              <div>DURATION</div>
              <div>PARTICIPANTS</div>
              <div style={{ textAlign: 'right' }}>ACTION</div>
            </div>

            {CONTESTS.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--line-subtle)',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink-primary)' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    {c.problems.length} Subtasks · {c.startTime}
                  </div>
                </div>

                <div>
                  <span className={c.status === 'Live' ? 'badge badge-accepted' : 'badge badge-pending'}>
                    {c.status}
                  </span>
                </div>

                <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                  {c.duration}
                </div>

                <div className="mono" style={{ fontSize: '12px', color: '#818CF8' }}>
                  {c.participantsCount} coders
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Link
                    href={`/contests/${c.id}`}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                  >
                    View Match
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
