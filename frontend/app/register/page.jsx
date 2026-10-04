'use client';

/**
 * /register — KILN Registration Page
 *
 * Security:
 *  - Sends credentials to POST /api/auth/login (Express backend with scrypt hashing)
 *  - Password NEVER stored or logged — only transmitted over HTTPS to backend
 *  - All registration creates student accounts only (enforced server-side)
 *  - No hardcoded credentials or roles
 *  - Duplicate email/username handled with server 409 response
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, User, Mail, Lock, ArrowRight,
  CheckCircle, AlertCircle, ShieldCheck, Check, X,
} from 'lucide-react';

/* ── Password strength analysis ──────────────────────────────── */
function analysePassword(pw) {
  const checks = {
    length:   pw.length >= 8,
    upper:    /[A-Z]/.test(pw),
    lower:    /[a-z]/.test(pw),
    number:   /[0-9]/.test(pw),
    special:  /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

function strengthLabel(score) {
  if (score <= 1) return { label: 'Very Weak',  color: '#EF4444' };
  if (score === 2) return { label: 'Weak',       color: '#F97316' };
  if (score === 3) return { label: 'Fair',       color: '#F59E0B' };
  if (score === 4) return { label: 'Strong',     color: '#22C55E' };
  return                  { label: 'Very Strong',color: '#10B981' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, role, loading: authLoading, login } = useAuth();

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirm, setShowConfirm]          = useState(false);
  const [loading, setLoading]                  = useState(false);
  const [error, setError]                      = useState('');
  const [fieldErrors, setFieldErrors]          = useState({});
  const [success, setSuccess]                  = useState(false);

  const inFlight = useRef(false);

  const pwAnalysis = analysePassword(form.password);
  const strength = strengthLabel(pwAnalysis.score);

  /* ── Already logged in → redirect ────────────────────────── */
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      const dest = role === 'admin' ? '/admin/dashboard' : role === 'instructor' || role === 'staff' ? '/staff/dashboard' : '/dashboard';
      router.replace(dest);
    }
  }, [authLoading, isAuthenticated, role, router]);

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setFieldErrors(f => ({ ...f, [key]: '' }));
    setError('');
  }

  /* ── Client-side validation ──────────────────────────────── */
  function validate() {
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = 'Full name is required.';
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (!/^[A-Za-z0-9_]{3,50}$/.test(form.username)) errs.username = '3–50 letters, numbers or underscores only.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.agreeTerms) errs.agreeTerms = 'You must accept the Terms & Conditions.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── Submit ──────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:    form.username.trim(),
          displayName: form.displayName.trim(),
          email:       form.email.trim().toLowerCase(),
          password:    form.password,
          // confirmPassword is NOT sent to the backend — it's a client-only check
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 409) {
          setError('An account with that username or email already exists.');
        } else if (res.status === 429) {
          setError('Too many registration attempts. Please wait a few minutes.');
        } else if (res.status === 400) {
          setError(json.error || 'Please check your input and try again.');
        } else {
          setError(json.error || 'Registration failed. Please try again.');
        }
        return;
      }

      const { token, user } = json.data;
      // Auto-login after successful registration
      await login(token, user);
      setSuccess(true);

      // Redirect to student dashboard after brief success flash
      setTimeout(() => router.replace('/dashboard'), 1800);
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

  /* ── Shared styles ───────────────────────────────────────── */
  const inputBase = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-deep)',
    border: '1px solid var(--line-subtle)',
    borderRadius: 'var(--r-md)',
    color: 'var(--ink-primary)', fontSize: '13.5px',
    outline: 'none', transition: 'border-color .15s', fontFamily: 'inherit',
  };
  const inputErr = { border: '1px solid #F43F5E' };
  const label = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--ink-secondary)', marginBottom: '6px',
  };
  const fErr = {
    fontSize: '11.5px', color: '#F43F5E', marginTop: '4px',
    display: 'flex', alignItems: 'center', gap: '4px',
  };

  /* ── Success screen ──────────────────────────────────────── */
  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,.15) 0%, transparent 60%), #0b0d12',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(16,185,129,.15)', border: '2px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 0 32px rgba(16,185,129,.3)',
          }}>
            <CheckCircle size={36} color="#10B981" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            Account created!
          </h1>
          <p style={{ fontSize: '14px', color: '#9ba3b8', lineHeight: 1.6 }}>
            Welcome to KILN, <strong style={{ color: '#c7d0e8' }}>{form.displayName}</strong>.
            Taking you to your dashboard…
          </p>
          <div style={{ marginTop: '20px', height: '3px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'linear-gradient(90deg, #6366F1, #10B981)',
              animation: 'progress 1.8s linear forwards',
            }} />
          </div>
          <style>{`@keyframes progress{from{width:0}to{width:100%}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px',
      background: 'radial-gradient(ellipse at 70% 20%, rgba(99,102,241,.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14,165,233,.1) 0%, transparent 60%), #0b0d12',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '24px',
              boxShadow: '0 0 32px rgba(99,102,241,.5)',
            }}>K</div>
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '13.5px', color: '#9ba3b8', margin: 0 }}>
            Join <strong style={{ color: '#c7d0e8' }}>KILN / DETOX Code</strong> as a student
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#10131a', border: '1px solid #1e2230',
          borderRadius: '16px', padding: '32px',
          boxShadow: '0 16px 48px rgba(0,0,0,.6)',
        }}>

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

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Full name */}
            <div>
              <label htmlFor="displayName" style={label}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5268', pointerEvents: 'none' }} />
                <input
                  id="displayName" type="text" autoComplete="name"
                  placeholder="Your full name"
                  value={form.displayName}
                  onChange={e => setField('displayName', e.target.value)}
                  style={{ ...inputBase, paddingLeft: '36px', ...(fieldErrors.displayName ? inputErr : {}) }}
                />
              </div>
              {fieldErrors.displayName && <p style={fErr}><AlertCircle size={11} />{fieldErrors.displayName}</p>}
            </div>

            {/* Username + Email side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label htmlFor="username" style={label}>Username</label>
                <input
                  id="username" type="text" autoComplete="username"
                  placeholder="cipher_01"
                  value={form.username}
                  onChange={e => setField('username', e.target.value)}
                  style={{ ...inputBase, ...(fieldErrors.username ? inputErr : {}) }}
                />
                {fieldErrors.username && <p style={fErr}><AlertCircle size={11} />{fieldErrors.username}</p>}
              </div>
              <div>
                <label htmlFor="email" style={label}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5268', pointerEvents: 'none' }} />
                  <input
                    id="email" type="email" autoComplete="email"
                    placeholder="you@uni.edu"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    style={{ ...inputBase, paddingLeft: '36px', ...(fieldErrors.email ? inputErr : {}) }}
                  />
                </div>
                {fieldErrors.email && <p style={fErr}><AlertCircle size={11} />{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5268', pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  style={{ ...inputBase, paddingLeft: '36px', paddingRight: '40px', ...(fieldErrors.password ? inputErr : {}) }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4b5268', cursor: 'pointer', padding: '4px' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p style={fErr}><AlertCircle size={11} />{fieldErrors.password}</p>}

              {/* Strength meter */}
              {form.password && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '3px',
                        background: i <= pwAnalysis.score ? strength.color : '#1e2230',
                        transition: 'background .2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: strength.color, fontWeight: 600, margin: 0 }}>
                    {strength.label}
                  </p>
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      { key: 'length',  label: '8+ chars'    },
                      { key: 'upper',   label: 'Uppercase'   },
                      { key: 'lower',   label: 'Lowercase'   },
                      { key: 'number',  label: 'Number'      },
                      { key: 'special', label: 'Symbol'      },
                    ].map(req => (
                      <span key={req.key} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10.5px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '100px',
                        background: pwAnalysis.checks[req.key] ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.04)',
                        color: pwAnalysis.checks[req.key] ? '#10B981' : '#4b5268',
                        border: `1px solid ${pwAnalysis.checks[req.key] ? 'rgba(16,185,129,.3)' : 'transparent'}`,
                        transition: 'all .2s',
                      }}>
                        {pwAnalysis.checks[req.key] ? <Check size={10} /> : <X size={10} />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" style={label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5268', pointerEvents: 'none' }} />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setField('confirmPassword', e.target.value)}
                  style={{ ...inputBase, paddingLeft: '36px', paddingRight: '40px', ...(fieldErrors.confirmPassword ? inputErr : {}) }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password visibility"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4b5268', cursor: 'pointer', padding: '4px' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p style={fErr}><AlertCircle size={11} />{fieldErrors.confirmPassword}</p>}
              {form.confirmPassword && !fieldErrors.confirmPassword && form.password === form.confirmPassword && (
                <p style={{ ...fErr, color: '#10B981', marginTop: '4px' }}>
                  <Check size={11} /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={e => setField('agreeTerms', e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: '#6366F1', marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12.5px', color: '#9ba3b8', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link href="/terms" style={{ color: '#6366F1', textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" style={{ color: '#6366F1', textDecoration: 'none' }}>Privacy Policy</Link>.
                  All submissions are subject to academic integrity review.
                </span>
              </label>
              {fieldErrors.agreeTerms && <p style={fErr}><AlertCircle size={11} />{fieldErrors.agreeTerms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '12px 0', fontSize: '14px', fontWeight: 700,
                marginTop: '4px', opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <> Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider + sign in link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e2230' }} />
            <span style={{ fontSize: '12px', color: '#4b5268' }}>Already have an account?</span>
            <div style={{ flex: 1, height: '1px', background: '#1e2230' }} />
          </div>
          <Link
            href="/login"
            style={{
              display: 'block', textAlign: 'center', marginTop: '14px',
              padding: '11px', borderRadius: '8px',
              border: '1px solid #1e2230', background: 'rgba(255,255,255,.03)',
              color: '#818CF8', fontSize: '13.5px', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In →
          </Link>
        </div>

        {/* Security notice */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#4b5268" />
          <span style={{ fontSize: '11.5px', color: '#4b5268' }}>
            Passwords hashed with scrypt · Public registration creates student accounts only
          </span>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          #register-submit:hover:not(:disabled) { transform: translateY(-1px); }
        `}</style>
      </div>
    </div>
  );
}
