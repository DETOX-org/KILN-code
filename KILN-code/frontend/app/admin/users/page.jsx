'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Users, UserPlus, Shield, CheckCircle2, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const usersList = [
    { id: 'usr-1', username: 'Cipher', email: 'student@kiln.edu', role: 'student', status: 'Active', solves: 24, lastActive: '10 mins ago' },
    { id: 'usr-2', username: 'Vortex', email: 'vortex@kiln.edu', role: 'student', status: 'Active', solves: 18, lastActive: '1 hour ago' },
    { id: 'usr-3', username: 'prof_vance', email: 'vance@kiln.edu', role: 'staff', status: 'Active', solves: 142, lastActive: '5 mins ago' },
    { id: 'usr-4', username: 'dr_lin', email: 'lin@kiln.edu', role: 'staff', status: 'Active', solves: 89, lastActive: 'Yesterday' },
    { id: 'usr-5', username: 'admin_sys', email: 'admin@kiln.edu', role: 'admin', status: 'Active', solves: 215, lastActive: 'Just now' }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

        <main style={{ flex: 1, padding: '20px 0 60px' }}>
          <div className="container">
            <Breadcrumbs
              items={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'User Directory & Roles' }
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                  Institutional User Directory
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Manage student, faculty staff, and administrator account roles, permissions, and security status.
                </p>
              </div>

              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px', background: '#F43F5E', borderColor: '#F43F5E' }}>
                <UserPlus size={14} /> Provision New Account
              </button>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1fr 1.2fr',
                padding: '12px 20px',
                background: 'var(--bg-deep)',
                borderBottom: '1px solid var(--line-subtle)',
                fontSize: '11.5px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--ink-muted)'
              }}>
                <div>USERNAME / IDENTITY</div>
                <div>EMAIL ADDRESS</div>
                <div>ROLE</div>
                <div>SOLVES</div>
                <div style={{ textAlign: 'right' }}>LAST SEEN</div>
              </div>

              {usersList.map(u => (
                <div
                  key={u.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1.2fr',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--line-subtle)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink-primary)' }}>
                    {u.username}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)' }}>
                    {u.email}
                  </div>
                  <div>
                    <span className="mono" style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: u.role === 'admin' ? 'rgba(244, 63, 94, 0.15)' : u.role === 'staff' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: u.role === 'admin' ? '#F43F5E' : u.role === 'staff' ? '#38BDF8' : '#818CF8',
                      border: '1px solid',
                      borderColor: u.role === 'admin' ? 'rgba(244, 63, 94, 0.3)' : u.role === 'staff' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(99, 102, 241, 0.3)',
                      fontWeight: 600
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: '12.5px', color: '#10B981' }}>
                    {u.solves}
                  </div>
                  <div className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-muted)', textAlign: 'right' }}>
                    {u.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
