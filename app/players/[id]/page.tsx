'use client';
import React, { use, useMemo } from 'react';
import { useAppContext } from '@/lib/context';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts';
import { ChevronLeft } from 'lucide-react';
import {
  getPlayerById, getCricketPlayerAggregates, getVolleyballPlayerAggregates,
  getThrowballPlayerAggregates
} from '@/lib/store';
import { Player, Team, AppData, Match } from '@/lib/types';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = useAppContext();

  const found = React.useMemo(() => getPlayerById(data, id), [data, id]);
  if (!found) return notFound();

  const { player, team } = found;
  const sport = team.sport;

  const sportColor = sport === 'cricket' ? '#f97316' : sport === 'volleyball' ? '#8b5cf6' : '#ec4899';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/stats" style={{ background: '#1e293b', borderRadius: 8, padding: '0.4rem', color: '#94a3b8', textDecoration: 'none', display: 'flex' }}>
          <ChevronLeft size={18} />
        </Link>
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Back to Statistics</span>
      </div>

      {sport === 'cricket' && <CricketProfile playerId={id} player={player} team={team} data={data} color={sportColor} />}
      {sport === 'volleyball' && <VolleyballProfile playerId={id} player={player} team={team} data={data} color={sportColor} />}
      {sport === 'throwball' && <ThrowballProfile playerId={id} player={player} team={team} data={data} color={sportColor} />}
    </div>
  );
}

// ─── Cricket Profile ─────────────────────────────────────────────────────────

function CricketProfile({ playerId, player, team, data, color }: {
  playerId: string;
  player: Player;
  team: Team;
  data: AppData;
  color: string;
}) {
  const allAggs = React.useMemo(() => getCricketPlayerAggregates(data), [data]);
  const agg = React.useMemo(() => allAggs.find(a => a.player.id === playerId), [allAggs, playerId]);

  if (!agg) {
    return (
      <ProfileHeader player={player} team={team} color={color} sport="cricket" potm={0}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No match data recorded yet</div>
      </ProfileHeader>
    );
  }

  const battingHistory = React.useMemo(() => agg.performancePerfs.map((p, i) => ({
    match: `M${i + 1}`,
    runs: p.runs,
    sr: p.ballsFaced > 0 ? +((p.runs / p.ballsFaced) * 100).toFixed(0) : 0,
    wickets: p.wicketsTaken,
  })), [agg]);

  const radarData = [
    { subject: 'Batting', A: Math.min(100, (agg.totalRuns / 100) * 100) },
    { subject: 'Strike Rate', A: Math.min(100, (agg.strikeRate / 200) * 100) },
    { subject: 'Bowling', A: Math.min(100, (agg.wickets / 10) * 100) },
    { subject: 'Economy', A: agg.economy > 0 ? Math.max(0, 100 - (agg.economy / 12) * 100) : 50 },
    { subject: 'Fielding', A: Math.min(100, ((agg.catches + agg.runOuts) / 5) * 100) },
  ];

  return (
    <ProfileHeader player={player} team={team} color={color} sport="cricket" potm={agg.potmAwards} badges={[
      agg.totalRuns >= 50 ? '🧡 50+ Runs' : null,
      agg.hundreds > 0 ? '💯 Century' : null,
      agg.wickets >= 3 ? '💜 3+ Wickets' : null,
      agg.strikeRate >= 150 ? '⚡ High SR' : null,
    ].filter(Boolean)}>
      {/* Key stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatBox label="Matches" value={agg.matches} />
        <StatBox label="Runs" value={agg.totalRuns} color={color} />
        <StatBox label="Batting Avg" value={agg.battingAverage} />
        <StatBox label="Strike Rate" value={agg.strikeRate} />
        <StatBox label="High Score" value={agg.highScore} />
        <StatBox label="4s / 6s" value={`${agg.fours} / ${agg.sixes}`} />
        <StatBox label="Wickets" value={agg.wickets} color="#8b5cf6" />
        <StatBox label="Economy" value={agg.economy} />
        <StatBox label="Best" value={agg.bestFigures} />
        <StatBox label="Catches" value={agg.catches} />
      </div>

      {/* Charts */}
      {battingHistory.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <ChartBox title="Runs Per Match">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={battingHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="match" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
                <Line type="monotone" dataKey="runs" stroke={color} strokeWidth={2} dot={{ fill: color }} name="Runs" />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Performance Radar">
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Player" dataKey="A" stroke={color} fill={color} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
      )}

      {/* Per-match table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#0a0f1a' }}>
              {['Match', 'Runs', 'Balls', '4s', '6s', 'SR', 'Status', 'Overs', 'Runs Given', 'Wkts', 'Econ', 'Ctch'].map(h => (
                <th key={h} style={{ padding: '0.5rem 0.6rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agg.performancePerfs.map((p, i) => {
              const match = data.matches.find((m: Match) => m.id === p.matchId);
              const opp = match ? data.teams.find((t: Team) => t.id !== team.id && (t.id === match.teamAId || t.id === match.teamBId)) : null;
              const overs = p.oversBowled + p.ballsBowled / 6;
              const econ = overs > 0 ? (p.runsConceded / overs).toFixed(2) : '—';
              return (
                <tr key={i} style={{ borderBottom: '1px solid #0a0f1a', background: i % 2 ? '#0d1520' : 'transparent' }}>
                  <td style={{ padding: '0.5rem 0.6rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {match ? <Link href={`/matches/${match.id}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>vs {opp?.name ?? 'Opp'}</Link> : `M${i + 1}`}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: color, fontWeight: 700 }}>{p.runs}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.ballsFaced}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.fours}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.sixes}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(0) : '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: p.isOut ? '#f43f5e' : '#22c55e', fontSize: '0.75rem' }}>{p.isOut ? p.dismissalType ?? 'Out' : 'Not Out'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{overs > 0 ? overs.toFixed(1) : '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{overs > 0 ? p.runsConceded : '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#8b5cf6', fontWeight: 700 }}>{p.wicketsTaken > 0 ? p.wicketsTaken : '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{econ}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.catches > 0 ? p.catches : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProfileHeader>
  );
}

// ─── Volleyball Profile ───────────────────────────────────────────────────────

function VolleyballProfile({ playerId, player, team, data, color }: {
  playerId: string;
  player: Player;
  team: Team;
  data: AppData;
  color: string;
}) {
  const aggs = React.useMemo(() => getVolleyballPlayerAggregates(data), [data]);
  const agg = React.useMemo(() => aggs.find(a => a.player.id === playerId), [aggs, playerId]);

  if (!agg) return <ProfileHeader player={player} team={team} color={color} sport="volleyball" potm={0}><div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No match data yet</div></ProfileHeader>;

  const history = React.useMemo(() => agg.perfs.map((p, i) => ({
    match: `M${i + 1}`, points: p.points, aces: p.aces, blocks: p.blocks, spikes: p.spikes
  })), [agg]);

  return (
    <ProfileHeader player={player} team={team} color={color} sport="volleyball" potm={agg.potmAwards}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatBox label="Matches" value={agg.matches} />
        <StatBox label="Total Points" value={agg.totalPoints} color={color} />
        <StatBox label="Aces" value={agg.totalAces} />
        <StatBox label="Blocks" value={agg.totalBlocks} />
        <StatBox label="Spikes" value={agg.totalSpikes} />
        <StatBox label="Avg Pts/Match" value={agg.avgPointsPerMatch} />
      </div>
      {history.length > 0 && (
        <ChartBox title="Points Per Match">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="match" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="points" fill={color} radius={[4, 4, 0, 0]} name="Points" />
              <Bar dataKey="aces" fill="#f97316" radius={[4, 4, 0, 0]} name="Aces" />
              <Bar dataKey="blocks" fill="#10b981" radius={[4, 4, 0, 0]} name="Blocks" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      )}
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#0a0f1a' }}>
              {['Match', 'Points', 'Aces', 'Blocks', 'Spikes', 'Srv Errors', 'POTM'].map(h => <th key={h} style={{ padding: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {agg.perfs.map((p, i) => {
              const match = data.matches.find((m: Match) => m.id === p.matchId);
              const opp = match ? data.teams.find((t: Team) => t.id !== team.id && (t.id === match.teamAId || t.id === match.teamBId)) : null;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #0a0f1a' }}>
                  <td style={{ padding: '0.5rem', color: '#64748b' }}>{opp ? `vs ${opp.name}` : `M${i + 1}`}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color, fontWeight: 700 }}>{p.points}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.aces}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.blocks}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.spikes}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#f43f5e' }}>{p.serviceErrors}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>{p.isPlayerOfMatch ? '⭐' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProfileHeader>
  );
}

// ─── Throwball Profile ────────────────────────────────────────────────────────

function ThrowballProfile({ playerId, player, team, data, color }: {
  playerId: string;
  player: Player;
  team: Team;
  data: AppData;
  color: string;
}) {
  const aggs = React.useMemo(() => getThrowballPlayerAggregates(data), [data]);
  const agg = React.useMemo(() => aggs.find(a => a.player.id === playerId), [aggs, playerId]);

  if (!agg) return <ProfileHeader player={player} team={team} color={color} sport="throwball" potm={0}><div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No match data yet</div></ProfileHeader>;

  const history = React.useMemo(() => agg.perfs.map((p, i) => ({
    match: `M${i + 1}`, points: p.points, catches: p.catches, intercepts: p.intercepts
  })), [agg]);

  return (
    <ProfileHeader player={player} team={team} color={color} sport="throwball" potm={agg.potmAwards}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatBox label="Matches" value={agg.matches} />
        <StatBox label="Total Points" value={agg.totalPoints} color={color} />
        <StatBox label="Catches" value={agg.totalCatches} />
        <StatBox label="Intercepts" value={agg.totalIntercepts} />
        <StatBox label="Avg Pts/Match" value={agg.avgPointsPerMatch} />
        <StatBox label="POTM Awards" value={agg.potmAwards} color="#f59e0b" />
      </div>
      {history.length > 0 && (
        <ChartBox title="Match-Wise Performance">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="match" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="points" fill={color} radius={[4, 4, 0, 0]} name="Points" />
              <Bar dataKey="catches" fill="#f97316" radius={[4, 4, 0, 0]} name="Catches" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      )}
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#0a0f1a' }}>
              {['Match', 'Points', 'Catches', 'Intercepts', 'Errors', 'POTM'].map(h => <th key={h} style={{ padding: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {agg.perfs.map((p, i) => {
              const match = data.matches.find((m: Match) => m.id === p.matchId);
              const opp = match ? data.teams.find((t: Team) => t.id !== team.id && (t.id === match.teamAId || t.id === match.teamBId)) : null;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #0a0f1a' }}>
                  <td style={{ padding: '0.5rem', color: '#64748b' }}>{opp ? `vs ${opp.name}` : `M${i + 1}`}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color, fontWeight: 700 }}>{p.points}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.catches}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>{p.intercepts}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#f43f5e' }}>{p.throwErrors}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>{p.isPlayerOfMatch ? '⭐' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProfileHeader>
  );
}

// ─── Shared Profile Shell ──────────────────────────────────────────────────────

function ProfileHeader({ player, team, color, sport, potm, badges, children }: {
  player: Player;
  team: Team;
  color: string;
  sport: string;
  potm: number;
  badges?: (string | null)[];
  children: React.ReactNode;
}) {
  const sportEmoji = sport === 'cricket' ? '🏏' : sport === 'volleyball' ? '🏐' : '🤾';
  return (
    <div>
      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        border: `2px solid ${color}40`, borderRadius: 20, padding: '1.75rem',
        marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${color}15, transparent)` }} />
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}80)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 900, color: 'white',
            border: `3px solid ${color}60`, boxShadow: `0 0 30px ${color}30`
          }}>{player.name.charAt(0)}</div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>{player.name}</h1>
              {potm > 0 && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>⭐ POTM ×{potm}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ color: color, fontSize: '0.9rem', fontWeight: 600 }}>{sportEmoji} {player.role}</span>
              <span style={{ color: '#64748b' }}>·</span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{team.name}</span>
              {player.jerseyNumber && <>
                <span style={{ color: '#64748b' }}>·</span>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>#{player.jerseyNumber}</span>
              </>}
            </div>
            {/* Badges */}
            {badges && badges.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {badges.map((b) => b && (
                  <span key={b} style={{
                    background: 'rgba(255,255,255,0.1)', color: 'white',
                    padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem',
                    border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600
                  }}>{b}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
      <div className="score-display" style={{ color: color || 'white', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', marginBottom: '0.5rem' }}>
      <h4 style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem', margin: '0 0 0.75rem' }}>{title}</h4>
      {children}
    </div>
  );
}
