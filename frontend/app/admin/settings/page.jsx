'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Settings, Shield, Sliders, Server, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

        <main style={{ flex: 1, padding: '20px 0 60px' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <Breadcrumbs
              items={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'System Settings' }
              ]}
            />

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                System Configuration &amp; Security Settings
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Compiler cluster endpoints, anti-cheat tolerances, judge execution limits, and institutional keys.
              </p>
            </div>

            <div className="card" style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                    Primary Sandbox Engine URL
                  </label>
                  <input
                    type="text"
                    defaultValue="http://judge0-cluster.internal:2358"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      color: 'var(--ink-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                    Strict Mode Max Violation Strikes
                  </label>
                  <input
                    type="number"
                    defaultValue={3}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      color: 'var(--ink-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                    MOSS AST Similarity Threshold (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={70}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      color: 'var(--ink-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px', background: '#F43F5E', borderColor: '#F43F5E' }}>
                    <Save size={14} /> Save System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
