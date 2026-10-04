'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import Breadcrumbs from '../../../components/Breadcrumbs';
import AlgorithmVisualizerView from '../../../components/AlgorithmVisualizerView';
import { getProblemBySlug } from '../../../data/problemsData';
import { ArrowLeft, Play, Cpu } from 'lucide-react';

export default function ProblemVisualizePage() {
  const params = useParams();
  const slug = params?.slug;
  const problem = getProblemBySlug(slug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          <Breadcrumbs
            items={[
              { label: 'Problems', href: '/problems' },
              { label: problem.title, href: `/problems/${problem.slug}` },
              { label: 'Solve (IDE)', href: `/problems/${problem.slug}/solve` },
              { label: 'Execution Visualizer' }
            ]}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-accepted">✓ Solution Accepted</span>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  Problem: {problem.title}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: 0 }}>
                Algorithm Execution State Visualizer
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href={`/problems/${problem.slug}/solve`}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12.5px', textDecoration: 'none' }}
              >
                <ArrowLeft size={14} /> Back to IDE
              </Link>
              <Link
                href="/problems"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '12.5px', textDecoration: 'none' }}
              >
                Next Problem →
              </Link>
            </div>
          </div>

          {/* Algorithm Visualizer Component */}
          <AlgorithmVisualizerView />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
