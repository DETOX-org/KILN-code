'use client';

/**
 * ProtectedRoute — Route-level authorization guard.
 *
 * Behaviour:
 *  1. While AuthContext is validating the stored JWT (loading=true) → show spinner.
 *  2. If unauthenticated → redirect to /login?returnTo=<current-path>.
 *  3. If authenticated but wrong role → show 403 card.
 *  4. If authenticated and role matches → render children.
 *
 * The returnTo URL is validated on the login page to prevent open redirect attacks.
 */

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ProtectedRoute({
  allowedRoles = ['student', 'staff', 'instructor', 'admin'],
  children,
}) {
  const { isAuthenticated, role, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Normalize: 'instructor' is treated as 'staff' throughout the UI
  const normalizedRole = role === 'instructor' ? 'staff' : role;

  const isRoleAllowed = allowedRoles.some((r) => {
    if (r === 'admin') return normalizedRole === 'admin';
    if (r === 'staff' || r === 'instructor') {
      return normalizedRole === 'staff' || normalizedRole === 'admin';
    }
    // 'student' — any authenticated user can access student routes
    return isAuthenticated;
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Encode the current path as returnTo so the login page can redirect back
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [loading, isAuthenticated, pathname, router]);

  /* ── 1. Loading state ─────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid var(--line-subtle)',
          borderTop: '3px solid #6366F1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>Verifying session…</p>
      </div>
    );
  }

  /* ── 2. Unauthenticated → redirect (handled by useEffect above) ── */
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  /* ── 3. Wrong role ────────────────────────────────────────── */
  if (!isRoleAllowed) {
    const dashboardHref =
      normalizedRole === 'admin' ? '/admin/dashboard' :
      normalizedRole === 'staff' ? '/staff/dashboard' :
      '/dashboard';

    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div className="card" style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px',
          textAlign: 'center',
          border: '1px solid rgba(244, 63, 94, 0.4)',
        }}>
          <div style={{
            width: '54px', height: '54px',
            borderRadius: '14px',
            background: 'rgba(244, 63, 94, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <ShieldAlert size={28} color="#F43F5E" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 10px' }}>
            403 — Unauthorized
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            Your account role (<strong>{role}</strong>) does not have permission to view this resource.
            Backend RBAC policy restricts this path.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link
              href={dashboardHref}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
            >
              Return to Dashboard
            </Link>
            <button
              onClick={() => { logout(); router.replace('/login'); }}
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 4. Authorized ────────────────────────────────────────── */
  return children;
}
