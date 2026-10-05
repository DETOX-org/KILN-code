'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getAssignmentById } from '../../data/assignmentsData';
import { Clock, User, CheckCircle2, Circle, AlertCircle, Play, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const assignment = getAssignmentById(id);

  const percent = Math.round((assignment.completedCount / assignment.totalCount) * 100);
  const remainingCount = assignment.totalCount - assignment.completedCount;

  // Spec #9 & #10: Start Assignment initiates pre-assessment hardware verification
  const handleStartAssignment = () => {
    // Generate or fetch authoritative assessment session ID
    const sessionId = `ASG-${assignment.id.toUpperCase()}-SESS`;
    router.push(`/assignments/${assignment.id}/verify?session=${sessionId}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Assignments', href: '/assignments' },
              { label: assignment.title }
            ]}
          />

          {/* Header Card */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ maxWidth: '680px' }}>
                <span className="badge badge-ai" style={{ marginBottom: '8px' }}>
                  {assignment.course}
                </span>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '4px 0 8px' }}>
                  {assignment.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                  <span>Instructor: <strong style={{ color: 'var(--ink-secondary)' }}>{assignment.instructor}</strong></span>
                  <span>•</span>
                  <span>Due Date: <strong style={{ color: '#F59E0B' }}>{assignment.dueDate}</strong></span>
                  <span>•</span>
                  <span>Problems: <strong>{assignment.totalCount}</strong></span>
                </div>
              </div>

              {/* Progress & START ASSIGNMENT ACTION BOX */}
              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '16px 20px',
                minWidth: '240px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Completion</span>
                    <span style={{ color: percent === 100 ? '#10B981' : '#818CF8', fontWeight: 700 }}>{assignment.progress}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#10B981' : '#6366F1' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-muted)', marginTop: '6px' }}>
                    <span>{assignment.completedCount} Completed</span>
                    <span>{remainingCount} Remaining</span>
                  </div>
                </div>

                {/* Primary CTA: START ASSIGNMENT (Spec #8 & #9) */}
                <button
                  onClick={handleStartAssignment}
                  className="btn-primary"
                  style={{
                    padding: '12px 18px',
                    fontSize: '13px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                    boxShadow: '0 4px 16px rgba(244, 63, 94, 0.4)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <ShieldAlert size={15} /> START ASSIGNMENT →
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginTop: '20px', padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-subtle)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                ASSIGNMENT INSTRUCTIONS &amp; SUBMISSION CRITERIA:
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.6 }}>
                {assignment.instructions}
              </p>
            </div>
          </div>

          {/* Problems List in this Assignment */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '16px 24px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                  Assigned Problem Set ({assignment.problems.length} problems)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  {assignment.completedCount} completed · {remainingCount} remaining
                </span>
              </div>

              <button
                onClick={handleStartAssignment}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Launch Assessment Session
              </button>
            </div>

            {assignment.problems.map((prob, idx) => {
              const diffColor =
                prob.difficulty === 'Easy' ? '#10B981' :
                prob.difficulty === 'Medium' ? '#F59E0B' : '#F43F5E';

              return (
                <div
                  key={prob.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--line-subtle)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {prob.status === 'Solved' ? (
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : prob.status === 'Attempted' ? (
                      <AlertCircle size={18} color="#F59E0B" />
                    ) : (
                      <Circle size={18} color="var(--ink-muted)" />
                    )}

                    <div>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)', marginRight: '8px' }}>
                        Problem {idx + 1}
                      </span>
                      <Link
                        href={`/assignments/${assignment.id}/problem/${prob.slug}/solve`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--ink-primary)',
                          textDecoration: 'none'
                        }}
                      >
                        {prob.title}
                      </Link>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: diffColor, fontFamily: 'var(--font-mono)' }}>
                      {prob.difficulty}
                    </span>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                      {prob.points} pts
                    </span>

                    <Link
                      href={`/assignments/${assignment.id}/problem/${prob.slug}/solve`}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '11.5px', textDecoration: 'none' }}
                    >
                      <Play size={12} /> {prob.status === 'Solved' ? 'Review Code' : 'Solve Task →'}
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
