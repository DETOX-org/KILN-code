'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Award, Terminal, Cpu, Database, Network } from 'lucide-react';

import { COURSES, getCourseById } from '../data/coursesData';
export { getCourseById, COURSES };

export default function CoursesPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Courses' }]} />

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              Structured Learning Paths
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Curated masterclasses bridging mathematical competitive algorithms with industrial software architecture.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {COURSES.map(course => (
              <div key={course.id} className="card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-ai">TRACK</span>
                    <span className="mono" style={{ fontSize: '12px', color: '#F59E0B' }}>
                      {course.xpTotal} XP Total
                    </span>
                  </div>

                  <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                    {course.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {course.subtitle}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--ink-muted)' }}>Progress</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>{course.progress}% Completed</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${course.progress}%`, height: '100%', background: '#10B981' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '16px' }}>
                    {course.modules.length} Core Modules · {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Guided Lessons
                  </div>
                </div>

                <div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '10px 0' }}
                  >
                    View Curriculum &amp; Modules →
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
