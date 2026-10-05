'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import StrictAssessmentView from '../../components/StrictAssessmentView';

export default function AssessmentSessionPage() {
  const params = useParams();
  const sessionId = params?.sessionId || 'KILN-1001';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '16px 0 40px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Assessment', href: '/assessment' },
              { label: `Session ${sessionId}` }
            ]}
          />

          {/* Full Proctored Lockdown Component (Spec #10 & #11) */}
          <StrictAssessmentView sessionId={sessionId} initialPhase="locked_session" />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
