'use client';

/**
 * /login — KILN Authentication Page
 *
 * Security:
 *  - Credentials sent only to /api/auth/login (Express backend)
 *  - Role determined exclusively from server response — never from UI state
 *  - No mock fallback, no hardcoded credentials
 *  - returnTo validated to be a same-origin relative path (no open redirect)
 *  - Debounced: duplicate requests blocked while one is in-flight
 */

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

/* ── Validates returnTo to prevent open-redirect attacks ─────── */
function safeReturnTo(raw) {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    // Only allow relative paths starting with /
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
      // Disallow redirect back to /login or /register (loop prevention)
      if (decoded.startsWith('/login') || decoded.startsWith('/register')) return null;
      return decoded;
    }
  } catch {}
  return null;
}

/* ── Role → dashboard mapping (from server response) ─────────── */
function dashboardFor(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor' || role === 'staff') return '/staff/dashboard';
  return '/dashboard';
}

/* ── Page shell — wraps LoginContent in Suspense for useSearchParams ── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', margin: '0 auto 12px', border: '3px solid #1e2230', borderTop: '3px solid #6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#4b5268', fontSize: '13px' }}>Loading…</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, role, loading: authLoading, login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const inFlight = useRef(false); // prevents duplicate submission

  const returnTo = safeReturnTo(searchParams.get('returnTo'));

  /* ── If already authenticated, redirect immediately ─────────── */
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      router.replace(returnTo || dashboardFor(role));
    }
  }, [authLoading, isAuthenticated, role, returnTo, router]);

  /* ── Client-side validation ──────────────────────────────────── */
  function validate() {
    const errs = {};
    if (!identifier.trim()) errs.identifier = 'Username or email is required.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── Submit ──────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // Map HTTP status to user-friendly messages without leaking internals
        if (res.status === 401) {
          setError('Incorrect username/email or password. Please try again.');
        } else if (res.status === 429) {
          setError('Too many login attempts. Please wait a few minutes and try again.');
        } else if (res.status === 400) {
          setError('Please fill in all required fields.');
        } else {
          setError(json.error || 'Login failed. Please try again.');
        }
        return;
      }

      const { token, user } = json.data;

      // Role comes exclusively from the server — never from UI state
      await login(token, user);

      const dest = returnTo || dashboardFor(user.role);
      router.replace(dest);
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Cannot reach the server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  /* ── Forgot password (UI only — backend endpoint not yet implemented) ── */
  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
  }

  /* ── Loading state while AuthContext validates existing session ── */
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px', margin: '0 auto 12px',
            border: '3px solid #1e2230', borderTop: '3px solid #6366F1',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#4b5268', fontSize: '13px' }}>Checking session…</p>
        </div>
      </div>
    );
  }

  /* ── Styles ──────────────────────────────────────────────────── */
  const inputBase = {
    width: '100%',
    padding: '11px 14px',
    background: 'var(--bg-deep)',
    border: '1px solid var(--line-subtle)',
    borderRadius: 'var(--r-md)',
    color: 'var(--ink-primary)',
    fontSize: '13.5px',
    outline: 'none',
    transition: 'border-color .15s',
    fontFamily: 'inherit',
  };
  const inputError = { borderColor: '#F43F5E' };
  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ink-secondary)',
    marginBottom: '6px',
  };
  const fieldErrStyle = {
    fontSize: '11.5px',
    color: '#F43F5E',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,.1) 0%, transparent 60%), #0b0d12',
    }}>
      {/* ── Decorative grid overlay ─────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* ── Brand header ──────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '16px', textDecoration: 'none' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '24px',
              boxShadow: '0 0 32px rgba(99,102,241,.5)',
            }}>K</div>
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '13.5px', color: '#9ba3b8', margin: 0 }}>
            Sign in to <strong style={{ color: '#c7d0e8' }}>KILN / DETOX Code</strong>
            {returnTo && <span style={{ color: '#818CF8' }}> · continue to your page</span>}
          </p>
        </div>

        {/* ── Forgot Password Panel ────────────────────────── */}
        {showForgot ? (
          <div style={{
            background: '#10131a', border: '1px solid #1e2230',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 16px 48px rgba(0,0,0,.6)',
          }}>
            {forgotSent ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle size={40} color="#10B981" style={{ marginBottom: '12px' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Check your inbox</h2>
                <p style={{ fontSize: '13px', color: '#9ba3b8', marginBottom: '20px' }}>
                  If <strong style={{ color: '#c7d0e8' }}>{forgotEmail}</strong> is registered, you'll receive a reset link shortly.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '10px 20px' }}
                >
                  ← Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Reset password</h2>
                <p style={{ fontSize: '13px', color: '#9ba3b8', marginBottom: '20px' }}>
                  Enter your registered email address and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgot}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Email address</label>
                    <input
                      type="email" required
                      placeholder="you@university.edu"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      style={inputBase}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13.5px', fontWeight: 700 }}>
                    Send Reset Link
                  </button>
                </form>
                <button
                  onClick={() => setShowForgot(false)}
                  style={{ background: 'none', border: 'none', color: '#9ba3b8', fontSize: '12.5px', cursor: 'pointer', marginTop: '14px', display: 'block', textAlign: 'center', width: '100%' }}
                >
                  ← Back to Sign In
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Login Card ───────────────────────────────────── */
          <div style={{
            background: '#10131a', border: '1px solid #1e2230',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 16px 48px rgba(0,0,0,.6)',
          }}>
            {/* Global error banner */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.3)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              }}>
                <AlertCircle size={16} color="#F43F5E" style={{ marginTop: '1px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#FDA4AF', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Identifier */}
              <div>
                <label htmlFor="identifier" style={labelStyle}>Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#4b5268', pointerEvents: 'none',
                  }} />
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="username or you@university.edu"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setFieldErrors(f => ({ ...f, identifier: '' })); setError(''); }}
                    style={{ ...inputBase, paddingLeft: '36px', ...(fieldErrors.identifier ? inputError : {}) }}
                    aria-describedby="identifier-error"
                    aria-invalid={!!fieldErrors.identifier}
                  />
                </div>
                {fieldErrors.identifier && (
                  <p id="identifier-error" style={fieldErrStyle}>
                    <AlertCircle size={11} />{fieldErrors.identifier}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    style={{ background: 'none', border: 'none', fontSize: '11.5px', color: '#6366F1', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#4b5268', pointerEvents: 'none',
                  }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); setError(''); }}
                    style={{ ...inputBase, paddingLeft: '36px', paddingRight: '40px', ...(fieldErrors.password ? inputError : {}) }}
                    aria-describedby="password-error"
                    aria-invalid={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#4b5268', cursor: 'pointer', padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" style={fieldErrStyle}>
                    <AlertCircle size={11} />{fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#9ba3b8' }}>Remember me on this device</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', justifyContent: 'center',
                  padding: '12px 0', fontSize: '14px', fontWeight: 700,
                  marginTop: '4px',
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                    }} />
                    Authenticating…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#1e2230' }} />
              <span style={{ fontSize: '12px', color: '#4b5268' }}>Don't have an account?</span>
              <div style={{ flex: 1, height: '1px', background: '#1e2230' }} />
            </div>

            <Link
              href="/register"
              style={{
                display: 'block', textAlign: 'center',
                padding: '11px', borderRadius: '8px',
                border: '1px solid #1e2230',
                background: 'rgba(255,255,255,.03)',
                color: '#818CF8', fontSize: '13.5px', fontWeight: 600,
                textDecoration: 'none', transition: 'border-color .15s',
              }}
            >
              Create a KILN account →
            </Link>
          </div>
        )}

        {/* ── Security notice ───────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#4b5268" />
          <span style={{ fontSize: '11.5px', color: '#4b5268' }}>
            Secured with JWT · Role enforced server-side
          </span>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          #login-submit:hover:not(:disabled) { transform: translateY(-1px); }
        `}</style>
      </div>
    </div>
  );
}
