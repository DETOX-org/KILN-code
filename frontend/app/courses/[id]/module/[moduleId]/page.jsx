'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppHeader from '../../../../components/AppHeader';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { getCourseById } from '../../../../data/coursesData';
import { BookOpen, CheckCircle2, ArrowRight, Play, Terminal } from 'lucide-react';

export default function CourseModulePage() {
  const params = useParams();
  const id = params?.id;
  const moduleId = params?.moduleId;

  const course = getCourseById(id);
  const currentModule = course.modules.find(m => m.id === moduleId) || course.modules[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Courses', href: '/courses' },
              { label: course.title, href: `/courses/${course.id}` },
              { label: currentModule.name }
            ]}
          />

          <div className="card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
            <span className="badge badge-ai" style={{ marginBottom: '8px' }}>
              MODULE LESSONS
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '4px 0 8px' }}>
              {currentModule.name}
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: 0 }}>
              Master these core engineering concepts with step-by-step interactive theory and hands-on coding.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {currentModule.lessons.map((lesson) => (
              <div key={lesson.id} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="mono" style={{ fontSize: '11px', color: '#818CF8' }}>Lesson {lesson.id}</span>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{lesson.duration}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                    {lesson.title}
                  </h3>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {lesson.completed ? (
                    <span style={{ fontSize: '11.5px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : (
                    <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>Incomplete</span>
                  )}
                  <Link
                    href="/problems/maximum-subarray-sum-modulo-k/solve"
                    className="btn-primary"
                    style={{ padding: '5px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    Practice Task →
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
