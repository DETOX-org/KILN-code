'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import { PROBLEMS } from '../data/problemsData';
import { Search, CheckCircle2, Clock, ArrowRight, Tag, BookOpen, ChevronRight } from 'lucide-react';

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    'All',
    'Arrays & Hashing',
    'Two Pointers',
    'Dynamic Programming',
    'Graphs',
    'CS Systems'
  ];

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter((prob) => {
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
  }, [searchQuery, selectedDifficulty, selectedCategory, selectedStatus]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '20px 0 60px' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Problems' }]} />

          {/* Page Title & Search Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
                Problem Library
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', margin: 0 }}>
                Master algorithmic patterns, systems benchmarks, and contest subtasks.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} color="var(--ink-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search problem title, tags, or patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--ink-primary)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--line-subtle)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 18px',
            marginBottom: '20px'
          }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--r-pill)',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: isActive ? 'var(--line-active)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--ink-muted)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--line-active)' : 'transparent'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Difficulty dropdown & Status filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '5px 10px',
                  fontSize: '12px',
                  color: 'var(--ink-secondary)'
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '5px 10px',
                  fontSize: '12px',
                  color: 'var(--ink-secondary)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="attempted">Attempted</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>
          </div>

          {/* Problem Table / Cards List */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1.2fr',
              padding: '12px 20px',
              background: 'var(--bg-deep)',
              borderBottom: '1px solid var(--line-subtle)',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)'
            }}>
              <div>STATUS</div>
              <div>PROBLEM TITLE</div>
              <div>DIFFICULTY</div>
              <div>ACCEPTANCE</div>
              <div>POINTS</div>
              <div style={{ textAlign: 'right' }}>ACTION</div>
            </div>

            {/* Rows */}
            {filteredProblems.map((prob) => {
              const diffColor =
                prob.difficulty === 'Easy' ? '#10B981' :
                prob.difficulty === 'Medium' ? '#F59E0B' :
                prob.difficulty === 'Hard' ? '#F43F5E' : '#C084FC';

              return (
                <div
                  key={prob.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 2.5fr 1fr 1fr 1fr 1.2fr',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--line-subtle)',
                    alignItems: 'center',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Status */}
                  <div>
                    {prob.solved ? (
                      <CheckCircle2 size={16} color="var(--status-accepted)" />
                    ) : prob.attempted ? (
                      <Clock size={16} color="var(--status-pending)" />
                    ) : (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
                    )}
                  </div>

                  {/* Title & Tags */}
                  <div>
                    <Link
                      href={`/problems/${prob.slug}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--ink-primary)',
                        textDecoration: 'none',
                        display: 'block'
                      }}
                    >
                      {prob.title}
                    </Link>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {prob.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--ink-muted)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '1px 6px',
                            borderRadius: '3px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: diffColor,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {prob.difficulty}
                    </span>
                  </div>

                  {/* Acceptance */}
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                    {prob.acceptance}
                  </div>

                  {/* Points */}
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-primary)', fontWeight: 600 }}>
                    {prob.points} pts
                  </div>

                  {/* Action Link */}
                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link
                      href={`/problems/${prob.slug}`}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                    >
                      Details
                    </Link>
                    <Link
                      href={`/problems/${prob.slug}/solve`}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                    >
                      Solve →
                    </Link>
                  </div>
                </div>
              );
            })}

            {filteredProblems.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                No problems match the current filter criteria.
              </div>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
