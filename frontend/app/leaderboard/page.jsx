'use client';

import React from 'react';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import LeaderboardView from '../components/LeaderboardView';

export default function LeaderboardPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Leaderboard' }]} />

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              Global Ranked Leaderboard
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Official community rankings, contest tiers (Grandmaster, Master, Diamond), and solve statistics.
            </p>
          </div>

          {/* Full Existing Leaderboard Component */}
          <LeaderboardView />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
