'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ContestArenaView from '../../../components/ContestArenaView';
import { getContestById } from '../../../data/contestsData';

export default function ContestMatchArenaPage() {
  const params = useParams();
  const id = params?.id;
  const contest = getContestById(id);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '16px 0 40px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Contests', href: '/contests' },
              { label: contest.title, href: `/contests/${contest.id}` },
              { label: 'Match Arena' }
            ]}
          />

          {/* Existing Live Contest Arena Component with Countdown & Leaderboard */}
          <ContestArenaView
            onSelectProblem={(prob) => {
              window.location.href = `/problems/${prob.slug || 'maximum-subarray-sum-modulo-k'}/solve`;
            }}
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
