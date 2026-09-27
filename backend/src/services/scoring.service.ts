/**
 * Scoring Engine Service
 * 
 * Implements ICPC-style scoring with:
 * - Problem score based on difficulty and correctness
 * - Penalty minutes for wrong attempts
 * - Time-based tie-breaking (earlier solve = lower penalty)
 * - Configurable penalty rules per contest
 */

export interface ScoringConfig {
  /** Penalty minutes added per wrong submission (ICPC standard: 20) */
  wrongAttemptPenalty: number;
  /** Whether to use time-based penalty (ICPC) or just score (IOI) */
  penaltyMode: 'icpc_time' | 'ioi_score' | 'hybrid';
  /** Points per difficulty level */
  difficultyMultiplier: {
    easy: number;
    medium: number;
    hard: number;
  };
  /** Bonus points for being first to solve */
  firstSolveBonus: number;
  /** Time decay: reduce score based on solve time (0 = no decay) */
  timeDecayFactor: number;
}

export interface ProblemScoreInput {
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  basePoints: number;
  isAccepted: boolean;
  wrongAttempts: number;
  solveTimeMinutes: number; // minutes from contest start
  isFirstSolve: boolean;
  /** For IOI/subtask: partial score 0–100 */
  partialScore?: number;
}

export interface ProblemScoreResult {
  problemId: string;
  rawScore: number;
  penaltyMinutes: number;
  bonusPoints: number;
  finalScore: number;
  breakdown: string;
}

export interface ContestScoreResult {
  totalScore: number;
  totalPenalty: number;
  problemsSolved: number;
  problemsAttempted: number;
  perProblem: ProblemScoreResult[];
  rank?: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
  wrongAttemptPenalty: 20,
  penaltyMode: 'icpc_time',
  difficultyMultiplier: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.5
  },
  firstSolveBonus: 50,
  timeDecayFactor: 0.002
};

class ScoringService {
  private config: ScoringConfig;

  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate score for a single problem attempt
   */
  scoreProblem(input: ProblemScoreInput): ProblemScoreResult {
    const { config } = this;
    const multiplier = config.difficultyMultiplier[input.difficulty] || 1;

    if (!input.isAccepted && !input.partialScore) {
      return {
        problemId: input.problemId,
        rawScore: 0,
        penaltyMinutes: 0,
        bonusPoints: 0,
        finalScore: 0,
        breakdown: `Not accepted · ${input.wrongAttempts} wrong attempt(s)`
      };
    }

    let rawScore: number;
    if (config.penaltyMode === 'ioi_score' && input.partialScore !== undefined) {
      // IOI mode: partial scoring
      rawScore = Math.round((input.partialScore / 100) * input.basePoints * multiplier);
    } else {
      // ICPC mode: full score for accepted
      rawScore = Math.round(input.basePoints * multiplier);
    }

    // Time decay: reduce score slightly for later solves
    let timeDecay = 0;
    if (config.timeDecayFactor > 0 && input.solveTimeMinutes > 0) {
      timeDecay = Math.round(rawScore * config.timeDecayFactor * input.solveTimeMinutes);
      timeDecay = Math.min(timeDecay, Math.floor(rawScore * 0.3)); // cap at 30% reduction
    }

    // Penalty for wrong attempts (ICPC style)
    const penaltyMinutes = input.isAccepted
      ? input.solveTimeMinutes + (input.wrongAttempts * config.wrongAttemptPenalty)
      : 0;

    // First-solve bonus
    const bonusPoints = input.isFirstSolve ? config.firstSolveBonus : 0;

    const finalScore = Math.max(0, rawScore - timeDecay + bonusPoints);

    const parts: string[] = [];
    parts.push(`Base: ${input.basePoints} × ${multiplier}x = ${Math.round(input.basePoints * multiplier)}`);
    if (timeDecay > 0) parts.push(`Time decay: -${timeDecay}`);
    if (bonusPoints > 0) parts.push(`First solve bonus: +${bonusPoints}`);
    if (input.wrongAttempts > 0) parts.push(`Penalty: +${input.wrongAttempts * config.wrongAttemptPenalty}min`);

    return {
      problemId: input.problemId,
      rawScore,
      penaltyMinutes,
      bonusPoints,
      finalScore,
      breakdown: parts.join(' · ')
    };
  }

  /**
   * Calculate total contest score for a participant
   */
  scoreContest(problems: ProblemScoreInput[]): ContestScoreResult {
    const perProblem = problems.map(p => this.scoreProblem(p));
    const solved = perProblem.filter(p => p.finalScore > 0);

    return {
      totalScore: perProblem.reduce((sum, p) => sum + p.finalScore, 0),
      totalPenalty: perProblem.reduce((sum, p) => sum + p.penaltyMinutes, 0),
      problemsSolved: solved.length,
      problemsAttempted: problems.length,
      perProblem
    };
  }

  /**
   * Rank a list of contest results using ICPC tie-breaking:
   * 1. Higher total score first
   * 2. Lower total penalty first
   * 3. Earlier last accepted submission first
   */
  rankParticipants(
    results: Array<ContestScoreResult & { userId: string; lastAcceptedAt?: string }>
  ): Array<ContestScoreResult & { userId: string; rank: number }> {
    const sorted = [...results].sort((a, b) => {
      // Primary: higher score
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      // Secondary: lower penalty
      if (a.totalPenalty !== b.totalPenalty) return a.totalPenalty - b.totalPenalty;
      // Tertiary: earlier last accepted
      const aTime = a.lastAcceptedAt ? new Date(a.lastAcceptedAt).getTime() : Infinity;
      const bTime = b.lastAcceptedAt ? new Date(b.lastAcceptedAt).getTime() : Infinity;
      return aTime - bTime;
    });

    return sorted.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }

  /**
   * Calculate ELO-style rating change after a contest
   */
  calculateRatingChange(
    currentRating: number,
    rank: number,
    totalParticipants: number,
    kFactor: number = 32
  ): { newRating: number; delta: number } {
    // Expected performance based on current rating
    const expectedRank = totalParticipants / 2;
    
    // Performance factor: positive if ranked better than expected
    const performance = (expectedRank - rank) / totalParticipants;
    
    // Diminishing returns for very high ratings
    const ratingFactor = Math.max(0.5, 1 - (currentRating - 1500) / 3000);
    
    const delta = Math.round(kFactor * performance * ratingFactor);
    
    // Minimum rating floor
    const newRating = Math.max(100, currentRating + delta);

    return { newRating, delta };
  }

  getConfig(): ScoringConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export const scoringService = new ScoringService();
