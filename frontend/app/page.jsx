'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProblemLibraryView from './components/ProblemLibraryView';
import WorkspaceView from './components/WorkspaceView';
import AlgorithmVisualizerView from './components/AlgorithmVisualizerView';
import ContestArenaView from './components/ContestArenaView';
import StrictAssessmentView from './components/StrictAssessmentView';
import PlagiarismReviewView from './components/PlagiarismReviewView';
import CoursesView from './components/CoursesView';
import AdminDiscrepancyView from './components/AdminDiscrepancyView';

export default function Home() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // 'student' | 'admin'
  const [activeProblem, setActiveProblem] = useState({
    id: 142,
    title: 'Maximum Subarray Sum with Modulo K',
    difficulty: 'Medium',
    points: 50
  });

  const handleSelectProblem = (prob) => {
    setActiveProblem(prob);
    setActiveTab('workspace');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ================= GLOBAL UNIFIED HEADER ================= */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        discrepancyCount={1}
      />

      {/* ================= MAIN APPLICATION ROUTER ================= */}
      <main style={{ flex: 1, padding: '28px 0 60px' }}>
        <div className="container">
          
          {/* TAB 1: USER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectProblem={handleSelectProblem}
              onOpenContests={() => setActiveTab('contests')}
              onOpenCourses={() => setActiveTab('courses')}
            />
          )}

          {/* TAB 2: PROBLEM LIBRARY */}
          {activeTab === 'problems' && (
            <ProblemLibraryView
              onSelectProblem={handleSelectProblem}
            />
          )}

          {/* TAB 3: INTERACTIVE CODING IDE & WORKSPACE */}
          {activeTab === 'workspace' && (
            <WorkspaceView
              activeProblem={activeProblem}
              onSolveContest={() => setActiveTab('contests')}
            />
          )}

          {/* TAB 4: INTERACTIVE ALGORITHM VISUALIZER */}
          {activeTab === 'visualizer' && (
            <AlgorithmVisualizerView />
          )}

          {/* TAB 5: CONTEST ARENA & LEADERBOARD */}
          {activeTab === 'contests' && (
            <ContestArenaView
              onSelectProblem={handleSelectProblem}
            />
          )}

          {/* TAB 6: STRICT ASSESSMENT & PROCTORING LOCKDOWN */}
          {activeTab === 'assessment' && (
            <StrictAssessmentView />
          )}

          {/* TAB 7: CODE PLAGIARISM & AST SIMILARITY REVIEW */}
          {activeTab === 'plagiarism' && (
            <PlagiarismReviewView />
          )}

          {/* TAB 8: COURSES & LEARNING PATHS */}
          {activeTab === 'courses' && (
            <CoursesView
              onStartPractice={() => setActiveTab('workspace')}
            />
          )}

          {/* TAB 9: STAFF ADMIN & DISCREPANCY ARBITER */}
          {activeTab === 'admin' && (
            <AdminDiscrepancyView />
          )}

        </div>
      </main>

      {/* ================= PLATFORM FOOTER ================= */}
      <footer style={{
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--line-subtle)',
        padding: '24px 0',
        marginTop: 'auto',
        fontSize: '12px',
        color: 'var(--ink-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>DETOX Code Engine</span> · Multi-Cluster Dual-Engine Sandbox (Judge0 &amp; Piston)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Server-Authoritative Clock NTP</span>
            <span>•</span>
            <span>AST Structural Diff</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
