'use client';

import React from 'react';
import {
  Code2,
  Terminal,
  Trophy,
  ShieldAlert,
  Flame,
  User,
  Sparkles,
  BookOpen,
  GitCompare,
  Activity,
  Layers,
  Settings,
  Cpu,
  ShieldCheck
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  discrepancyCount = 1
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: null },
    { id: 'problems', label: 'Problems', icon: BookOpen, badge: null },
    { id: 'workspace', label: 'Coding IDE', icon: Code2, badge: 'Monaco' },
    { id: 'visualizer', label: 'Visualizer', icon: Cpu, badge: 'AST' },
    { id: 'contests', label: 'Contest Arena', icon: Trophy, badge: 'Live' },
    { id: 'assessment', label: 'Strict Assessment', icon: ShieldAlert, badge: 'Lockdown' },
    { id: 'plagiarism', label: 'Plagiarism Review', icon: GitCompare, badge: 'MOSS' },
    { id: 'courses', label: 'Courses', icon: Layers, badge: null },
    { id: 'admin', label: 'Staff Admin', icon: Settings, badge: discrepancyCount > 0 ? `${discrepancyCount}` : null }
  ];

  return (
    <header style={{
      background: 'var(--bg-deep)',
      borderBottom: '1px solid var(--line-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Top utility row */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '19px',
            boxShadow: '0 2px 12px rgba(99, 102, 241, 0.5)'
          }}>
            K
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px', color: '#FFFFFF' }}>
                DETOX <span style={{ color: '#818CF8' }}>Code</span>
              </span>
              <span className="mono" style={{
                fontSize: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#C7D2FE',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>v2.4 PRO</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--ink-muted)', margin: 0 }}>
              Competitive Programming, Real-Time Execution &amp; Assessment Engine
            </p>
          </div>
        </div>

        {/* Engine Telemetry & Cluster Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--line-subtle)',
            padding: '5px 12px',
            borderRadius: 'var(--r-pill)',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulseGlow 2s infinite' }} />
              Judge0 Pool (Normal)
            </span>
            <span style={{ color: 'var(--line-strong)' }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38BDF8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
              Piston Pool (Audit)
            </span>
          </div>

          {/* Gamification Pills: Streak & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(249, 115, 22, 0.12)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#F97316',
              fontWeight: 600
            }}>
              <Flame size={14} color="#F97316" /> 7d
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#F59E0B',
              fontWeight: 600
            }}>
              <Trophy size={13} color="#F59E0B" /> 1,842
            </div>
          </div>

          {/* Role Toggle Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line-subtle)'
          }}>
            <button
              onClick={() => setUserRole('student')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11.5px',
                fontWeight: 600,
                background: userRole === 'student' ? 'var(--line-active)' : 'transparent',
                color: userRole === 'student' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Student
            </button>
            <button
              onClick={() => setUserRole('admin')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11.5px',
                fontWeight: 600,
                background: userRole === 'admin' ? 'var(--line-active)' : 'transparent',
                color: userRole === 'admin' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              Staff / Admin
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Ribbon */}
      <div style={{ background: 'rgba(11, 15, 23, 0.95)' }}>
        <div className="container" style={{ display: 'flex', gap: '2px', overflowX: 'auto', padding: '0 24px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '12px 15px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--ink-muted)',
                  borderBottom: isActive ? '2px solid #6366F1' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#818CF8' : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: item.id === 'admin' && discrepancyCount > 0 ? '#F43F5E' : 'rgba(255, 255, 255, 0.08)',
                    color: item.id === 'admin' && discrepancyCount > 0 ? '#fff' : 'var(--ink-muted)',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
