'use client';

import React from 'react';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import AlgorithmVisualizerView from '../components/AlgorithmVisualizerView';

export default function VisualizerPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Algorithm Visualizer' }]} />

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              Algorithm Visualizer &amp; Execution Tracer
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Step-by-step interactive AST execution, two-pointer invariants, binary search bounds, and sorting traces.
            </p>
          </div>

          {/* Full Existing Algorithm Visualizer Component */}
          <AlgorithmVisualizerView />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
