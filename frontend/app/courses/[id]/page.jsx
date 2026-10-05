'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getCourseById } from '../page';
import { CheckCircle2, Circle, ChevronRight, PlayCircle } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id;
  const course = getCourseById(id);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Courses', href: '/courses' },
              { label: course.title }
            ]}
          />

          {/* Course Overview Card */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-ai" style={{ marginBottom: '8px' }}>
                  CURRICULUM
                </span>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '4px 0 8px' }}>
                  {course.title}
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: 0, maxWidth: '750px', lineHeight: 1.6 }}>
                  {course.subtitle}
                </p>
              </div>

              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '16px 20px',
                minWidth: '200px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Progress</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>{course.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${course.progress}%`, height: '100%', background: '#10B981' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Modules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {course.modules.map((mod) => (
              <div key={mod.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '16px 24px',
                  background: 'var(--bg-deep)',
                  borderBottom: '1px solid var(--line-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {mod.name}
                  </div>
                  <Link
                    href={`/courses/${course.id}/module/${mod.id}`}
                    className="btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    Open Module →
                  </Link>
                </div>

                <div style={{ padding: '8px 24px' }}>
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {lesson.completed ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <Circle size={16} color="var(--ink-muted)" />
                        )}
                        <span style={{ fontSize: '13.5px', color: lesson.completed ? 'var(--ink-primary)' : 'var(--ink-secondary)' }}>
                          {lesson.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                          {lesson.duration}
                        </span>
                        <Link
                          href={`/courses/${course.id}/module/${mod.id}`}
                          style={{ color: '#818CF8', fontSize: '12px', textDecoration: 'none' }}
                        >
                          Learn
                        </Link>
                      </div>
                    </div>
                  ))}
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
