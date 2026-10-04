'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { ASSIGNMENTS as initialAssignments } from '../data/assignmentsData';
import { ClipboardList, Clock, CheckCircle2, User, ChevronRight, BookOpen, Layers } from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [loading, setLoading] = useState(false);

  // Dynamic fetch per Spec #7: Fetch actual assignments from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchAssignments() {
      try {
        const token = localStorage.getItem('kiln_auth_token');
        const res = await fetch('/api/assignments', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.assignments && Array.isArray(data.assignments)) {
            setAssignments(data.assignments);
          }
        }
      } catch (e) {
        // Gracefully keep data
      }
    }
    fetchAssignments();
    return () => { isMounted = false; };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Assignments' }]} />

          {/* Page Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                My Assignments
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                {assignments.length} Assignments Available · Structured coursework and proctored deliverables.
              </p>
            </div>

            <div className="badge badge-ai" style={{ fontSize: '12px', padding: '6px 14px' }}>
              {assignments.length} Active Problem Sets
            </div>
          </div>

          {/* Dynamic Assignments Cards per Specification Section 7 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {assignments.map((asg) => {
              const percent = Math.round((asg.completedCount / asg.totalCount) * 100);

              return (
                <div
                  key={asg.id}
                  className="card"
                  style={{
                    padding: '24px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--line-subtle)',
                    transition: 'border-color 0.2s ease, transform 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-ai" style={{ fontSize: '11px' }}>
                        {asg.course}
                      </span>
                      <span className="mono" style={{ fontSize: '12px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} /> Due: {asg.dueDate}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                      {asg.title}
                    </h2>

                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '14px' }}>
                      Instructor: <strong style={{ color: 'var(--ink-secondary)' }}>{asg.instructor}</strong> · {asg.totalCount} Problems
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--ink-muted)' }}>Progress: <strong style={{ color: percent === 100 ? '#10B981' : '#F59E0B' }}>{asg.progress}</strong></span>
                        <span style={{ color: 'var(--ink-muted)' }}>{percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#10B981' : '#6366F1' }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Link
                      href={`/assignments/${asg.id}`}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        padding: '10px 0',
                        fontSize: '13px',
                        fontWeight: 700
                      }}
                    >
                      View Assignment →
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
  );
}
