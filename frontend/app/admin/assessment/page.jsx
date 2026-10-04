'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Shield, ShieldAlert, Key, Plus, Copy, Check, ExternalLink } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminAssessmentPage() {
  const [sessions, setSessions] = useState([
    {
      id: 'KILN-1001',
      title: 'Midterm Institutional Algorithms Assessment',
      duration: '45 mins',
      strikesAllowed: 3,
      fullscreenEnforced: true,
      pasteBlocked: true,
      submissionsCount: 14,
      status: 'Active'
    },
    {
      id: 'KILN-XFY9',
      title: 'Graph Theory & Distributed Lock Exam',
      duration: '60 mins',
      strikesAllowed: 3,
      fullscreenEnforced: true,
      pasteBlocked: true,
      submissionsCount: 8,
      status: 'Active'
    }
  ]);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin/dashboard' },
              { label: 'Assessment Sessions' }
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Strict Assessment &amp; Proctoring Sessions
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Manage KILN-XXXX session tokens, monitor live violation strikes, and inspect candidate dossiers.
              </p>
            </div>

            <a
              href="/admin.html"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12.5px', textDecoration: 'none' }}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} /> Open Full Tactical Configurator
            </a>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1.2fr',
              padding: '12px 20px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)'
            }}>
              <div>SESSION ID</div>
              <div>EXAM TITLE</div>
              <div>RULES</div>
              <div>SUBMISSIONS</div>
              <div style={{ textAlign: 'right' }}>ACTION</div>
            </div>

            {sessions.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1.2fr',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--line-subtle)',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '13.5px', fontWeight: 800, color: '#F43F5E' }}>
                    {s.id}
                  </span>
                  <button
                    onClick={() => handleCopy(s.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
                    title="Copy code"
                  >
                    {copiedId === s.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  </button>
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink-primary)' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    Duration: {s.duration} · Max Strikes: {s.strikesAllowed}
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                  {s.fullscreenEnforced ? '🔒 Fullscreen' : 'Windowed'} · {s.pasteBlocked ? 'Paste Purged' : 'Allowed'}
                </div>

                <div className="mono" style={{ fontSize: '12.5px', color: '#10B981' }}>
                  {s.submissionsCount} candidates
                </div>

                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Link
                    href={`/assessment/${s.id}`}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                  >
                    Test Room
                  </Link>
                  <a
                    href={`/admin.html?session=${s.id}`}
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Audit Dossier
                  </a>
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
