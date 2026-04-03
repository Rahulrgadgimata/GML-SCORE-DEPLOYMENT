export type Sport = 'cricket' | 'volleyball' | 'throwball';
export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  gender: 'mens' | 'womens';
  players: Player[];
  wins: number;
  losses: number;
  draws: number;
  points: number;
  color: string;
}

// ─── Cricket ──────────────────────────────────────────────

export interface BallEvent {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
  extraRuns: number;
  batsman: string;
  bowler: string;
  description?: string;
  isFour?: boolean;
  isSix?: boolean;
}

export interface CricketInnings {
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  events: BallEvent[];
  isComplete: boolean;
  targetRuns?: number;
}

export interface CricketScore {
  innings: CricketInnings[];
  currentInnings: number;
  totalOvers: number;
  format: '10' | '20' | 'T20' | 'ODI';
}

// ─── Volleyball / Throwball ───────────────────────────────

export interface SetScore {
  teamA: number;
  teamB: number;
  isComplete: boolean;
  winner?: 'A' | 'B';
}

export interface SetBasedScore {
  sets: SetScore[];
  currentSet: number;
  setsToWin: number;
  fouls?: { teamA: number; teamB: number };
}

// ─── Player Match Performance ─────────────────────────────

/** Cricket: per-player stats in ONE match */
export interface CricketPlayerPerf {
  playerId: string;
  matchId: string;
  teamId: string;
  // Batting
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalType?: string; // 'caught', 'bowled', 'lbw', 'run out', 'stumped', 'not out'
  // Bowling
  oversBowled: number;  // whole overs
  ballsBowled: number;  // extra balls (0-5)
  runsConceded: number;
  wicketsTaken: number;
  maidens: number;
  noBalls: number;
  wides: number;
  // Fielding
  catches: number;
  runOuts: number;
  stumpings: number;
  // POTM
  isPlayerOfMatch: boolean;
}

/** Volleyball: per-player stats in ONE match */
export interface VolleyballPlayerPerf {
  playerId: string;
  matchId: string;
  teamId: string;
  points: number;
  aces: number;
  blocks: number;
  serves: number;
  serviceErrors: number;
  spikes: number;
  isPlayerOfMatch: boolean;
}

/** Throwball: per-player stats in ONE match */
export interface ThrowballPlayerPerf {
  playerId: string;
  matchId: string;
  teamId: string;
  points: number;
  catches: number;
  throwErrors: number;
  intercepts: number;
  isPlayerOfMatch: boolean;
}

export type PlayerPerf = CricketPlayerPerf | VolleyballPlayerPerf | ThrowballPlayerPerf;

// ─── Match ────────────────────────────────────────────────

export interface Match {
  id: string;
  sport: Sport;
  teamAId: string;
  teamBId: string;
  status: MatchStatus;
  date: string;
  venue: string;
  round: string;
  score?: CricketScore | SetBasedScore;
  winnerId?: string;
  playerOfTheMatch?: string;
  playerPerformances?: PlayerPerf[];
  createdAt: string;
  updatedAt: string;
}

// ─── Aggregate Stats (computed) ──────────────────────────

/** Cricket aggregated totals across all matches for one player */
export interface CricketPlayerAggregate {
  player: Player;
  team: Team;
  matches: number;
  // Batting
  totalRuns: number;
  totalBallsFaced: number;
  innings: number;
  notOuts: number;
  highScore: number;
  fours: number;
  sixes: number;
  battingAverage: number;   // runs / (innings - notOuts)
  strikeRate: number;       // (runs / balls) * 100
  fifties: number;
  hundreds: number;
  // Bowling
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  bowlingAverage: number;   // runs / wickets
  economy: number;          // runs / overs
  bestFigures: string;      // e.g. "3/15"
  maidens: number;
  // Fielding
  catches: number;
  runOuts: number;
  // POTM
  potmAwards: number;
  // NRR contribution
  performancePerfs: CricketPlayerPerf[];
}

export interface VolleyballPlayerAggregate {
  player: Player;
  team: Team;
  matches: number;
  totalPoints: number;
  totalAces: number;
  totalBlocks: number;
  totalSpikes: number;
  avgPointsPerMatch: number;
  potmAwards: number;
  perfs: VolleyballPlayerPerf[];
}

export interface ThrowballPlayerAggregate {
  player: Player;
  team: Team;
  matches: number;
  totalPoints: number;
  totalCatches: number;
  totalIntercepts: number;
  avgPointsPerMatch: number;
  potmAwards: number;
  perfs: ThrowballPlayerPerf[];
}

/** Team NRR for leaderboard */
export interface TeamNRR {
  teamId: string;
  teamName: string;
  color: string;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  nrr: number;
}

export interface AppData {
  teams: Team[];
  matches: Match[];
  adminPassword: string;
}

export interface LeaderboardEntry {
  team: Team;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  nrr?: number;
}
