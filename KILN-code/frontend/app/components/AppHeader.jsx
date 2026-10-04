'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  BookOpen,
  ClipboardList,
  Trophy,
  Flame,
  Layers,
  ShieldAlert,
  GitCompare,
  Settings,
  Users,
  Briefcase,
  LogOut,
  User as UserIcon,
  Flame as FlameIcon
} from 'lucide-react';

export default function AppHeader() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const isStaff = role === 'staff' || role === 'instructor';
  const isAdmin = role === 'admin';
  const isStudent = !isStaff && !isAdmin;

  // Student Navigation per Spec #19:
  // Dashboard, Problems, Assignments, Contests, Leaderboard, Courses
  const studentNav = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity, active: pathname === '/dashboard' },
    { label: 'Problems', href: '/problems', icon: BookOpen, active: pathname.startsWith('/problems') },
    { label: 'Assignments', href: '/assignments', icon: ClipboardList, active: pathname.startsWith('/assignments') },
    { label: 'Contests', href: '/contests', icon: Trophy, active: pathname.startsWith('/contests'), badge: 'Live' },
    { label: 'Leaderboard', href: '/leaderboard', icon: Flame, active: pathname.startsWith('/leaderboard') },
    { label: 'Courses', href: '/courses', icon: Layers, active: pathname.startsWith('/courses') },
  ];

  // Staff Navigation per Spec #19:
  // Dashboard, Problems, Assignments, Submissions, Students, Reports
  const staffNav = [
    { label: 'Dashboard', href: '/staff/dashboard', icon: Activity, active: pathname === '/staff/dashboard' },
    { label: 'Problems', href: '/admin/problems', icon: BookOpen, active: pathname.startsWith('/admin/problems') },
    { label: 'Assignments', href: '/admin/assignments', icon: ClipboardList, active: pathname.startsWith('/admin/assignments') },
    { label: 'Submissions', href: '/admin/submissions', icon: Settings, active: pathname.startsWith('/admin/submissions') },
    { label: 'Assessments', href: '/admin/assessment', icon: ShieldAlert, active: pathname.startsWith('/admin/assessment') },
    { label: 'Plagiarism', href: '/admin/plagiarism', icon: GitCompare, active: pathname.startsWith('/admin/plagiarism'), badge: 'MOSS' },
  ];

  // Admin Navigation per Spec #19:
  // Dashboard, Users, Problems, Assignments, Contests, Assessments, Submissions, Plagiarism, Settings
  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Activity, active: pathname === '/admin/dashboard' },
    { label: 'Users', href: '/admin/users', icon: Users, active: pathname.startsWith('/admin/users') },
    { label: 'Problems', href: '/admin/problems', icon: BookOpen, active: pathname.startsWith('/admin/problems') },
    { label: 'Assignments', href: '/admin/assignments', icon: ClipboardList, active: pathname.startsWith('/admin/assignments') },
    { label: 'Contests', href: '/admin/contests', icon: Trophy, active: pathname.startsWith('/admin/contests') },
    { label: 'Assessments', href: '/admin/assessment', icon: ShieldAlert, active: pathname.startsWith('/admin/assessment') },
    { label: 'Submissions', href: '/admin/submissions', icon: Settings, active: pathname.startsWith('/admin/submissions') },
    { label: 'Plagiarism', href: '/admin/plagiarism', icon: GitCompare, active: pathname.startsWith('/admin/plagiarism'), badge: 'MOSS' },
    { label: 'Discrepancies', href: '/admin/discrepancies', icon: Settings, active: pathname.startsWith('/admin/discrepancies') },
    { label: 'Settings', href: '/admin/settings', icon: Settings, active: pathname.startsWith('/admin/settings') },
  ];

  const currentNav = isAdmin ? adminNav : isStaff ? staffNav : studentNav;

  // Role is determined server-side — no client-side switching

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const brandHref = isAdmin ? '/admin/dashboard' : isStaff ? '/staff/dashboard' : '/dashboard';

  return (
    <header style={{
      background: 'var(--bg-deep)',
      borderBottom: '1px solid var(--line-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Top Utility Row */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Brand & Logo */}
        <Link href={brandHref} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '18px',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
          }}>
            K
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
                DETOX <span style={{ color: '#818CF8' }}>Code</span>
              </span>
              <span className="mono" style={{
                fontSize: '9.5px',
                background: isAdmin ? 'rgba(244, 63, 94, 0.2)' : isStaff ? 'rgba(56, 189, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: isAdmin ? '#FDA4AF' : isStaff ? '#7DD3FC' : '#C7D2FE',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: isAdmin ? 'rgba(244, 63, 94, 0.4)' : isStaff ? 'rgba(56, 189, 248, 0.4)' : 'rgba(99, 102, 241, 0.3)'
              }}>
                {(role || 'user').toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '10.5px', color: 'var(--ink-muted)', margin: 0 }}>
              Competitive Programming &amp; Proctored Assessment
            </p>
          </div>
        </Link>

        {/* Engine Telemetry & Role Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isStudent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(249, 115, 22, 0.12)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: 'var(--r-pill)',
                padding: '3px 8px',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: '#F97316',
                fontWeight: 600
              }}>
                <FlameIcon size={13} color="#F97316" /> 7d
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--r-pill)',
                padding: '3px 8px',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: '#F59E0B',
                fontWeight: 600
              }}>
                <Trophy size={12} color="#F59E0B" /> 1,842
              </div>
            </div>
          )}

          {/* Role badge — display only, not interactive */}
          <div style={{
            fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px', borderRadius: '6px',
            background: isAdmin ? 'rgba(244,63,94,.12)' : isStaff ? 'rgba(56,189,248,.12)' : 'rgba(99,102,241,.12)',
            color: isAdmin ? '#FDA4AF' : isStaff ? '#7DD3FC' : '#C7D2FE',
            border: `1px solid ${isAdmin ? 'rgba(244,63,94,.3)' : isStaff ? 'rgba(56,189,248,.3)' : 'rgba(99,102,241,.3)'}`,
          }}>
            {(role || 'guest').toUpperCase()}
          </div>

          {/* User profile / Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--ink-secondary)',
                fontSize: '11px',
                textDecoration: 'none'
              }}
              title="Switch user account"
            >
              <UserIcon size={12} />
              <span>{user?.displayName || 'User'}</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div style={{ background: 'rgba(11, 15, 23, 0.95)' }}>
        <div className="container" style={{ display: 'flex', gap: '2px', overflowX: 'auto', padding: '0 24px' }}>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '11px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--ink-muted)',
                  borderBottom: isActive ? (isAdmin ? '2px solid #F43F5E' : isStaff ? '2px solid #38BDF8' : '2px solid #6366F1') : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? (isAdmin ? '#F43F5E' : isStaff ? '#38BDF8' : '#818CF8') : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'Live' ? '#10B981' : item.badge === 'MOSS' ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
