'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import Breadcrumbs from '../../../components/Breadcrumbs';
import WorkspaceView from '../../../components/WorkspaceView';
import { getProblemBySlug } from '../../../data/problemsData';

export default function ProblemSolvePage() {
  const params = useParams();
  const slug = params?.slug;
  const problem = getProblemBySlug(slug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '16px 0 32px' }}>
        <div className="container" style={{ maxWidth: '1600px' }}>
          <Breadcrumbs
            items={[
              { label: 'Problems', href: '/problems' },
              { label: problem.title, href: `/problems/${problem.slug}` },
              { label: 'Solve (IDE)' }
            ]}
          />

          {/* Dedicated Coding IDE Workspace */}
          <WorkspaceView
            activeProblem={problem}
            onSolveContest={() => {}}
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
