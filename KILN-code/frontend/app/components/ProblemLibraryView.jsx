'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, Clock, ArrowRight, Tag, BookOpen, Sparkles, ChevronRight } from 'lucide-react';

export default function ProblemLibraryView({ onSelectProblem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'easy' | 'medium' | 'hard' | 'expert'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const problems = [
    {
      id: 142,
      title: 'Maximum Subarray Sum with Modulo K',
      slug: 'maximum-subarray-sum-modulo-k',
      difficulty: 'Medium',
      category: 'Dynamic Programming',
      tags: ['Prefix Sums', 'Balanced BST', 'Binary Search'],
      acceptance: '48.2%',
      solved: true,
      points: 50,
      realWorld: 'Kafka partition ring buffer windowing'
    },
    {
      id: 104,
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      difficulty: 'Medium',
      category: 'Two Pointers',
      tags: ['Two Pointers', 'Greedy', 'Arrays'],
      acceptance: '54.7%',
      solved: true,
      points: 40,
      realWorld: 'Geometric histogram clipping in GPU rendering'
    },
    {
      id: 88,
      title: 'Shortest Path in Directed Acyclic Graph',
      slug: 'shortest-path-dag',
      difficulty: 'Hard',
      category: 'Graphs',
      tags: ['Topological Sort', 'DAG', 'Dynamic Programming'],
      acceptance: '32.1%',
      solved: false,
      attempted: true,
      points: 75,
      realWorld: 'Build dependency DAG execution in Turbo/Bazel'
    },
    {
      id: 201,
      title: 'LRU Cache Eviction Architecture',
      slug: 'lru-cache-eviction',
      difficulty: 'Medium',
      category: 'CS Systems',
      tags: ['Hash Map', 'Doubly Linked List', 'System Design'],
      acceptance: '41.5%',
      solved: true,
      points: 60,
      realWorld: 'Redis memory maxmemory eviction policies'
    },
    {
      id: 312,
      title: 'Burst Balloons Optimal Matrix',
      slug: 'burst-balloons',
      difficulty: 'Hard',
      category: 'Dynamic Programming',
      tags: ['Interval DP', 'Memoization'],
      acceptance: '28.4%',
      solved: false,
      points: 90,
      realWorld: 'Compiler AST register allocation optimization'
    },
    {
      id: 45,
      title: 'Two Sum Optimal Lookup',
      slug: 'two-sum',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      tags: ['Hash Table', 'Arrays'],
      acceptance: '53.1%',
      solved: true,
      points: 20,
      realWorld: 'SQL hash join index acceleration'
    },
    {
      id: 520,
      title: 'Distributed Consensus & Paxos Log Replication',
      slug: 'distributed-consensus-paxos',
      difficulty: 'Expert',
      category: 'CS Systems',
      tags: ['Distributed Systems', 'Quorum', 'State Machine'],
      acceptance: '18.9%',
      solved: false,
      points: 150,
      realWorld: 'Raft/etcd leader election in Kubernetes'
    },
    {
      id: 215,
      title: 'Kth Largest Element in an Array (QuickSelect)',
      slug: 'kth-largest-element',
      difficulty: 'Medium',
      category: 'Two Pointers',
      tags: ['QuickSelect', 'Divide & Conquer', 'Heap'],
      acceptance: '66.4%',
      solved: false,
      attempted: true,
      points: 45,
      realWorld: 'P99 latency quantile calculations in Datadog'
    }
  ];

  const categories = [
    'All',
    'Arrays & Hashing',
    'Two Pointers',
    'Dynamic Programming',
    'Graphs',
    'CS Systems'
  ];

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const matchSearch =
        prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prob.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDifficulty =
        selectedDifficulty === 'all' ||
        prob.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const matchCategory =
        selectedCategory === 'all' ||
        prob.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'solved' && prob.solved) ||
        (selectedStatus === 'attempted' && prob.attempted && !prob.solved) ||
        (selectedStatus === 'unsolved' && !prob.solved && !prob.attempted);

      return matchSearch && matchDifficulty && matchCategory && matchStatus;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, selectedStatus]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-cyan">
                <BookOpen size={12} />
                Curated Problem Catalog
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>450 Problems Available</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Problem Library &amp; Algorithmic Tracks
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Search by concept, difficulty tier, or real-world system application. Click any problem to open directly in the IDE.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="var(--ink-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search problems or tags (e.g. DP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '36px',
                fontSize: '13px'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '8px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-elevated)',
              padding: '2px 5px',
              borderRadius: '3px',
              color: 'var(--ink-muted)'
            }}>/</span>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--line-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              TOPIC:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-pill)',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  fontWeight: selectedCategory === cat.toLowerCase() ? 600 : 400,
                  background: selectedCategory === cat.toLowerCase() ? 'var(--line-active)' : 'var(--bg-surface)',
                  color: selectedCategory === cat.toLowerCase() ? '#fff' : 'var(--ink-secondary)',
                  border: '1px solid var(--line-subtle)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty & Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                DIFFICULTY:
              </span>
              {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    textTransform: 'capitalize',
                    background: selectedDifficulty === diff ? 'var(--bg-elevated)' : 'transparent',
                    color: selectedDifficulty === diff ? '#fff' : 'var(--ink-muted)',
                    fontWeight: selectedDifficulty === diff ? 600 : 400
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                STATUS:
              </span>
              {['all', 'solved', 'attempted', 'unsolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    textTransform: 'capitalize',
                    background: selectedStatus === st ? 'var(--bg-elevated)' : 'transparent',
                    color: selectedStatus === st ? '#fff' : 'var(--ink-muted)',
                    fontWeight: selectedStatus === st ? 600 : 400
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Problems Data Table Card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line-strong)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <th style={{ padding: '12px 16px', width: '50px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>PROBLEM &amp; PRODUCTION APPLICATION</th>
              <th style={{ padding: '12px 16px', width: '120px' }}>DIFFICULTY</th>
              <th style={{ padding: '12px 16px', width: '120px' }}>ACCEPTANCE</th>
              <th style={{ padding: '12px 16px', width: '80px' }}>XP</th>
              <th style={{ padding: '12px 16px', width: '140px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((prob) => {
              let diffBadgeClass = 'badge-pending';
              if (prob.difficulty === 'Easy') diffBadgeClass = 'badge-accepted';
              if (prob.difficulty === 'Hard') diffBadgeClass = 'badge-wrong';
              if (prob.difficulty === 'Expert') diffBadgeClass = 'badge-ai';

              return (
                <tr
                  key={prob.id}
                  style={{
                    borderBottom: '1px solid var(--line-subtle)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Status column */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {prob.solved ? (
                      <CheckCircle2 size={16} color="var(--status-accepted)" />
                    ) : prob.attempted ? (
                      <Clock size={16} color="var(--status-pending)" />
                    ) : (
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--line-strong)' }} />
                    )}
                  </td>

                  {/* Title & Real world note */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>#{prob.id}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink-primary)' }}>
                        {prob.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                        ⚡ Real System: {prob.realWorld}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {prob.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            style={{
                              background: 'var(--bg-surface)',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              color: 'var(--ink-muted)'
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${diffBadgeClass}`}>
                      {prob.difficulty}
                    </span>
                  </td>

                  {/* Acceptance */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                        {prob.acceptance}
                      </span>
                    </div>
                  </td>

                  {/* XP */}
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>
                      +{prob.points}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectProblem(prob)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Solve in IDE <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProblems.length === 0 && (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--ink-muted)' }}>
            No problems match your current search and filter criteria.
          </div>
        )}
      </div>

    </div>
  );
}
