'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FileCode, CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminSubmissionsPage() {
  const submissions = [
    {
      id: 'sub-94812',
      candidate: 'Jordan K. (@jordan_k)',
      problem: 'Maximum Subarray Sum with Modulo K',
      language: 'C++20 (GCC 12.2)',
      runtime: '42ms',
      memory: '14.2 MB',
      verdict: 'Accepted',
      score: '100/100',
      strikes: 0,
      timestamp: '14:22:04'
    },
    {
      id: 'sub-94829',
      candidate: 'Dev M. (@dev_m)',
      problem: 'Maximum Subarray Sum with Modulo K',
      language: 'C++20 (GCC 12.2)',
      runtime: '48ms',
      memory: '14.8 MB',
      verdict: 'Accepted',
      score: '100/100',
      strikes: 1,
      timestamp: '14:23:41'
    },
    {
      id: 'sub-93104',
      candidate: 'Elena Algo (@elena_algo)',
      problem: 'Container With Most Water',
      language: 'Python 3.12',
      runtime: '112ms',
      memory: '18.4 MB',
      verdict: 'Accepted',
      score: '100/100',
      strikes: 0,
      timestamp: '13:50:12'
    },
    {
      id: 'sub-92015',
      candidate: 'Marcus Vance (@mvance)',
      problem: 'Topological DAG Dependency',
      language: 'Java 21',
      runtime: '340ms',
      memory: '42.1 MB',
      verdict: 'Time Limit Exceeded',
      score: '60/100',
      strikes: 2,
      timestamp: '12:15:30'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin/dashboard' },
              { label: 'Submissions Audit' }
            ]}
          />

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              Submission Audit Dossiers
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Live real-time stream of candidate solutions, sandbox execution metrics, strikes, and verification flags.
            </p>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1fr 1fr 1fr',
              padding: '12px 20px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)'
            }}>
              <div>SUBMISSION ID</div>
              <div>CANDIDATE</div>
              <div>PROBLEM</div>
              <div>VERDICT</div>
              <div>RUNTIME / MEM</div>
              <div style={{ textAlign: 'right' }}>STRIKES</div>
            </div>

            {submissions.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--line-subtle)',
                  alignItems: 'center'
                }}
              >
                <div className="mono" style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>
                  {s.id}
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    {s.candidate}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    {s.language} · {s.timestamp}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>
                  {s.problem}
                </div>

                <div>
                  <span className={s.verdict === 'Accepted' ? 'badge badge-accepted' : 'badge badge-wrong'}>
                    {s.verdict}
                  </span>
                </div>

                <div className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                  {s.runtime} · {s.memory}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="mono" style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: s.strikes > 0 ? '#F43F5E' : '#10B981',
                    background: s.strikes > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {s.strikes} {s.strikes === 1 ? 'Strike' : 'Strikes'}
                  </span>
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
