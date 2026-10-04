'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import PlagiarismReviewView from '../../components/PlagiarismReviewView';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminPlagiarismPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin/dashboard' },
              { label: 'Plagiarism Review' }
            ]}
          />

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
              AST Code Plagiarism Review Matrix
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Staff inspection of structural similarity, token normalization, renamed identifiers, and side-by-side AST diffs.
            </p>
          </div>

          <PlagiarismReviewView />
        </div>
      </main>

      <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
