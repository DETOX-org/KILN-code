'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import Breadcrumbs from '../../components/Breadcrumbs';
import { ASSIGNMENTS } from '../../data/assignmentsData';
import { ClipboardList, Plus, Trash2, Edit3, X, Calendar, BookOpen, Users, Clock } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

const COURSES = [
  'Data Structures & Algorithms Foundations',
  'CS Systems & Algorithms',
  'Operating Systems & Distributed Architecture',
  'Graph Theory & Combinatorics',
  'Machine Learning Systems',
];

const PROBLEMS_POOL = [
  { slug: 'two-sum',                       title: 'Two Sum Optimal Lookup',                       difficulty: 'Easy'   },
  { slug: 'container-with-most-water',      title: 'Container With Most Water',                    difficulty: 'Medium' },
  { slug: 'maximum-subarray-sum-modulo-k',  title: 'Maximum Subarray Sum with Modulo K',           difficulty: 'Medium' },
  { slug: 'kth-largest-element',            title: 'Kth Largest Element in an Array',              difficulty: 'Medium' },
  { slug: 'shortest-path-dag',              title: 'Shortest Path in Directed Acyclic Graph',      difficulty: 'Hard'   },
  { slug: 'burst-balloons',                 title: 'Burst Balloons Optimal Matrix',                difficulty: 'Hard'   },
  { slug: 'lru-cache-eviction',             title: 'LRU Cache Eviction Architecture',              difficulty: 'Medium' },
  { slug: 'distributed-consensus-paxos',    title: 'Distributed Consensus & Paxos Log Replication',difficulty: 'Expert' },
];

const DIFF_COLOR = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#F43F5E', Expert: '#8B5CF6' };

function isBefore(dateStr) {
  // Returns true if the given date string is in the future (assignment hasn't started yet)
  if (!dateStr) return true;
  return new Date(dateStr) > new Date();
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState(
    ASSIGNMENTS.map(a => ({ ...a, startDate: '', startTime: '' }))
  );
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, obj = edit

  const emptyForm = {
    title: '', course: COURSES[0], instructor: '',
    dueDate: '', startDate: '', startTime: '',
    instructions: '', selectedProblems: []
  };
  const [form, setForm] = useState(emptyForm);

  // ── OPEN CREATE ──────────────────────────────────────
  function openCreate() {
    setForm(emptyForm);
    setEditTarget(null);
    setShowModal(true);
  }

  // ── OPEN EDIT ────────────────────────────────────────
  function openEdit(asg) {
    setForm({
      title:       asg.title,
      course:      asg.course,
      instructor:  asg.instructor,
      dueDate:     asg.dueDate,
      startDate:   asg.startDate || '',
      startTime:   asg.startTime || '',
      instructions: asg.instructions,
      selectedProblems: asg.problems.map(p => p.slug),
    });
    setEditTarget(asg);
    setShowModal(true);
  }

  // ── SAVE (create or update) ──────────────────────────
  function handleSave() {
    if (!form.title.trim()) { alert('Assignment title is required.'); return; }
    if (!form.dueDate)       { alert('Due date is required.'); return; }
    if (form.selectedProblems.length === 0) { alert('Select at least one problem.'); return; }

    const problems = PROBLEMS_POOL
      .filter(p => form.selectedProblems.includes(p.slug))
      .map((p, i) => ({ id: i + 1, slug: p.slug, title: p.title, difficulty: p.difficulty, points: 50, status: 'Unsolved' }));

    if (editTarget) {
      setAssignments(prev => prev.map(a =>
        a.id === editTarget.id
          ? { ...a, ...form, problems, totalCount: problems.length }
          : a
      ));
    } else {
      const newAsg = {
        id:             `asg-${Date.now()}`,
        title:          form.title,
        course:         form.course,
        instructor:     form.instructor,
        dueDate:        form.dueDate,
        startDate:      form.startDate,
        startTime:      form.startTime,
        instructions:   form.instructions,
        problems,
        completedCount: 0,
        totalCount:     problems.length,
        progress:       `0/${problems.length} Solved`,
      };
      setAssignments(prev => [newAsg, ...prev]);
    }
    setShowModal(false);
  }

  // ── DELETE ───────────────────────────────────────────
  function handleDelete(id) {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    setAssignments(prev => prev.filter(a => a.id !== id));
  }

  // ── PROBLEM TOGGLE ───────────────────────────────────
  function toggleProblem(slug) {
    setForm(f => ({
      ...f,
      selectedProblems: f.selectedProblems.includes(slug)
        ? f.selectedProblems.filter(s => s !== slug)
        : [...f.selectedProblems, slug]
    }));
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  };
  const modalStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--line-subtle)',
    borderRadius: '16px',
    width: '100%', maxWidth: '680px',
    maxHeight: '90vh', overflowY: 'auto',
    padding: '28px 32px',
    position: 'relative',
  };
  const inputStyle = {
    width: '100%', background: 'var(--bg-deep)',
    border: '1px solid var(--line-subtle)', borderRadius: '8px',
    color: 'var(--ink-primary)', fontFamily: 'inherit',
    fontSize: '13.5px', padding: '9px 12px',
    outline: 'none',
  };
  const labelStyle = { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '6px', display: 'block' };
  const rowStyle = { marginBottom: '18px' };

  return (
    <ProtectedRoute allowedRoles={['staff', 'instructor', 'admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />

        <main style={{ flex: 1, padding: '20px 0 60px' }}>
          <div className="container">
            <Breadcrumbs
              items={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Assignments Manager' }
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                  Course Assignments Manager
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                  Publish homework problem sets, configure submission cutoffs, and monitor student completion rates.
                </p>
              </div>

              <button
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={openCreate}
              >
                <Plus size={14} /> Create Assignment
              </button>
            </div>

            {/* TABLE */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 1.5fr 1fr 1fr 1fr',
                padding: '12px 20px',
                background: 'var(--bg-deep)',
                borderBottom: '1px solid var(--line-subtle)',
                fontSize: '11.5px', fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--ink-muted)'
              }}>
                <div>TITLE</div>
                <div>COURSE</div>
                <div>DUE DATE</div>
                <div>STUDENTS</div>
                <div style={{ textAlign: 'right' }}>ACTION</div>
              </div>

              {assignments.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>
                  No assignments yet. Click <strong>Create Assignment</strong> to get started.
                </div>
              )}

              {assignments.map(asg => {
                const editable = isBefore(asg.startDate ? `${asg.startDate}T${asg.startTime || '00:00'}` : null);
                return (
                  <div
                    key={asg.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.2fr 1.5fr 1fr 1fr 1fr',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--line-subtle)',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink-primary)' }}>{asg.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                        {asg.problems.length} problem{asg.problems.length !== 1 ? 's' : ''}
                        {asg.startDate && (
                          <span style={{ marginLeft: 8, color: editable ? '#10B981' : '#F59E0B' }}>
                            · Start: {asg.startDate} {asg.startTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)' }}>{asg.course}</div>

                    <div className="mono" style={{ fontSize: '12px', color: '#F59E0B' }}>{asg.dueDate}</div>

                    <div className="mono" style={{ fontSize: '12px', color: '#10B981' }}>
                      {asg.completedCount}/{asg.totalCount} Finished
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/assignments/${asg.id}`}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}
                      >
                        View Set
                      </Link>

                      {/* Edit only allowed before start time */}
                      <button
                        onClick={() => openEdit(asg)}
                        disabled={!editable}
                        title={editable ? 'Edit assignment' : 'Cannot edit after start time'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', fontSize: '11px',
                          background: editable ? 'rgba(99,102,241,.12)' : 'rgba(255,255,255,.04)',
                          border: `1px solid ${editable ? 'rgba(99,102,241,.3)' : 'var(--line-subtle)'}`,
                          borderRadius: '6px',
                          color: editable ? '#818CF8' : 'var(--ink-muted)',
                          cursor: editable ? 'pointer' : 'not-allowed',
                          fontWeight: 600,
                        }}
                      >
                        <Edit3 size={11} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(asg.id)}
                        title="Delete assignment"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', fontSize: '11px',
                          background: 'rgba(244,63,94,.08)',
                          border: '1px solid rgba(244,63,94,.25)',
                          borderRadius: '6px', color: '#F43F5E',
                          cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <AppFooter />
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────── */}
      {showModal && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', margin: 0 }}>
                  {editTarget ? '✏️ Edit Assignment' : '✨ Create New Assignment'}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
                  {editTarget ? 'Modify details before the assignment start time.' : 'Configure and publish a new homework problem set.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Title */}
            <div style={rowStyle}>
              <label style={labelStyle}><BookOpen size={12} style={{ display: 'inline', marginRight: 4 }} />Assignment Title *</label>
              <input
                style={inputStyle} placeholder="e.g. DSA Assignment 3: Trees & Heaps"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Course + Instructor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', ...rowStyle }}>
              <div>
                <label style={labelStyle}>Course *</label>
                <select style={inputStyle} value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Instructor</label>
                <input style={inputStyle} placeholder="Prof. Alan Vance" value={form.instructor}
                  onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} />
              </div>
            </div>

            {/* Start + Due */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', ...rowStyle }}>
              <div>
                <label style={labelStyle}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Start Date</label>
                <input type="date" style={inputStyle} value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Start Time</label>
                <input type="time" style={inputStyle} value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Due Date *</label>
                <input type="date" style={inputStyle} value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>

            {/* Instructions */}
            <div style={rowStyle}>
              <label style={labelStyle}>Instructions</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                placeholder="Describe the assignment goals, constraints, and submission requirements…"
                value={form.instructions}
                onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              />
            </div>

            {/* Problems Selector */}
            <div style={rowStyle}>
              <label style={labelStyle}>
                Problems ({form.selectedProblems.length} selected) *
              </label>
              <div style={{
                border: '1px solid var(--line-subtle)', borderRadius: '10px',
                overflow: 'hidden', maxHeight: '230px', overflowY: 'auto'
              }}>
                {PROBLEMS_POOL.map(p => {
                  const checked = form.selectedProblems.includes(p.slug);
                  return (
                    <div
                      key={p.slug}
                      onClick={() => toggleProblem(p.slug)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--line-subtle)',
                        cursor: 'pointer',
                        background: checked ? 'rgba(99,102,241,.07)' : 'transparent',
                        transition: 'background .1s',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '4px', flexShrink: 0,
                        border: checked ? '2px solid #6366F1' : '2px solid var(--line-subtle)',
                        background: checked ? '#6366F1' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {checked && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1, fontSize: '13px', color: 'var(--ink-primary)' }}>{p.title}</div>
                      <span style={{
                        fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                        background: `${DIFF_COLOR[p.difficulty]}20`,
                        color: DIFF_COLOR[p.difficulty],
                      }}>{p.difficulty}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: 'rgba(255,255,255,.05)', border: '1px solid var(--line-subtle)',
                  color: 'var(--ink-muted)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ padding: '9px 24px', fontSize: '13px' }}
              >
                {editTarget ? '💾 Save Changes' : '🚀 Publish Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
