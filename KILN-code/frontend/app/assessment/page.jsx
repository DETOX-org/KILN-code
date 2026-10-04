'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { Shield, ShieldAlert, ArrowRight, Video, Lock, AlertTriangle, Play } from 'lucide-react';

export default function AssessmentLobbyPage() {
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState('KILN-1001');

  const handleJoin = (e) => {
    e.preventDefault();
    if (sessionCode.trim()) {
      router.push(`/assessment/${sessionCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Breadcrumbs items={[{ label: 'Assessment' }]} />

          {/* Assessment Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <ShieldAlert size={24} color="#F43F5E" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
              Institutional Strict Assessment Portal
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
              High-stakes proctored test environment with fullscreen lock, blur detection, reverse-clipboard paste purges, and strike disqualification.
            </p>
          </div>

          {/* Session ID Entry Card */}
          <div className="card" style={{ padding: '32px', marginBottom: '24px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                  ENTER SESSION CODE (KILN-XXXX):
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="e.g. KILN-1001"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--line-subtle)',
                      borderRadius: 'var(--r-md)',
                      color: '#F43F5E',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '1px'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: '12px 28px',
                      fontSize: '14px',
                      fontWeight: 700,
                      background: '#F43F5E',
                      borderColor: '#F43F5E'
                    }}
                  >
                    Enter Proctored Exam →
                  </button>
                </div>
              </div>

              {/* Protocol Specs */}
              <div style={{
                background: 'var(--bg-deep)',
                padding: '16px 20px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line-subtle)',
                fontSize: '12.5px',
                color: 'var(--ink-secondary)',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 700, color: '#F59E0B', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                  PROCTORING LOCKDOWN RULES:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Fullscreen mode is strictly enforced. Exiting fullscreen will issue a violation strike.</li>
                  <li>Tab switching, window blur, and secondary monitor focus will be logged to your audit dossier.</li>
                  <li>External clipboard pastes are automatically purged. Only typing or editor-internal copy is allowed.</li>
                  <li>3 violation strikes trigger immediate exam termination and submission.</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
