'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Medal, Crown, TrendingUp, TrendingDown,
  Search, Filter, ChevronUp, ChevronDown, Award,
  Flame, Target, Star, Users, BarChart3, Zap,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight,
  Shield, Clock, Hash
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

// ──────── Tier badge config ────────
const TIER_STYLES = {
  'Grandmaster': { bg: 'rgba(255, 51, 51, 0.15)', border: 'rgba(255, 51, 51, 0.4)', color: '#FF3333', glow: '0 0 12px rgba(255, 51, 51, 0.3)' },
  'Master':      { bg: 'rgba(255, 140, 0, 0.15)', border: 'rgba(255, 140, 0, 0.4)', color: '#FF8C00', glow: '0 0 12px rgba(255, 140, 0, 0.3)' },
  'Diamond':     { bg: 'rgba(0, 206, 209, 0.15)', border: 'rgba(0, 206, 209, 0.4)', color: '#00CED1', glow: '0 0 12px rgba(0, 206, 209, 0.3)' },
  'Platinum':    { bg: 'rgba(229, 228, 226, 0.12)', border: 'rgba(229, 228, 226, 0.4)', color: '#E5E4E2', glow: 'none' },
  'Gold':        { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.4)', color: '#FFD700', glow: '0 0 12px rgba(255, 215, 0, 0.3)' },
  'Silver':      { bg: 'rgba(192, 192, 192, 0.12)', border: 'rgba(192, 192, 192, 0.3)', color: '#C0C0C0', glow: 'none' },
  'Bronze':      { bg: 'rgba(205, 127, 50, 0.12)', border: 'rgba(205, 127, 50, 0.3)', color: '#CD7F32', glow: 'none' },
  'Unranked':    { bg: 'rgba(128, 128, 128, 0.1)', border: 'rgba(128, 128, 128, 0.2)', color: '#808080', glow: 'none' },
};

const RARITY_STYLES = {
  common:    { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', color: '#94A3B8' },
  uncommon:  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#10B981' },
  rare:      { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)', color: '#38BDF8' },
  epic:      { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', color: '#A855F7' },
  legendary: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', color: '#F59E0B' },
};

// ──────── Sub-components ────────

function TierBadge({ tier }) {
  const style = TIER_STYLES[tier] || TIER_STYLES['Unranked'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px',
      fontWeight: 700, fontFamily: 'var(--font-mono)',
      background: style.bg, border: `1px solid ${style.border}`,
      color: style.color, boxShadow: style.glow
    }}>
      {tier === 'Grandmaster' && <Crown size={11} />}
      {tier === 'Master' && <Star size={11} />}
      {tier === 'Diamond' && '💎'}
      {tier}
    </span>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span style={{ fontSize: '18px' }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: '18px' }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: '18px' }}>🥉</span>;
  return (
    <span className="mono" style={{
      fontSize: '14px', fontWeight: 700,
      color: rank <= 10 ? '#F59E0B' : 'var(--ink-muted)'
    }}>
      #{rank}
    </span>
  );
}

function DeltaIndicator({ delta }) {
  if (delta > 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#10B981', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
      <ArrowUpRight size={13} /> +{delta}
    </span>
  );
  if (delta < 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#F43F5E', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
      <ArrowDownRight size={13} /> {delta}
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--ink-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
      <Minus size={13} /> 0
    </span>
  );
}

// ──────── Mini Rating Chart (SVG) ────────
function MiniRatingChart({ history, width = 600, height = 200 }) {
  if (!history || history.length < 2) {
    return <div style={{ color: 'var(--ink-muted)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>Not enough data to display chart</div>;
  }

  const ratings = history.map(h => h.ratingAfter);
  const minR = Math.min(...ratings) - 100;
  const maxR = Math.max(...ratings) + 100;
  const range = maxR - minR || 1;

  const points = ratings.map((r, i) => {
    const x = (i / (ratings.length - 1)) * (width - 40) + 20;
    const y = height - 30 - ((r - minR) / range) * (height - 60);
    return { x, y, r };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - 30} L ${points[0].x} ${height - 30} Z`;

  // Tier lines
  const tierLines = [
    { rating: 2400, label: 'GM', color: '#FF3333' },
    { rating: 2100, label: 'Master', color: '#FF8C00' },
    { rating: 1800, label: 'Diamond', color: '#00CED1' },
    { rating: 1400, label: 'Gold', color: '#FFD700' },
  ].filter(t => t.rating >= minR && t.rating <= maxR);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Tier reference lines */}
      {tierLines.map(t => {
        const y = height - 30 - ((t.rating - minR) / range) * (height - 60);
        return (
          <g key={t.label}>
            <line x1="20" y1={y} x2={width - 20} y2={y} stroke={t.color} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
            <text x={width - 18} y={y - 4} fill={t.color} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end" opacity="0.6">{t.label}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#chartGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
          {(i === 0 || i === points.length - 1 || i % Math.max(1, Math.floor(points.length / 6)) === 0) && (
            <text x={p.x} y={p.y - 10} fill="#C7D2FE" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="600">
              {p.r}
            </text>
          )}
        </g>
      ))}

      {/* X-axis labels */}
      {history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 6)) === 0 || i === history.length - 1).map((h, i) => {
        const idx = history.indexOf(h);
        const x = (idx / (history.length - 1)) * (width - 40) + 20;
        return (
          <text key={i} x={x} y={height - 8} fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
            {h.contestTitle.replace('DETOX ', '').substring(0, 10)}
          </text>
        );
      })}
    </svg>
  );
}

// ──────── Main Component ────────

export default function LeaderboardView() {
  const [activeSubTab, setActiveSubTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (searchQuery) params.set('search', searchQuery);
      if (tierFilter) params.set('tier', tierFilter);

      const [lbRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/leaderboards?${params}`),
        fetch(`${API_BASE}/api/leaderboards/stats`)
      ]);
      const lbData = await lbRes.json();
      const statsData = await statsRes.json();

      setLeaderboard(lbData.data || []);
      setStats(statsData.data || null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
    setLoading(false);
  }, [searchQuery, tierFilter]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // Fetch user profile
  const fetchUserProfile = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboards/user/${userId}`);
      const data = await res.json();
      setUserProfile(data.data || null);
      setSelectedUser(userId);
      setActiveSubTab('profile');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={11} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  const subTabs = [
    { id: 'global', label: 'Global Rankings', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile & Rating', icon: TrendingUp },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ═══════ Hero Banner ═══════ */}
      <div className="card" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 4px 30px rgba(245, 158, 11, 0.08)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', right: '-50px', top: '-50px', width: '260px', height: '260px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-ai" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#F59E0B' }}>
                <Trophy size={12} /> GLOBAL LEADERBOARD
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                Season 2026 · ELO-Based Rating System
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.3px', margin: '4px 0 6px' }}>
              DETOX Code Competitive Rankings
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', margin: 0 }}>
              Performance-based rankings with ICPC-style scoring, ELO rating changes, tier progression & achievement tracking
            </p>
          </div>

          {/* Quick stats */}
          {stats && (
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { label: 'COMPETITORS', value: stats.totalUsers, icon: Users, color: '#38BDF8' },
                { label: 'TOP RATING', value: stats.topRating, icon: Crown, color: '#F59E0B' },
                { label: 'CONTESTS', value: stats.totalContests, icon: Trophy, color: '#818CF8' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#090D15', border: '1px solid var(--line-subtle)',
                  borderRadius: 'var(--r-md)', padding: '10px 16px', textAlign: 'center',
                  minWidth: '100px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                    <s.icon size={12} color={s.color} />
                    <span className="mono" style={{ fontSize: '9.5px', color: 'var(--ink-muted)' }}>{s.label}</span>
                  </div>
                  <div className="mono" style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Sub-Tab Navigation ═══════ */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--line-subtle)', paddingBottom: '0' }}>
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
              padding: '10px 16px', fontSize: '12.5px', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#FFFFFF' : 'var(--ink-muted)',
              borderBottom: isActive ? '2px solid #F59E0B' : '2px solid transparent',
              background: isActive ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s ease', cursor: 'pointer',
              borderRadius: '8px 8px 0 0'
            }}>
              <Icon size={14} color={isActive ? '#F59E0B' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════ TAB: Global Rankings ═══════ */}
      {activeSubTab === 'global' && (
        <>
          {/* Tier distribution bar + search/filter */}
          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              {/* Tier distribution */}
              {stats?.tierDistribution && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {stats.tierDistribution.map(t => (
                    <button key={t.tier}
                      onClick={() => setTierFilter(tierFilter === t.tier ? '' : t.tier)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px',
                        fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer',
                        background: tierFilter === t.tier ? t.color + '22' : 'transparent',
                        border: tierFilter === t.tier ? `1px solid ${t.color}55` : '1px solid transparent',
                        color: t.color, transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                      {t.tier} ({t.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-surface)', border: '1px solid var(--line-subtle)',
                borderRadius: 'var(--r-sm)', padding: '6px 12px', minWidth: '240px'
              }}>
                <Search size={14} color="var(--ink-muted)" />
                <input
                  type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by username..."
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ink-primary)', fontSize: '13px', width: '100%',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rankings table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                Loading rankings...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    background: 'var(--bg-deep)',
                    borderBottom: '1px solid var(--line-strong)',
                    color: 'var(--ink-muted)',
                    fontFamily: 'var(--font-mono)', fontSize: '10.5px'
                  }}>
                    <th onClick={() => handleSort('rank')} style={{ padding: '12px 16px', width: '60px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>RANK <SortIcon field="rank" /></div>
                    </th>
                    <th style={{ padding: '12px 16px' }}>COMPETITOR</th>
                    <th onClick={() => handleSort('rating')} style={{ padding: '12px 16px', width: '120px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>RATING <SortIcon field="rating" /></div>
                    </th>
                    <th style={{ padding: '12px 16px', width: '110px' }}>TIER</th>
                    <th onClick={() => handleSort('problemsSolved')} style={{ padding: '12px 16px', width: '90px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>SOLVED <SortIcon field="problemsSolved" /></div>
                    </th>
                    <th onClick={() => handleSort('contestsPlayed')} style={{ padding: '12px 16px', width: '100px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>CONTESTS <SortIcon field="contestsPlayed" /></div>
                    </th>
                    <th style={{ padding: '12px 16px', width: '70px' }}>WIN %</th>
                    <th style={{ padding: '12px 16px', width: '70px' }}>STREAK</th>
                    <th style={{ padding: '12px 16px', width: '80px' }}>Δ RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map(row => (
                    <tr key={row.userId}
                      onClick={() => fetchUserProfile(row.userId)}
                      style={{
                        borderBottom: '1px solid var(--line-subtle)',
                        cursor: 'pointer',
                        background: row.rank <= 3 ? `rgba(245, 158, 11, ${0.06 - row.rank * 0.015})` : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = row.rank <= 3 ? `rgba(245, 158, 11, ${0.06 - row.rank * 0.015})` : 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <RankBadge rank={row.rank} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>{row.avatar}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink-primary)', fontSize: '13.5px' }}>
                              {row.displayName}
                            </div>
                            <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                              @{row.username}
                              {row.country && <span style={{ marginLeft: '6px' }}>{getFlagEmoji(row.country)}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="mono" style={{
                          fontSize: '15px', fontWeight: 800,
                          color: TIER_STYLES[row.tier]?.color || 'var(--ink-primary)'
                        }}>
                          {row.rating}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <TierBadge tier={row.tier} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: '#38BDF8' }}>
                          {row.problemsSolved}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="mono" style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>
                          {row.contestsPlayed}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="mono" style={{ fontSize: '12px', color: row.winRate > 20 ? '#10B981' : 'var(--ink-muted)' }}>
                          {row.winRate}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {row.streak > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#F97316', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            <Flame size={13} /> {row.streak}d
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <DeltaIndicator delta={row.ratingDelta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ═══════ TAB: Achievements ═══════ */}
      {activeSubTab === 'achievements' && (
        <div>
          <div className="card" style={{ padding: '22px 26px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Award size={18} color="#F59E0B" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                Your Achievements & Milestones
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '0 0 20px' }}>
              Earn achievements by solving problems, competing in contests, and maintaining streaks. Click a competitor in the rankings to view their achievements.
            </p>

            <AchievementGrid userId={selectedUser || 'u010'} />
          </div>
        </div>
      )}

      {/* ═══════ TAB: Profile & Rating ═══════ */}
      {activeSubTab === 'profile' && (
        <UserProfilePanel
          profile={userProfile}
          onSelectUser={fetchUserProfile}
          currentUserId={selectedUser || 'u010'}
        />
      )}
    </div>
  );
}

// ──────── Achievement Grid ────────
function AchievementGrid({ userId }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/leaderboards/user/${userId}/achievements`);
        const data = await res.json();
        setAchievements(data.data || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div style={{ padding: '20px', color: 'var(--ink-muted)' }}>Loading achievements...</div>;
  if (achievements.length === 0) return <div style={{ padding: '20px', color: 'var(--ink-muted)' }}>No achievements yet. Start solving!</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
      {achievements.map(ach => {
        const rStyle = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
        return (
          <div key={ach.id} style={{
            background: 'var(--bg-surface)', border: `1px solid ${rStyle.border}`,
            borderRadius: 'var(--r-md)', padding: '16px 18px',
            display: 'flex', gap: '14px', alignItems: 'flex-start',
            transition: 'all 0.15s ease'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = rStyle.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = rStyle.border; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: '28px' }}>{ach.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-primary)' }}>{ach.title}</span>
                <span style={{
                  fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  padding: '1px 6px', borderRadius: '4px',
                  background: rStyle.bg, color: rStyle.color, textTransform: 'uppercase'
                }}>{ach.rarity}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '3px' }}>{ach.description}</div>
              <div className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '6px' }}>
                Earned {new Date(ach.earnedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────── User Profile Panel ────────
function UserProfilePanel({ profile, onSelectUser, currentUserId }) {
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!profile && currentUserId) {
      (async () => {
        setLoadingProfile(true);
        try {
          // auto-load current user profile on first mount
          await onSelectUser(currentUserId);
        } catch (err) { console.error(err); }
        setLoadingProfile(false);
      })();
    }
  }, []);

  if (!profile) return (
    <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
      <Trophy size={40} color="var(--ink-muted)" style={{ marginBottom: '12px' }} />
      <h3 style={{ color: 'var(--ink-secondary)', margin: '0 0 8px' }}>Select a Competitor</h3>
      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
        Click on any competitor in the Global Rankings tab to view their detailed profile and rating history.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Profile header card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '48px' }}>{profile.avatar}</span>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 4px' }}>
                {profile.displayName}
              </h2>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>@{profile.username}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <TierBadge tier={profile.tier} />
                <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                  Global Rank #{profile.globalRank} of {profile.totalParticipants}
                </span>
              </div>
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Rating', value: profile.rating, color: TIER_STYLES[profile.tier]?.color || '#818CF8' },
              { label: 'Solved', value: `${profile.problemsSolved}/${profile.totalProblems}`, color: '#38BDF8' },
              { label: 'Contests', value: profile.contestsPlayed, color: '#818CF8' },
              { label: 'Best', value: `#${profile.bestRank}`, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating chart */}
      <div className="card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart3 size={16} color="#818CF8" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
            Rating History
          </h3>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)', marginLeft: 'auto' }}>
            {profile.ratingHistory.length} rated contests
          </span>
        </div>
        <MiniRatingChart history={profile.ratingHistory} width={700} height={220} />
      </div>

      {/* Two-column: Skills + Recent Contests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {/* Skill Breakdown */}
        <div className="card" style={{ padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={16} color="#38BDF8" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>Skill Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.skillBreakdown.map(skill => (
              <div key={skill.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)' }}>{skill.category}</span>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                    {skill.solved}/{skill.total} · {skill.accuracy}%
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${(skill.solved / skill.total) * 100}%`,
                    background: skill.accuracy >= 80 ? '#10B981' : skill.accuracy >= 60 ? '#F59E0B' : '#F43F5E',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contest Results */}
        <div className="card" style={{ padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={16} color="#F59E0B" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>Recent Contests</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profile.ratingHistory.slice(-6).reverse().map(h => (
              <div key={h.contestId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 'var(--r-sm)',
                background: 'var(--bg-surface)', border: '1px solid var(--line-subtle)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink-primary)' }}>{h.contestTitle}</div>
                  <div className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                    Rank #{h.rank}/{h.totalParticipants} · {h.problemsSolved}/{h.totalProblems} solved
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <DeltaIndicator delta={h.delta} />
                  <div className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                    {h.ratingBefore} → {h.ratingAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Award size={16} color="#F59E0B" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
            Achievements ({profile.achievements.length})
          </h3>
        </div>
        {profile.achievements.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {profile.achievements.map(ach => {
              const rStyle = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
              return (
                <div key={ach.id} title={ach.description} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                  background: rStyle.bg, border: `1px solid ${rStyle.border}`,
                  color: rStyle.color, fontWeight: 600, cursor: 'default'
                }}>
                  <span>{ach.icon}</span>
                  {ach.title}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>No achievements yet.</p>
        )}
      </div>
    </div>
  );
}

// ──────── Utility ────────
function getFlagEmoji(countryCode) {
  const flags = { IN: '🇮🇳', US: '🇺🇸', UK: '🇬🇧', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', NG: '🇳🇬', CA: '🇨🇦', ES: '🇪🇸', AU: '🇦🇺', KR: '🇰🇷', PK: '🇵🇰' };
  return flags[countryCode] || '';
}
