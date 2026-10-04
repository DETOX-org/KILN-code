/**
 * Leaderboard Store
 * 
 * Manages global leaderboard state, user ratings, rating history,
 * achievements, and per-contest/global ranking data.
 */

import { scoringService } from "../services/scoring.service.js";

// ──────────── Types ────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  rating: number;
  ratingDelta: number;
  tier: string;
  totalScore: number;
  problemsSolved: number;
  contestsPlayed: number;
  winRate: number;
  streak: number;
  bestRank: number;
  lastActive: string;
  country?: string;
}

export interface RatingHistoryEntry {
  contestId: string;
  contestTitle: string;
  date: string;
  rank: number;
  totalParticipants: number;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'milestone' | 'contest' | 'streak' | 'skill' | 'community';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  rating: number;
  tier: string;
  globalRank: number;
  totalParticipants: number;
  problemsSolved: number;
  totalProblems: number;
  contestsPlayed: number;
  winRate: number;
  streak: number;
  bestRank: number;
  ratingHistory: RatingHistoryEntry[];
  achievements: Achievement[];
  skillBreakdown: {
    category: string;
    solved: number;
    total: number;
    accuracy: number;
  }[];
}

// ──────────── Rating Tiers ────────────

function getTier(rating: number): string {
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2100) return 'Master';
  if (rating >= 1800) return 'Diamond';
  if (rating >= 1600) return 'Platinum';
  if (rating >= 1400) return 'Gold';
  if (rating >= 1200) return 'Silver';
  if (rating >= 900)  return 'Bronze';
  return 'Unranked';
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'Grandmaster': '#FF3333',
    'Master': '#FF8C00',
    'Diamond': '#00CED1',
    'Platinum': '#E5E4E2',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Bronze': '#CD7F32',
    'Unranked': '#808080'
  };
  return colors[tier] || '#808080';
}

// ──────────── Leaderboard Store ────────────

class LeaderboardStore {
  private globalLeaderboard: LeaderboardEntry[] = [];
  private ratingHistories: Map<string, RatingHistoryEntry[]> = new Map();
  private userAchievements: Map<string, Achievement[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    // Seed global leaderboard with realistic data
    const users = [
      { userId: 'u001', username: 'elena_algo', displayName: 'Elena Algo', avatar: '👩‍💻', rating: 2450, problems: 384, contests: 42, wins: 12, streak: 14, bestRank: 1, country: 'IN' },
      { userId: 'u002', username: 'alex_code', displayName: 'Alex Code', avatar: '👨‍💻', rating: 2280, problems: 312, contests: 38, wins: 8, streak: 7, bestRank: 1, country: 'US' },
      { userId: 'u003', username: 'sam_dev', displayName: 'Sam Dev', avatar: '🌟', rating: 2180, problems: 298, contests: 35, wins: 5, streak: 3, bestRank: 2, country: 'UK' },
      { userId: 'u004', username: 'priya_cp', displayName: 'Priya Sharma', avatar: '💎', rating: 2150, problems: 276, contests: 33, wins: 6, streak: 11, bestRank: 1, country: 'IN' },
      { userId: 'u005', username: 'chen_wei', displayName: 'Chen Wei', avatar: '🚀', rating: 2090, problems: 264, contests: 30, wins: 4, streak: 5, bestRank: 2, country: 'CN' },
      { userId: 'u006', username: 'marcus_v', displayName: 'Marcus Vance', avatar: '⚡', rating: 1980, problems: 242, contests: 28, wins: 3, streak: 2, bestRank: 3, country: 'DE' },
      { userId: 'u007', username: 'yuki_tanaka', displayName: 'Yuki Tanaka', avatar: '🎯', rating: 1920, problems: 228, contests: 26, wins: 2, streak: 9, bestRank: 3, country: 'JP' },
      { userId: 'u008', username: 'amara_n', displayName: 'Amara Nwosu', avatar: '🔥', rating: 1880, problems: 218, contests: 24, wins: 3, streak: 6, bestRank: 2, country: 'NG' },
      { userId: 'u009', username: 'liam_byte', displayName: 'Liam Byte', avatar: '💻', rating: 1820, problems: 196, contests: 22, wins: 1, streak: 4, bestRank: 4, country: 'CA' },
      { userId: 'u010', username: 'cipher_warrior', displayName: 'CIPHER_WARRIOR', avatar: '🛡️', rating: 1842, problems: 142, contests: 18, wins: 2, streak: 7, bestRank: 5, country: 'IN' },
      { userId: 'u011', username: 'sofia_code', displayName: 'Sofia Rodriguez', avatar: '🌸', rating: 1760, problems: 188, contests: 20, wins: 1, streak: 3, bestRank: 5, country: 'ES' },
      { userId: 'u012', username: 'raj_algo', displayName: 'Raj Patel', avatar: '🧠', rating: 1700, problems: 174, contests: 19, wins: 1, streak: 2, bestRank: 6, country: 'IN' },
      { userId: 'u013', username: 'emma_py', displayName: 'Emma Wilson', avatar: '🐍', rating: 1650, problems: 162, contests: 17, wins: 0, streak: 1, bestRank: 7, country: 'AU' },
      { userId: 'u014', username: 'kai_graph', displayName: 'Kai Nakamura', avatar: '📊', rating: 1580, problems: 148, contests: 15, wins: 0, streak: 0, bestRank: 8, country: 'JP' },
      { userId: 'u015', username: 'dev_ninja', displayName: 'Dev Ninja', avatar: '🥷', rating: 1520, problems: 134, contests: 14, wins: 0, streak: 5, bestRank: 9, country: 'KR' },
      { userId: 'u016', username: 'algo_queen', displayName: 'Aisha Khan', avatar: '👑', rating: 1480, problems: 126, contests: 13, wins: 1, streak: 2, bestRank: 4, country: 'PK' },
      { userId: 'u017', username: 'binary_bob', displayName: 'Bob Thompson', avatar: '🤖', rating: 1420, problems: 112, contests: 11, wins: 0, streak: 0, bestRank: 10, country: 'US' },
      { userId: 'u018', username: 'code_monk', displayName: 'Arjun Mehta', avatar: '🧘', rating: 1360, problems: 98, contests: 10, wins: 0, streak: 1, bestRank: 11, country: 'IN' },
      { userId: 'u019', username: 'stack_queen', displayName: 'Luna Park', avatar: '🌙', rating: 1280, problems: 84, contests: 8, wins: 0, streak: 0, bestRank: 14, country: 'KR' },
      { userId: 'u020', username: 'fresh_coder', displayName: 'James Doe', avatar: '🌱', rating: 1100, problems: 42, contests: 4, wins: 0, streak: 1, bestRank: 18, country: 'US' },
    ];

    this.globalLeaderboard = users
      .sort((a, b) => b.rating - a.rating)
      .map((u, idx) => ({
        rank: idx + 1,
        userId: u.userId,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        rating: u.rating,
        ratingDelta: Math.floor(Math.random() * 60) - 20,
        tier: getTier(u.rating),
        totalScore: u.rating * 2 + u.problems * 10,
        problemsSolved: u.problems,
        contestsPlayed: u.contests,
        winRate: Math.round((u.wins / Math.max(u.contests, 1)) * 100),
        streak: u.streak,
        bestRank: u.bestRank,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString(),
        country: u.country
      }));

    // Seed rating histories for top users
    this.seedRatingHistory('u001', 2450, 'elena_algo');
    this.seedRatingHistory('u002', 2280, 'alex_code');
    this.seedRatingHistory('u003', 2180, 'sam_dev');
    this.seedRatingHistory('u010', 1842, 'cipher_warrior');

    // Seed achievements
    this.seedAchievements();
  }

  private seedRatingHistory(userId: string, currentRating: number, _username: string): void {
    const history: RatingHistoryEntry[] = [];
    let rating = 1200; // everyone starts at 1200

    const contestNames = [
      'DETOX Weekly #1', 'DETOX Weekly #2', 'Spring Qualifier', 'DETOX Weekly #3',
      'Algorithm Grand Prix', 'DETOX Weekly #4', 'Summer Sprint', 'DETOX Weekly #5',
      'DETOX Weekly #6', 'Competitive Finals', 'DETOX Weekly #7', 'Data Structures Cup',
      'DETOX Weekly #8', 'Graph Theory Open', 'DETOX Weekly #9', 'DETOX Weekly #10',
      'Fall Championship', 'DETOX Weekly #11', 'DETOX Weekly #12', 'Year End Grand Prix'
    ];

    // Generate ~12-20 contest entries that trend toward current rating
    const numContests = Math.min(Math.floor(Math.random() * 8) + 12, contestNames.length);
    const ratingStep = (currentRating - 1200) / numContests;

    for (let i = 0; i < numContests; i++) {
      const targetRating = 1200 + ratingStep * (i + 1);
      const noise = Math.floor(Math.random() * 80) - 30;
      const newRating = Math.round(Math.min(Math.max(rating + ratingStep + noise, 100), currentRating + 50));
      const delta = newRating - rating;
      const totalP = Math.floor(Math.random() * 200) + 50;
      const rank = Math.max(1, Math.floor(totalP * (1 - (newRating / 3000))));

      history.push({
        contestId: `c-${String(i + 1).padStart(3, '0')}`,
        contestTitle: contestNames[i],
        date: new Date(Date.now() - (numContests - i) * 7 * 86400000).toISOString(),
        rank,
        totalParticipants: totalP,
        ratingBefore: rating,
        ratingAfter: newRating,
        delta,
        problemsSolved: Math.floor(Math.random() * 4) + 1,
        totalProblems: 4
      });

      rating = newRating;
    }

    this.ratingHistories.set(userId, history);
  }

  private seedAchievements(): void {
    const commonAchievements: Achievement[] = [
      { id: 'ach-first-solve', title: 'First Blood', description: 'Submitted your first accepted solution', icon: '🎯', earnedAt: new Date(Date.now() - 90 * 86400000).toISOString(), category: 'milestone', rarity: 'common' },
      { id: 'ach-10-solved', title: 'Problem Hunter', description: 'Solved 10 problems', icon: '🏹', earnedAt: new Date(Date.now() - 80 * 86400000).toISOString(), category: 'milestone', rarity: 'common' },
      { id: 'ach-50-solved', title: 'Half Century', description: 'Solved 50 problems', icon: '🎪', earnedAt: new Date(Date.now() - 60 * 86400000).toISOString(), category: 'milestone', rarity: 'uncommon' },
      { id: 'ach-100-solved', title: 'Century Club', description: 'Solved 100 problems', icon: '💯', earnedAt: new Date(Date.now() - 40 * 86400000).toISOString(), category: 'milestone', rarity: 'rare' },
      { id: 'ach-first-contest', title: 'Arena Initiate', description: 'Participated in your first contest', icon: '⚔️', earnedAt: new Date(Date.now() - 85 * 86400000).toISOString(), category: 'contest', rarity: 'common' },
      { id: 'ach-top10', title: 'Top 10 Finisher', description: 'Finished in top 10 of a rated contest', icon: '🏅', earnedAt: new Date(Date.now() - 30 * 86400000).toISOString(), category: 'contest', rarity: 'rare' },
      { id: 'ach-win', title: 'Champion', description: 'Won a rated contest', icon: '🏆', earnedAt: new Date(Date.now() - 14 * 86400000).toISOString(), category: 'contest', rarity: 'epic' },
      { id: 'ach-7day-streak', title: 'Week Warrior', description: 'Maintained a 7-day solving streak', icon: '🔥', earnedAt: new Date(Date.now() - 7 * 86400000).toISOString(), category: 'streak', rarity: 'uncommon' },
      { id: 'ach-30day-streak', title: 'Iron Discipline', description: 'Maintained a 30-day solving streak', icon: '⛓️', earnedAt: new Date(Date.now() - 2 * 86400000).toISOString(), category: 'streak', rarity: 'epic' },
      { id: 'ach-dp-master', title: 'DP Specialist', description: 'Solved 20 dynamic programming problems', icon: '🧩', earnedAt: new Date(Date.now() - 20 * 86400000).toISOString(), category: 'skill', rarity: 'rare' },
      { id: 'ach-graph-hero', title: 'Graph Hero', description: 'Solved 15 graph problems', icon: '🕸️', earnedAt: new Date(Date.now() - 15 * 86400000).toISOString(), category: 'skill', rarity: 'rare' },
      { id: 'ach-speed-demon', title: 'Speed Demon', description: 'Solved a hard problem in under 10 minutes', icon: '⚡', earnedAt: new Date(Date.now() - 5 * 86400000).toISOString(), category: 'skill', rarity: 'legendary' },
    ];

    // Give different users different achievements
    this.userAchievements.set('u010', commonAchievements.slice(0, 8)); // current user
    this.userAchievements.set('u001', commonAchievements); // elena gets all
    this.userAchievements.set('u002', commonAchievements.slice(0, 10));
    this.userAchievements.set('u003', commonAchievements.slice(0, 7));
  }

  // ──────────── Public API ────────────

  /**
   * Get global leaderboard with optional filters
   */
  getGlobalLeaderboard(opts?: {
    limit?: number;
    offset?: number;
    search?: string;
    tier?: string;
    timeRange?: 'all' | 'monthly' | 'weekly' | 'daily';
  }): { entries: LeaderboardEntry[]; total: number } {
    let entries = [...this.globalLeaderboard];

    if (opts?.search) {
      const q = opts.search.toLowerCase();
      entries = entries.filter(e =>
        e.username.toLowerCase().includes(q) ||
        e.displayName.toLowerCase().includes(q)
      );
    }

    if (opts?.tier) {
      entries = entries.filter(e => e.tier.toLowerCase() === opts.tier!.toLowerCase());
    }

    // Time range filtering would adjust scores; for now we just return all
    const total = entries.length;
    const offset = opts?.offset || 0;
    const limit = opts?.limit || 20;

    return {
      entries: entries.slice(offset, offset + limit),
      total
    };
  }

  /**
   * Get a specific user's rating history
   */
  getRatingHistory(userId: string): RatingHistoryEntry[] {
    return this.ratingHistories.get(userId) || [];
  }

  /**
   * Get a user's full profile with ratings, achievements, skills
   */
  getUserProfile(userId: string): UserProfile | null {
    const entry = this.globalLeaderboard.find(e => e.userId === userId);
    if (!entry) return null;

    const history = this.getRatingHistory(userId);
    const achievements = this.userAchievements.get(userId) || [];

    return {
      userId: entry.userId,
      username: entry.username,
      displayName: entry.displayName,
      avatar: entry.avatar,
      rating: entry.rating,
      tier: entry.tier,
      globalRank: entry.rank,
      totalParticipants: this.globalLeaderboard.length,
      problemsSolved: entry.problemsSolved,
      totalProblems: 450,
      contestsPlayed: entry.contestsPlayed,
      winRate: entry.winRate,
      streak: entry.streak,
      bestRank: entry.bestRank,
      ratingHistory: history,
      achievements,
      skillBreakdown: [
        { category: 'Arrays & Strings', solved: Math.floor(entry.problemsSolved * 0.25), total: 120, accuracy: 82 },
        { category: 'Dynamic Programming', solved: Math.floor(entry.problemsSolved * 0.15), total: 80, accuracy: 68 },
        { category: 'Graphs & Trees', solved: Math.floor(entry.problemsSolved * 0.18), total: 90, accuracy: 72 },
        { category: 'Sorting & Searching', solved: Math.floor(entry.problemsSolved * 0.2), total: 70, accuracy: 88 },
        { category: 'Math & Number Theory', solved: Math.floor(entry.problemsSolved * 0.12), total: 50, accuracy: 75 },
        { category: 'Greedy Algorithms', solved: Math.floor(entry.problemsSolved * 0.1), total: 40, accuracy: 80 },
      ]
    };
  }

  /**
   * Get achievements for a user
   */
  getAchievements(userId: string): Achievement[] {
    return this.userAchievements.get(userId) || [];
  }

  /**
   * Get scoring engine configuration
   */
  getScoringConfig() {
    return scoringService.getConfig();
  }

  /**
   * Update a user's rating after a contest result
   */
  updateRating(userId: string, contestId: string, contestTitle: string, rank: number, totalParticipants: number, problemsSolved: number, totalProblems: number): RatingHistoryEntry | null {
    const entry = this.globalLeaderboard.find(e => e.userId === userId);
    if (!entry) return null;

    const { newRating, delta } = scoringService.calculateRatingChange(
      entry.rating, rank, totalParticipants
    );

    const historyEntry: RatingHistoryEntry = {
      contestId,
      contestTitle,
      date: new Date().toISOString(),
      rank,
      totalParticipants,
      ratingBefore: entry.rating,
      ratingAfter: newRating,
      delta,
      problemsSolved,
      totalProblems
    };

    // Update leaderboard entry
    entry.rating = newRating;
    entry.ratingDelta = delta;
    entry.tier = getTier(newRating);
    entry.contestsPlayed += 1;
    if (rank < entry.bestRank) entry.bestRank = rank;
    entry.lastActive = new Date().toISOString();

    // Add to history
    const history = this.ratingHistories.get(userId) || [];
    history.push(historyEntry);
    this.ratingHistories.set(userId, history);

    // Re-sort and re-rank
    this.globalLeaderboard.sort((a, b) => b.rating - a.rating);
    this.globalLeaderboard.forEach((e, idx) => { e.rank = idx + 1; });

    return historyEntry;
  }

  /**
   * Get leaderboard stats summary
   */
  getStats(): {
    totalUsers: number;
    totalContests: number;
    avgRating: number;
    topRating: number;
    tierDistribution: { tier: string; count: number; color: string }[];
  } {
    const entries = this.globalLeaderboard;
    const tiers = new Map<string, number>();
    let totalRating = 0;
    let topRating = 0;

    for (const e of entries) {
      totalRating += e.rating;
      if (e.rating > topRating) topRating = e.rating;
      tiers.set(e.tier, (tiers.get(e.tier) || 0) + 1);
    }

    return {
      totalUsers: entries.length,
      totalContests: 14,
      avgRating: Math.round(totalRating / Math.max(entries.length, 1)),
      topRating,
      tierDistribution: Array.from(tiers.entries()).map(([tier, count]) => ({
        tier,
        count,
        color: getTierColor(tier)
      }))
    };
  }
}

export const leaderboardStore = new LeaderboardStore();
