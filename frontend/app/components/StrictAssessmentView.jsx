'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Video, Mic, Wifi, Maximize2, AlertTriangle, Eye, CheckCircle2, Lock, Clock, Terminal, RefreshCw, XCircle } from 'lucide-react';

export default function StrictAssessmentView() {
  // Phase: 'preflight' | 'locked_session' | 'auto_submitted'
  const [sessionPhase, setSessionPhase] = useState('preflight');
  
  // Pre-flight checks state
  const [checks, setChecks] = useState({
    webcam: { status: 'checking', label: 'Camera & MediaPipe Face Landmarker' },
    microphone: { status: 'checking', label: 'Audio Frequency Analyzer' },
    fullscreen: { status: 'checking', label: 'Fullscreen & Window Lockdown API' },
    network: { status: 'checking', label: 'Network Latency & WebSocket Heartbeat (<40ms)' }
  });

  // Strict session state
  const [warnings, setWarnings] = useState(0); // 0, 1, 2, 3 (threshold is 3)
  const [maxWarnings] = useState(3);
  const [activeAlert, setActiveAlert] = useState(null);
  const [integrityLogs, setIntegrityLogs] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  
  // Simulated AI Face Detection states
  const [faceStatus, setFaceStatus] = useState({
    facesDetected: 1,
    centered: true,
    gazeAttention: 98,
    landmarkCount: 468
  });

  // Assessment code buffer
  const [examCode, setExamCode] = useState(
`#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Institutional Assessment: Problem 1
// Task: Compute minimal cost to synchronize edge nodes in a distributed acyclic graph
int solveDistributedGraph(int n, vector<vector<int>>& edges) {
    // Write your verified solution here:
    
    return 0;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout << "Ready for institutional evaluation." << endl;
    return 0;
}`
  );

  // Preflight check simulator
  useEffect(() => {
    if (sessionPhase === 'preflight') {
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
    }
  }, [sessionPhase]);

  // Exam countdown timer
  useEffect(() => {
    if (sessionPhase === 'locked_session') {
      const interval = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            handleAutoSubmit('Exam time limit expired.');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionPhase]);

  const addIntegrityLog = (type, severity, details) => {
    const timeStr = new Date().toLocaleTimeString();
    setIntegrityLogs(prev => [
      { id: Date.now(), time: timeStr, type, severity, details },
      ...prev
    ]);
  };

  // Trigger violation
  const triggerViolation = (type, description) => {
    const nextWarn = warnings + 1;
    setWarnings(nextWarn);

    addIntegrityLog(type, nextWarn >= maxWarnings ? 'CRITICAL' : 'WARNING', description);

    if (nextWarn >= maxWarnings) {
      setActiveAlert({
        level: 'critical',
        title: 'Threshold Exceeded — Auto-Submission Triggered',
        message: 'Maximum allowed integrity violations (3/3) reached. Current code buffer has been sealed and transmitted to backend judge.'
      });
      setTimeout(() => {
        handleAutoSubmit('Violation threshold breached (3 warnings).');
      }, 2000);
    } else {
      setActiveAlert({
        level: 'warning',
        title: `Warning ${nextWarn} of ${maxWarnings}`,
        message: `${description} Please remain in fullscreen with active focus.`
      });
      setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
    }
  };

  // Keyboard and Window Blur Listeners in Locked Session
  useEffect(() => {
    if (sessionPhase !== 'locked_session') return;

    const handleKeyDown = (e) => {
      // Intercept Copy / Paste / Cut / Tab switching
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerViolation('CLIPBOARD_RESTRICTION', `Shortcut [${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}] blocked by Strict Mode policy.`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('WINDOW_BLUR', 'User switched browser tab or minimized window.');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation('CONTEXT_MENU', 'Right-click context menu prohibited during assessment.');
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [sessionPhase, warnings]);

  const handleStartExam = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    setSessionPhase('locked_session');
    addIntegrityLog('SESSION_INITIALIZED', 'INFO', 'Strict assessment session initiated in locked fullscreen mode.');
  };

  const handleAutoSubmit = (reason) => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    setSessionPhase('auto_submitted');
    addIntegrityLog('SESSION_FINALIZED', 'SYSTEM', `Buffer submitted: ${reason}`);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ----------------- PHASE 1: PRE-FLIGHT DIAGNOSTIC WIZARD ----------------- */}
      {sessionPhase === 'preflight' && (
        <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={26} color="#F43F5E" />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  Institutional Strict Assessment Mode
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Pre-Assessment Hardware &amp; Environmental Verification Wizard (Spec §9 &amp; §12–15)
                </p>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--line-subtle)',
              padding: '18px 20px',
              margin: '20px 0'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '10px' }}>
                Monitored Session Agreement:
              </h4>
              <ul style={{ fontSize: '13px', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
                <li><strong>Fullscreen Enforcement:</strong> Exiting fullscreen or unfocusing the window generates a timestamped violation event.</li>
                <li><strong>Browser Lockdown:</strong> Clipboard operations (copy, paste, cut) and devtools context menus are actively disabled.</li>
                <li><strong>AI Face Monitoring:</strong> WebAssembly-driven MediaPipe model analyzes landmarks locally. No continuous raw video is stored unless an anomaly occurs.</li>
                <li><strong>Server-Authoritative Clock:</strong> Timing is controlled by the server; closing or refreshing the browser does not pause the clock.</li>
              </ul>
            </div>

            {/* Diagnostic checklist */}
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              System Diagnostic Status:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(checks).map(([key, item]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
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
                      <span className="badge badge-accepted">
                        <CheckCircle2 size={12} /> Verified Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleStartExam}
                disabled={Object.values(checks).some(c => c.status !== 'passed')}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '14.5px',
                  background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                  boxShadow: '0 4px 18px rgba(244, 63, 94, 0.4)'
                }}
              >
                <Lock size={16} /> Enter Strict Assessment Lockdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PHASE 2: IN-SESSION LOCKDOWN ----------------- */}
      {sessionPhase === 'locked_session' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Lockdown HUD */}
          <div style={{
            background: '#120D1A',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--r-md)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#F43F5E',
                boxShadow: '0 0 10px #F43F5E',
                animation: 'pulseGlow 1.5s infinite'
              }}></span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '0.5px' }}>
                STRICT LOCKDOWN ACTIVE
              </span>
              <span className="badge badge-wrong" style={{ fontSize: '11px' }}>
                Violations: {warnings} / {maxWarnings}
              </span>
            </div>

            {/* Warning Banners */}
            {activeAlert && (
              <div style={{
                background: activeAlert.level === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)',
                border: `1px solid ${activeAlert.level === 'critical' ? '#EF4444' : '#F59E0B'}`,
                borderRadius: '6px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff',
                fontSize: '12.5px',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <AlertTriangle size={15} color={activeAlert.level === 'critical' ? '#F87171' : '#FBBF24'} />
                <span><strong>{activeAlert.title}:</strong> {activeAlert.message}</span>
              </div>
            )}

            {/* Authoritative Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#38BDF8" />
                <span className="mono" style={{ fontSize: '16px', fontWeight: 700, color: '#38BDF8' }}>
                  {formatTimer(timeRemaining)}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>(Server-Timed)</span>
              </div>

              <button
                onClick={() => handleAutoSubmit('Candidate requested early finish.')}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Finalize &amp; Submit
              </button>
            </div>
          </div>

          {/* Test Violation Simulators Bar (for testing and demonstration) */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed var(--line-strong)',
            borderRadius: 'var(--r-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              🛠️ Proctoring Event Simulators:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => triggerViolation('TAB_SWITCH', 'Switched focus away from exam container.')}
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#F43F5E',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                Simulate Window Blur
              </button>
              <button
                onClick={() => triggerViolation('CLIPBOARD_PASTE', 'Attempted clipboard paste insertion.')}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#F59E0B',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                Simulate Paste Event
              </button>
              <button
                onClick={() => {
                  setFaceStatus(p => ({ ...p, facesDetected: 0 }));
                  triggerViolation('FACE_ABSENCE', 'Face disappeared from webcam boundary frame.');
                }}
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#C084FC',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                Simulate Face Absence
              </button>
              <button
                onClick={() => {
                  setFaceStatus(p => ({ ...p, facesDetected: 2 }));
                  triggerViolation('MULTIPLE_FACES', 'Secondary person detected in candidate background.');
                }}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                Simulate Multi-Face
              </button>
            </div>
          </div>

          {/* Exam Workspace Split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '18px' }}>
            
            {/* Editor Canvas */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Monaco Assessment Buffer (Clipboard Blocked)
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--status-accepted)' }}>
                  ● Auto-saved to server cache
                </span>
              </div>

              <textarea
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '420px',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  color: '#E2E8F0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  padding: '16px',
                  lineHeight: '1.6',
                  resize: 'none'
                }}
              />
            </div>

            {/* Right: Computer Vision Landmarker & Audit Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* MediaPipe Face Tracker Simulation Widget */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={15} color="var(--status-accepted)" />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      MediaPipe 468-pt Face Mesh
                    </span>
                  </div>
                  <span className="badge badge-accepted" style={{ fontSize: '10.5px' }}>
                    WebAssembly Active
                  </span>
                </div>

                {/* Simulated Webcam View with mesh overlay */}
                <div style={{
                  height: '140px',
                  background: '#070A10',
                  borderRadius: 'var(--r-md)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--line-strong)'
                }}>
                  {/* Grid lines simulating computer vision canvas */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }} />

                  {/* Facial silhouette box */}
                  <div style={{
                    width: '90px',
                    height: '105px',
                    border: faceStatus.facesDetected === 1 ? '1.5px solid #10B981' : '1.5px solid #F43F5E',
                    borderRadius: '50px 50px 40px 40px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(16, 185, 129, 0.04)'
                  }}>
                    {/* Simulated eye landmark points */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '10px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#38BDF8' }} />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#38BDF8' }} />
                    </div>
                    {/* Nose & mouth point */}
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#38BDF8', marginBottom: '8px' }} />
                    <span style={{ width: '14px', height: '2px', background: '#38BDF8', borderRadius: '2px' }} />
                  </div>

                  {/* Corner Status Stamp */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '10px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: faceStatus.facesDetected === 1 ? '#34D399' : '#F87171'
                  }}>
                    {faceStatus.facesDetected === 1 ? 'FACE_LOCK: VALID (1)' : 'ANOMALY: FACE_ABSENT / MULTI'}
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '5px 8px', borderRadius: '4px', color: 'var(--ink-secondary)' }}>
                    Attention: <span style={{ color: '#10B981', fontWeight: 600 }}>{faceStatus.gazeAttention}%</span>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '5px 8px', borderRadius: '4px', color: 'var(--ink-secondary)' }}>
                    FPS: <span style={{ color: '#38BDF8', fontWeight: 600 }}>30.0</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Integrity Audit Log */}
              <div className="card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Terminal size={15} color="var(--ink-muted)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Integrity Audit Event Stream
                  </span>
                </div>

                <div style={{
                  flex: 1,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}>
                  {integrityLogs.length === 0 ? (
                    <span style={{ color: 'var(--ink-faint)' }}>Session running with clean integrity state.</span>
                  ) : (
                    integrityLogs.map((log) => (
                      <div key={log.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--ink-muted)', flexShrink: 0 }}>[{log.time}]</span>
                        <span style={{
                          color: log.severity === 'CRITICAL' ? '#F43F5E' : log.severity === 'WARNING' ? '#F59E0B' : '#10B981',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {log.type}:
                        </span>
                        <span style={{ color: 'var(--ink-secondary)' }}>{log.details}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ----------------- PHASE 3: SUBMITTED / SEALED SUMMARY ----------------- */}
      {sessionPhase === 'auto_submitted' && (
        <div style={{ maxWidth: '640px', margin: '40px auto', width: '100%' }}>
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <CheckCircle2 size={32} color="#10B981" />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Assessment Buffer Finalized &amp; Sealed
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', margin: '8px 0 24px' }}>
              Your submission timestamp has been cryptographically recorded by the server judge.
            </p>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--line-subtle)',
              padding: '16px',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--ink-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>Total Logged Warnings: <strong style={{ color: warnings >= 3 ? '#F43F5E' : '#10B981' }}>{warnings}</strong></div>
              <div>Audit Events Registered: <strong>{integrityLogs.length}</strong></div>
              <div>Status: <span style={{ color: '#10B981' }}>Pending Human Instructor Review (Spec §15)</span></div>
            </div>

            <button
              onClick={() => {
                setSessionPhase('preflight');
                setWarnings(0);
                setActiveAlert(null);
                setIntegrityLogs([]);
                setTimeRemaining(45 * 60);
              }}
              className="btn-primary"
              style={{ marginTop: '24px' }}
            >
              Reset Assessment Demo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
