'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Award, Terminal, Cpu, Database, Network } from 'lucide-react';

export default function CoursesView({ onStartPractice }) {
  const [activeCourse, setActiveCourse] = useState('dsa_core');

  const courses = {
    dsa_core: {
      title: 'Data Structures & Algorithms Foundations',
      subtitle: 'Complete roadmap from arrays to dynamic programming with real-world system mappings',
      progress: 68,
      xpTotal: 2400,
      modules: [
        {
          id: 1,
          name: 'Module 1: Linear Structures & Two-Pointer Windows',
          lessons: [
            { id: '1.1', title: 'Array Contiguity & Memory Cache Locality (L1/L2 Cache)', duration: '20 mins', completed: true },
            { id: '1.2', title: 'Two-Pointer Technique & Container With Most Water', duration: '25 mins', completed: true },
            { id: '1.3', title: 'Sliding Window Invariants & Maximum Subarray Modulo K', duration: '35 mins', completed: true },
            { id: '1.4', title: 'Prefix Sum Hash Lookup Optimization', duration: '30 mins', completed: false }
          ]
        },
        {
          id: 2,
          name: 'Module 2: Trees, Heaps & Balanced BSTs',
          lessons: [
            { id: '2.1', title: 'Binary Trees & Recursion Call Stacks', duration: '25 mins', completed: true },
            { id: '2.2', title: 'Self-Balancing Red-Black Trees vs AVL Rotations', duration: '40 mins', completed: false },
            { id: '2.3', title: 'Priority Queues & CPU Kernel Task Schedulers', duration: '30 mins', completed: false },
            { id: '2.4', title: 'Segment Trees & Dynamic Range Query Trees', duration: '45 mins', completed: false }
          ]
        },
        {
          id: 3,
          name: 'Module 3: Graph Traversal & Shortest Paths',
          lessons: [
            { id: '3.1', title: 'Breadth-First Search & Unweighted Shortest Path', duration: '30 mins', completed: false },
            { id: '3.2', title: 'Dijkstra & A* Heuristic Search in Transit Routing', duration: '40 mins', completed: false },
            { id: '3.3', title: 'Topological Sort & Compiler Dependency Resolution DAGs', duration: '35 mins', completed: false }
          ]
        }
      ]
    },
    system_design: {
      title: 'CS Systems & Distributed Architecture',
      subtitle: 'From operating system internals to distributed consensus and high-throughput caches',
      progress: 42,
      xpTotal: 3200,
      modules: [
        {
          id: 1,
          name: 'Module 1: Operating Systems & Low-Level Memory',
          lessons: [
            { id: '1.1', title: 'Virtual Memory, Page Faults, and Linux cgroups', duration: '30 mins', completed: true },
            { id: '1.2', title: 'Epoll, Async I/O, and Event-Loop Architectures', duration: '40 mins', completed: true }
          ]
        },
        {
          id: 2,
          name: 'Module 2: Distributed Consensus & Replication',
          lessons: [
            { id: '2.1', title: 'Raft Consensus & Leader Election State Machines', duration: '45 mins', completed: false },
            { id: '2.2', title: 'Consistent Hashing & Dynamo-style Sharded Ring Buffers', duration: '35 mins', completed: false }
          ]
        }
      ]
    }
  };

  const current = courses[activeCourse];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Course Track Selector Header */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-ai">
                <BookOpen size={12} />
                Structured Learning Curriculum (Spec §18)
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Interactive Tracks</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              {current.title}
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: '4px 0 0' }}>
              {current.subtitle}
            </p>
          </div>

          {/* Track Switcher */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-subtle)' }}>
            <button
              onClick={() => setActiveCourse('dsa_core')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                background: activeCourse === 'dsa_core' ? 'var(--line-active)' : 'transparent',
                color: activeCourse === 'dsa_core' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              DSA Core Track
            </button>
            <button
              onClick={() => setActiveCourse('system_design')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                background: activeCourse === 'system_design' ? 'var(--line-active)' : 'transparent',
                color: activeCourse === 'system_design' ? '#fff' : 'var(--ink-muted)'
              }}
            >
              CS Systems &amp; Architecture
            </button>
          </div>
        </div>

        {/* Course Progress Strip */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--line-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              TRACK PROGRESS:
            </span>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-deep)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${current.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #38BDF8)', borderRadius: '4px' }} />
            </div>
            <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: '#38BDF8' }}>
              {current.progress}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-accepted">
              <Award size={12} /> Earn +{current.xpTotal} Total XP
            </span>
            <button
              onClick={() => onStartPractice()}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '12px' }}
            >
              Continue Lesson 1.4 <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {current.modules.map((mod) => (
          <div key={mod.id} className="card" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                {mod.name}
              </h3>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                {mod.lessons.filter(l => l.completed).length} / {mod.lessons.length} Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mod.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--line-strong)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {lesson.completed ? (
                      <CheckCircle2 size={18} color="var(--status-accepted)" />
                    ) : (
                      <PlayCircle size={18} color="#818CF8" />
                    )}
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: lesson.completed ? 'var(--ink-muted)' : 'var(--ink-primary)' }}>
                        {lesson.title}
                      </div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                        Lesson {lesson.id} · {lesson.duration}
                      </div>
                    </div>
                  </div>

                  <div>
                    {lesson.completed ? (
                      <span className="badge badge-accepted" style={{ fontSize: '10.5px' }}>Completed</span>
                    ) : (
                      <button
                        onClick={() => onStartPractice()}
                        className="btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '11.5px' }}
                      >
                        Start Lesson
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
