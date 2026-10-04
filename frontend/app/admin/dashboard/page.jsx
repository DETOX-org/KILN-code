'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  ShieldAlert,
  BookOpen,
  ClipboardList,
  Trophy,
  Users,
  Settings,
  GitCompare,
  Activity,
  FileCode,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Sessions', value: '4', icon: Activity, color: '#10B981' },
    { label: 'Published Problems', value: '142', icon: BookOpen, color: '#38BDF8' },
    { label: 'Pending Discrepancies', value: '1', icon: ShieldAlert, color: '#F43F5E' },
    { label: 'Total Submissions', value: '1,894', icon: FileCode, color: '#818CF8' }
  ];

  const adminSections = [
    {
      title: 'Problem Creator & Subtask Configurator',
      href: '/admin/problems',
      description: 'Define mathematical constraints, subtask IOI scoring, sample & hidden test cases, and custom checker code.',
      icon: BookOpen,
      action: 'Manage Problems'
    },
    {
      title: 'Contest Orchestrator & Session Publishing',
      href: '/admin/contests',
      description: 'Schedule synchronous matches, set contest duration, configure live scoreboard freeze, and view participant counts.',
      icon: Trophy,
      action: 'Manage Contests'
    },
    {
      title: 'Strict Assessment & Proctored Sessions',
      href: '/admin/assessment',
      description: 'Generate KILN-XXXX session IDs, toggle fullscreen & paste block enforcement, and set max violation strikes.',
      icon: ShieldAlert,
      action: 'Configure Sessions'
    },
    {
      title: 'AST Plagiarism Review Arbiter',
      href: '/admin/plagiarism',
      description: 'Run MOSS/AST similarity algorithms across student submission pairs, detect renamed variables, and review side-by-side diffs.',
      icon: GitCompare,
      action: 'Review Plagiarism'
    },
    {
      title: 'Submission Audit Dossiers',
      href: '/admin/submissions',
      description: 'Inspect participant code, compilation errors, execution runtimes, strike escalation timelines, and verdicts.',
      icon: FileCode,
      action: 'Inspect Submissions'
    },
    {
      title: 'Grading Discrepancy Arbiter',
      href: '/admin/discrepancies',
      description: 'Resolve dual-engine compiler variances (Judge0 vs Piston sandbox), review appeals, and override verdicts.',
      icon: Settings,
      action: 'Open Arbiter Queue'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

        <main style={{ flex: 1, padding: '20px 0 60px' }}>
          <div className="container">
            <Breadcrumbs items={[{ label: 'Admin Dashboard' }]} />

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Staff Administration Console
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Platform management, contest orchestration, proctoring security parameters, and submission grading.
              </p>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {stats.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        {s.label.toUpperCase()}
                      </span>
                      <Icon size={16} color={s.color} />
                    </div>
                    <div className="mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', marginTop: '8px' }}>
                      {s.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Navigation Hub Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
              {adminSections.map(sec => {
                const Icon = sec.icon;
                return (
                  <div key={sec.title} className="card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(99, 102, 241, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={16} color="#818CF8" />
                        </div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                          {sec.title}
                        </h2>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
                        {sec.description}
                      </p>
                    </div>

                    <div>
                      <Link
                        href={sec.href}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '9px 0', fontSize: '12.5px' }}
                      >
                        {sec.action} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
