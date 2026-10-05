'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ASSIGNMENTS } from '../../data/assignmentsData';
import { PROBLEMS } from '../../data/problemsData';
import {
  Briefcase,
  BookOpen,
  ClipboardList,
  FileCode,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  GitCompare
} from 'lucide-react';

export default function StaffDashboardPage() {
  const staffStats = [
    { label: 'Active Assignments', value: `${ASSIGNMENTS.length}`, icon: ClipboardList, color: '#38BDF8' },
    { label: 'Managed Problems', value: `${PROBLEMS.length}`, icon: BookOpen, color: '#818CF8' },
    { label: 'Submissions Graded', value: '412', icon: FileCode, color: '#10B981' },
    { label: 'Enrolled Students', value: '86', icon: Users, color: '#F59E0B' }
  ];

  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

        <main style={{ flex: 1, padding: '20px 0 60px' }}>
          <div className="container">
            <Breadcrumbs items={[{ label: 'Staff Console', href: '/staff/dashboard' }, { label: 'Dashboard' }]} />

            {/* Staff Welcome Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                    <Briefcase size={12} /> INSTRUCTOR PORTAL
                  </span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                  Academic Staff Dashboard
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Manage course problem sets, student submissions, assessment results, and academic reports.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href="/admin/problems" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12.5px', textDecoration: 'none' }}>
                  <Plus size={14} /> Create Problem
                </Link>
                <Link href="/admin/assignments" className="btn-primary" style={{ padding: '8px 18px', fontSize: '12.5px', textDecoration: 'none' }}>
                  <ClipboardList size={14} /> Manage Assignments
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {staffStats.map(s => {
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

            {/* Two Column Layout: Current Assignments & Student Submissions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Assignments Management Card */}
              <div className="card" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={16} color="#38BDF8" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                      Course Assignments In Progress
                    </h3>
                  </div>
                  <Link href="/assignments" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                    View Student View →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ASSIGNMENTS.map(asg => (
                    <div
                      key={asg.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--line-subtle)',
                        borderRadius: 'var(--r-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                          {asg.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                          Due: {asg.dueDate} · {asg.problems.length} Problems
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="mono" style={{ fontSize: '12px', color: '#10B981' }}>
                          {asg.completedCount}/{asg.totalCount} Done
                        </span>
                        <Link
                          href={`/assignments/${asg.id}`}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions & Discrepancies */}
              <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode size={16} color="#10B981" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                        Recent Student Submissions
                      </h3>
                    </div>
                    <Link href="/admin/submissions" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                      All Submissions →
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink-primary)' }}>
                          Cipher · Two Sum Optimal
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                          C++20 · Runtime 38ms
                        </div>
                      </div>
                      <span className="badge badge-accepted">Accepted</span>
                    </div>

                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink-primary)' }}>
                          Vortex · Container With Most Water
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                          Python 3.12 · Runtime 112ms
                        </div>
                      </div>
                      <span className="badge badge-accepted">Accepted</span>
                    </div>

                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink-primary)' }}>
                          Echo · Max Subarray Modulo K
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                          Java 21 · TLE on Test 14
                        </div>
                      </div>
                      <span className="badge badge-wrong">Time Limit</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <Link
                    href="/admin/plagiarism"
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    <GitCompare size={13} /> Plagiarism Review
                  </Link>
                  <Link
                    href="/admin/assessment"
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    Assessments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
