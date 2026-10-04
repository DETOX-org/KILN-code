'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import AdminDiscrepancyView from '../../components/AdminDiscrepancyView';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminDiscrepanciesPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin/dashboard' },
              { label: 'Grading Discrepancy Queue' }
            ]}
          />

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              Dual-Engine Discrepancy Queue
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Resolve execution discrepancies between primary and secondary sandbox engines (Judge0 vs Piston).
            </p>
          </div>

          <AdminDiscrepancyView />
        </div>
      </main>

      <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
