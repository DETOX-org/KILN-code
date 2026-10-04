'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '../../../../components/AppHeader';
import AppFooter from '../../../../components/AppFooter';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import WorkspaceView from '../../../../components/WorkspaceView';
import { getAssignmentById } from '../../../../data/assignmentsData';
import { getProblemBySlug } from '../../../../data/problemsData';

export default function AssignmentProblemSolvePage() {
  const params = useParams();
  const id = params?.id;
  const slug = params?.slug;

  const assignment = getAssignmentById(id);
  const problem = getProblemBySlug(slug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '16px 0 32px' }}>
        <div className="container" style={{ maxWidth: '1600px' }}>
          <Breadcrumbs
            items={[
              { label: 'Assignments', href: '/assignments' },
              { label: assignment.title, href: `/assignments/${assignment.id}` },
              { label: `${problem.title} (IDE)` }
            ]}
          />

          {/* Dedicated Coding IDE Workspace for Assignment Task */}
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
