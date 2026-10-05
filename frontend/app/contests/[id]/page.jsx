'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getContestById } from '../../data/contestsData';
import { Trophy, Clock, Users, Shield, Play, CheckCircle2 } from 'lucide-react';

export default function ContestDetailPage() {
  const params = useParams();
  const id = params?.id;
  const contest = getContestById(id);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Contests', href: '/contests' },
              { label: contest.title }
            ]}
          />

          {/* Header Card */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ maxWidth: '750px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={contest.status === 'Live' ? 'badge badge-accepted' : 'badge badge-pending'}>
                    {contest.status.toUpperCase()}
                  </span>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                    Starts: {contest.startTime}
                  </span>
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 10px' }}>
                  {contest.title}
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {contest.description}
                </p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                  <div>Duration: <strong style={{ color: 'var(--ink-primary)' }}>{contest.duration}</strong></div>
                  <div>•</div>
                  <div>Registered Competitors: <strong style={{ color: '#818CF8' }}>{contest.participantsCount}</strong></div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Link
                  href={`/contests/${contest.id}/arena`}
                  className="btn-success"
                  style={{ padding: '12px 26px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}
                >
                  <Play size={14} /> Enter Contest Arena
                </Link>
              </div>
            </div>

            {/* Rules Bar */}
            <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--bg-deep)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                CONTEST INTEGRITY PROTOCOL:
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                {contest.rules}
              </div>
            </div>
          </div>

          {/* Problem Set */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '14px 24px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--ink-primary)'
            }}>
              Contest Problem Roster
            </div>

            {contest.problems.map((prob) => (
              <div
                key={prob.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--line-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="mono" style={{ fontSize: '16px', fontWeight: 800, color: '#818CF8' }}>
                    {prob.id}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      {prob.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                      {prob.solvedCount} solves during match
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="mono" style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>
                    {prob.points} pts
                  </span>
                  <Link
                    href={`/contests/${contest.id}/arena`}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    Solve in Arena →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
