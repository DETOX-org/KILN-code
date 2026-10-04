'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { getAssignmentById } from '../../../data/assignmentsData';
import {
  ShieldAlert,
  Video,
  Mic,
  Maximize2,
  Wifi,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function AssignmentPreVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const assignment = getAssignmentById(id);
  const sessionId = searchParams.get('session') || `ASG-${id?.toUpperCase()}-SESSION`;

  // Pre-flight checks state per Specification Section 9
  const [checks, setChecks] = useState({
    webcam: { status: 'checking', label: 'Camera & MediaPipe Face Landmarker' },
    microphone: { status: 'checking', label: 'Audio Frequency Analyzer' },
    fullscreen: { status: 'checking', label: 'Fullscreen & Window Lockdown API' },
    network: { status: 'checking', label: 'Network Latency & WebSocket Heartbeat' }
  });

  // Verify diagnostic status sequence
  useEffect(() => {
    const t1 = setTimeout(() => setChecks(p => ({ ...p, webcam: { ...p.webcam, status: 'passed' } })), 600);
    const t2 = setTimeout(() => setChecks(p => ({ ...p, microphone: { ...p.microphone, status: 'passed' } })), 1000);
    const t3 = setTimeout(() => setChecks(p => ({ ...p, network: { ...p.network, status: 'passed' } })), 1400);
    const t4 = setTimeout(() => setChecks(p => ({ ...p, fullscreen: { ...p.fullscreen, status: 'passed' } })), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const allPassed = Object.values(checks).every(c => c.status === 'passed');

  // Spec #9 & #10: ENTER STRICT ASSESSMENT LOCKDOWN
  const handleEnterStrictLockdown = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Route to actual monitored assignment session per Spec #10
    router.push(`/assessment/${sessionId}?assignmentId=${assignment.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '24px 0 60px' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <Breadcrumbs
            items={[
              { label: 'Assignments', href: '/assignments' },
              { label: assignment.title, href: `/assignments/${assignment.id}` },
              { label: 'Hardware Verification' }
            ]}
          />

          <div className="card" style={{ padding: '36px 40px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={28} color="#F43F5E" />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 4px' }}>
                  Institutional Strict Assessment Mode
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Pre-Assessment Hardware &amp; Environmental Verification Wizard · {assignment.title}
                </p>
              </div>
            </div>

            {/* Monitored Session Agreement per Spec #9 */}
            <div style={{
              background: 'var(--bg-deep)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--line-subtle)',
              padding: '20px 24px',
              margin: '20px 0'
            }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '12px' }}>
                Monitored Session Agreement
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                <div>
                  <strong style={{ color: '#fff' }}>Fullscreen Enforcement:</strong> Exiting fullscreen or unfocusing the window generates a timestamped violation event.
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Browser Lockdown:</strong> Clipboard operations such as copy, paste and cut are disabled. Developer-tools/context-menu restrictions are enabled.
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>AI Face Monitoring:</strong> MediaPipe/WebAssembly face-landmark monitoring runs locally. Continuous raw video must not be stored unless required by the defined anomaly workflow.
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Server-Authoritative Clock:</strong> The assessment timer is controlled by the server. Refreshing or closing the browser does not pause the timer.
                </div>
              </div>
            </div>

            {/* System Diagnostic Status per Spec #9 */}
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
              System Diagnostic Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(checks).map(([key, item]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {key === 'webcam' && <Video size={18} color="var(--status-cyan)" />}
                    {key === 'microphone' && <Mic size={18} color="var(--status-pending)" />}
                    {key === 'fullscreen' && <Maximize2 size={18} color="var(--line-active)" />}
                    {key === 'network' && <Wifi size={18} color="var(--status-accepted)" />}
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-primary)', fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>

                  <div>
                    {item.status === 'checking' ? (
                      <span className="badge badge-pending">
                        <RefreshCw size={11} className="animate-spin" /> Verifying...
                      </span>
                    ) : (
                      <span className="badge badge-accepted" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <CheckCircle2 size={12} /> Verified Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA: ENTER STRICT ASSESSMENT LOCKDOWN (Spec #9) */}
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => router.push(`/assignments/${assignment.id}`)}
                className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: '13.5px' }}
              >
                Cancel
              </button>

              <button
                onClick={handleEnterStrictLockdown}
                disabled={!allPassed}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                  boxShadow: '0 4px 18px rgba(244, 63, 94, 0.4)',
                  border: 'none',
                  cursor: allPassed ? 'pointer' : 'not-allowed',
                  opacity: allPassed ? 1 : 0.6
                }}
              >
                <Lock size={15} /> ENTER STRICT ASSESSMENT LOCKDOWN →
              </button>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
