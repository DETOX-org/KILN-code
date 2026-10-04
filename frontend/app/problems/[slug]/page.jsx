'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getProblemBySlug } from '../../data/problemsData';
import { Play, ArrowRight, Clock, Cpu, CheckCircle2, Globe, Sparkles, Tag, FileText } from 'lucide-react';

export default function ProblemDetailsPage() {
  const params = useParams();
  const slug = params?.slug;
  const problem = getProblemBySlug(slug);

  const diffColor =
    problem.difficulty === 'Easy' ? '#10B981' :
    problem.difficulty === 'Medium' ? '#F59E0B' :
    problem.difficulty === 'Hard' ? '#F43F5E' : '#C084FC';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Problems', href: '/problems' },
              { label: problem.title }
            ]}
          />

          {/* Problem Header Box */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                    #{problem.id} · Problem Specification
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: diffColor,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {problem.difficulty}
                  </span>
                  <span className="badge badge-cyan">{problem.category}</span>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--status-accepted)' }}>
                    Acceptance: {problem.acceptance}
                  </span>
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 12px' }}>
                  {problem.title}
                </h1>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--ink-secondary)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--line-subtle)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Solve Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                <Link
                  href={`/problems/${problem.slug}/solve`}
                  className="btn-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <Play size={15} /> Solve Problem →
                </Link>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  Points: <strong>{problem.points} pts</strong> · Time: <strong>{problem.timeLimit}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: STATEMENT & METADATA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px' }}>
            {/* Left: Statement, Examples, Constraints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Description Card */}
              <div className="card" style={{ padding: '24px 28px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '14px' }}>
                  Problem Description
                </h2>
                <div style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {problem.description}
                </div>
              </div>

              {/* Examples Card */}
              <div className="card" style={{ padding: '24px 28px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '14px' }}>
                  Examples
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--line-subtle)',
                        borderRadius: 'var(--r-md)',
                        padding: '14px 18px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12.5px',
                        lineHeight: 1.65
                      }}
                    >
                      <div><strong style={{ color: 'var(--ink-muted)' }}>Input:</strong> {ex.input}</div>
                      <div><strong style={{ color: 'var(--ink-muted)' }}>Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
                          <strong style={{ color: 'var(--ink-muted)' }}>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints Card */}
              <div className="card" style={{ padding: '24px 28px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '14px' }}>
                  Constraints &amp; Limits
                </h2>
                <ul style={{
                  fontSize: '13px',
                  color: 'var(--ink-secondary)',
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  <li>Execution Time Limit: {problem.timeLimit}</li>
                  <li>Memory Limit: {problem.memoryLimit}</li>
                </ul>
              </div>
            </div>

            {/* Right: Real-World Systems, Complexity & Submissions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Real World Card */}
              {problem.realWorld && (
                <div className="card" style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Globe size={16} color="#38BDF8" />
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                      Real-World Production Mapping
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {problem.realWorld}
                  </p>
                </div>
              )}

              {/* Quick Spec Details */}
              <div className="card" style={{ padding: '22px 24px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '12px' }}>
                  Problem Metadata
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-subtle)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Difficulty Level</span>
                    <span style={{ fontWeight: 600, color: diffColor }}>{problem.difficulty}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-subtle)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Contest Points</span>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>{problem.points} XP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-subtle)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Primary Category</span>
                    <span style={{ color: 'var(--ink-secondary)' }}>{problem.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Execution Sandbox</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>Judge0 / Isolated Process</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Link
                    href={`/problems/${problem.slug}/solve`}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '10px 0' }}
                  >
                    Open in Coding IDE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
