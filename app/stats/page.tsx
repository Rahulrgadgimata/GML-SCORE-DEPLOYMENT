'use client';
import { useAppContext } from '@/lib/context';
import {
  getCricketPlayerAggregates, getVolleyballPlayerAggregates,
  getThrowballPlayerAggregates, calculateNRR
} from '@/lib/store';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  CricketPlayerAggregate, VolleyballPlayerAggregate, ThrowballPlayerAggregate, TeamNRR
} from '@/lib/types';

const TABS = [
  { key: 'cricket', label: "🏏 Cricket", color: '#f97316' },
  { key: 'volleyball', label: "🏐 Volleyball", color: '#8b5cf6' },
  { key: 'throwball', label: "🤾 Throwball", color: '#ec4899' },
] as const;

export default function StatsPage() {
  const { data } = useAppContext();
  const [tab, setTab] = React.useState('cricket');

  const cricketAggs = React.useMemo(() => getCricketPlayerAggregates(data), [data]);
  const volleyballAggs = React.useMemo(() => getVolleyballPlayerAggregates(data), [data]);
  const throwballAggs = React.useMemo(() => getThrowballPlayerAggregates(data), [data]);
  const nrrTable = React.useMemo(() => calculateNRR(data), [data]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', margin: '0 0 0.5rem' }}>
          <TrendingUp size={26} style={{ verticalAlign: 'middle', marginRight: 8, color: '#f97316' }} />
          Statistics Center
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>IPL-style player analytics, category leaders, NRR, and charts</p>
      </div>

      {/* Sport Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
            background: tab === t.key ? t.color + '20' : '#0f172a',
            color: tab === t.key ? t.color : '#64748b',
            outline: tab === t.key ? `2px solid ${t.color}50` : '1px solid #1e293b',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Cricket Panel */}
      {tab === 'cricket' && (
        <CricketStatsPanel aggs={cricketAggs} nrr={nrrTable} />
      )}
      {tab === 'volleyball' && (
        <VolleyballStatsPanel aggs={volleyballAggs} />
      )}
      {tab === 'throwball' && (
        <ThrowballStatsPanel aggs={throwballAggs} />
      )}
    </div>
  );
}

// ─── Cricket Panel ────────────────────────────────────────────────────────────

function CricketStatsPanel({ aggs, nrr }: { aggs: CricketPlayerAggregate[]; nrr: TeamNRR[] }) {
  const topBatsmen = [...aggs].sort((a, b) => b.totalRuns - a.totalRuns).slice(0, 10);
  const topBowlers = [...aggs].filter(a => a.wickets > 0).sort((a, b) => b.wickets - a.wickets || a.economy - b.economy).slice(0, 10);
  const topSR = [...aggs].filter(a => a.totalBallsFaced >= 10).sort((a, b) => b.strikeRate - a.strikeRate).slice(0, 5);
  const topEcon = [...aggs].filter(a => a.oversBowled >= 2).sort((a, b) => a.economy - b.economy).slice(0, 5);

  // Chart data - top batters runs
  const runsChartData = topBatsmen.slice(0, 8).map(a => ({
    name: a.player.name.split(' ')[0],
    runs: a.totalRuns,
    avg: a.battingAverage,
    sr: a.strikeRate,
  }));

  const wicketsChartData = topBowlers.slice(0, 8).map(a => ({
    name: a.player.name.split(' ')[0],
    wickets: a.wickets,
    economy: a.economy,
  }));

  return (
    <div>
      {/* Orange + Purple Cap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {topBatsmen[0] && (
          <CapCard
            title="🧡 Orange Cap"
            subtitle="Most Runs — Tournament Leading Scorer"
            player={topBatsmen[0]}
            primaryStat={topBatsmen[0].totalRuns}
            primaryLabel="Runs"
            secondaryStats={[
              { label: 'Avg', value: topBatsmen[0].battingAverage },
              { label: 'SR', value: topBatsmen[0].strikeRate },
              { label: 'HS', value: topBatsmen[0].highScore },
              { label: '6s', value: topBatsmen[0].sixes },
            ]}
            color="#f97316"
          />
        )}
        {topBowlers[0] && (
          <CapCard
            title="💜 Purple Cap"
            subtitle="Most Wickets — Tournament Leading Bowler"
            player={topBowlers[0]}
            primaryStat={topBowlers[0].wickets}
            primaryLabel="Wickets"
            secondaryStats={[
              { label: 'Econ', value: topBowlers[0].economy },
              { label: 'Avg', value: topBowlers[0].bowlingAverage },
              { label: 'Best', value: topBowlers[0].bestFigures },
              { label: 'Mdn', value: topBowlers[0].maidens },
            ]}
            color="#8b5cf6"
          />
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Runs chart */}
        <ChartCard title="📊 Top Run Scorers" subtitle="Total runs this tournament">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={runsChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="runs" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Wickets chart */}
        <ChartCard title="📊 Top Wicket Takers" subtitle="Wickets taken this tournament">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wicketsChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="wickets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category Leaders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <CategoryTable title="⚡ Strike Rate Leaders" subtitle="Min 10 balls" color="#f97316"
          columns={['Player', 'SR', 'Runs']}
          rows={topSR.map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="sr" val={a.strikeRate} />,
            <StatVal key="r" val={a.totalRuns} />,
          ])}
        />
        <CategoryTable title="🎯 Best Economy" subtitle="Min 2 overs" color="#10b981"
          columns={['Player', 'Econ', 'Wkts']}
          rows={topEcon.map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="econ" val={a.economy} />,
            <StatVal key="w" val={a.wickets} />,
          ])}
        />
        <NRRTable nrr={nrr} />
      </div>

      {/* Full Batting Leaderboard */}
      <Section title="🏏 Full Batting Leaderboard">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0a0f1a' }}>
                {['#', 'Player', 'Team', 'M', 'Inns', 'Runs', 'HS', 'Avg', 'SR', '4s', '6s', '50s', '100s'].map(h => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topBatsmen.map((a, i) => (
                <tr key={a.player.id} style={{ borderBottom: '1px solid #0a0f1a', background: i % 2 ? '#0d1520' : 'transparent' }}>
                  <Td>{['🥇', '🥈', '🥉'][i] || i + 1}</Td>
                  <Td>
                    <Link href={`/players/${a.player.id}`} style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
                      {a.player.name}
                    </Link>
                  </Td>
                  <Td muted>{a.team.name}</Td>
                  <Td center>{a.matches}</Td>
                  <Td center>{a.innings}</Td>
                  <Td center bold orange>{a.totalRuns}</Td>
                  <Td center>{a.highScore}</Td>
                  <Td center>{a.battingAverage}</Td>
                  <Td center>{a.strikeRate}</Td>
                  <Td center>{a.fours}</Td>
                  <Td center>{a.sixes}</Td>
                  <Td center>{a.fifties}</Td>
                  <Td center>{a.hundreds}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Full Bowling Leaderboard */}
      <Section title="🎳 Full Bowling Leaderboard" style={{ marginTop: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0a0f1a' }}>
                {['#', 'Player', 'Team', 'M', 'Overs', 'Mdns', 'Runs', 'Wkts', 'Avg', 'Econ', 'Best'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {topBowlers.map((a, i) => (
                <tr key={a.player.id} style={{ borderBottom: '1px solid #0a0f1a', background: i % 2 ? '#0d1520' : 'transparent' }}>
                  <Td>{['🥇', '🥈', '🥉'][i] || i + 1}</Td>
                  <Td>
                    <Link href={`/players/${a.player.id}`} style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
                      {a.player.name}
                    </Link>
                  </Td>
                  <Td muted>{a.team.name}</Td>
                  <Td center>{a.matches}</Td>
                  <Td center>{a.oversBowled.toFixed(1)}</Td>
                  <Td center>{a.maidens}</Td>
                  <Td center>{a.runsConceded}</Td>
                  <Td center bold purple>{a.wickets}</Td>
                  <Td center>{a.bowlingAverage || '—'}</Td>
                  <Td center>{a.economy}</Td>
                  <Td center>{a.bestFigures}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ─── Volleyball Panel ─────────────────────────────────────────────────────────

function VolleyballStatsPanel({ aggs }: { aggs: VolleyballPlayerAggregate[] }) {
  const topPoints = [...aggs].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
  const topAces = [...aggs].sort((a, b) => b.totalAces - a.totalAces).slice(0, 5);
  const topBlocks = [...aggs].sort((a, b) => b.totalBlocks - a.totalBlocks).slice(0, 5);

  const chartData = topPoints.slice(0, 8).map(a => ({
    name: a.player.name.split(' ')[0],
    points: a.totalPoints,
    aces: a.totalAces,
    blocks: a.totalBlocks,
  }));

  return (
    <div>
      {topPoints[0] && (
        <div style={{ marginBottom: '2rem' }}>
          <CapCard
            title="🌟 MVP — Top Scorer"
            subtitle="Most points in the tournament"
            player={topPoints[0]}
            primaryStat={topPoints[0].totalPoints}
            primaryLabel="Points"
            secondaryStats={[
              { label: 'Aces', value: topPoints[0].totalAces },
              { label: 'Blocks', value: topPoints[0].totalBlocks },
              { label: 'Spikes', value: topPoints[0].totalSpikes },
              { label: 'Avg/M', value: topPoints[0].avgPointsPerMatch },
            ]}
            color="#8b5cf6"
          />
        </div>
      )}

      <ChartCard title="📊 Points by Player" subtitle="Total tournament points">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
            <Bar dataKey="points" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Points" />
            <Bar dataKey="aces" fill="#f97316" radius={[4, 4, 0, 0]} name="Aces" />
            <Bar dataKey="blocks" fill="#10b981" radius={[4, 4, 0, 0]} name="Blocks" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', margin: '1.5rem 0' }}>
        <CategoryTable title="🏐 Top Scorers" color="#8b5cf6" columns={['Player', 'Pts', 'Avg/M']}
          rows={topPoints.slice(0, 5).map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="p" val={a.totalPoints} />, <StatVal key="avg" val={a.avgPointsPerMatch} />,
          ])} />
        <CategoryTable title="🎯 Most Aces" color="#f97316" columns={['Player', 'Aces', 'Pts']}
          rows={topAces.map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="a" val={a.totalAces} />, <StatVal key="p" val={a.totalPoints} />,
          ])} />
        <CategoryTable title="🧱 Most Blocks" color="#10b981" columns={['Player', 'Blks', 'Pts']}
          rows={topBlocks.map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="b" val={a.totalBlocks} />, <StatVal key="p" val={a.totalPoints} />,
          ])} />
      </div>

      <Section title="🏐 Full Volleyball Leaderboard">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0a0f1a' }}>
                {['#', 'Player', 'Team', 'M', 'Pts', 'Aces', 'Blks', 'Spks', 'Avg/M', 'POTM'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {topPoints.map((a, i) => (
                <tr key={a.player.id} style={{ borderBottom: '1px solid #0a0f1a', background: i % 2 ? '#0d1520' : 'transparent' }}>
                  <Td>{['🥇', '🥈', '🥉'][i] || i + 1}</Td>
                  <Td><Link href={`/players/${a.player.id}`} style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>{a.player.name}</Link></Td>
                  <Td muted>{a.team.name}</Td>
                  <Td center>{a.matches}</Td>
                  <Td center bold purple>{a.totalPoints}</Td>
                  <Td center>{a.totalAces}</Td>
                  <Td center>{a.totalBlocks}</Td>
                  <Td center>{a.totalSpikes}</Td>
                  <Td center>{a.avgPointsPerMatch}</Td>
                  <Td center>{a.potmAwards > 0 ? `⭐ ${a.potmAwards}` : '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ─── Throwball Panel ─────────────────────────────────────────────────────────

function ThrowballStatsPanel({ aggs }: { aggs: ThrowballPlayerAggregate[] }) {
  const topPoints = [...aggs].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
  const topCatches = [...aggs].sort((a, b) => b.totalCatches - a.totalCatches).slice(0, 5);

  const chartData = topPoints.slice(0, 8).map(a => ({
    name: a.player.name.split(' ')[0],
    points: a.totalPoints,
    catches: a.totalCatches,
    intercepts: a.totalIntercepts,
  }));

  return (
    <div>
      {topPoints[0] && (
        <div style={{ marginBottom: '2rem' }}>
          <CapCard
            title="🌟 Star Player"
            subtitle="Most points in throwball"
            player={topPoints[0]}
            primaryStat={topPoints[0].totalPoints}
            primaryLabel="Points"
            secondaryStats={[
              { label: 'Catches', value: topPoints[0].totalCatches },
              { label: 'Intercepts', value: topPoints[0].totalIntercepts },
              { label: 'POTM', value: topPoints[0].potmAwards },
              { label: 'Avg/M', value: topPoints[0].avgPointsPerMatch },
            ]}
            color="#ec4899"
          />
        </div>
      )}

      <ChartCard title="📊 Points, Catches & Intercepts" subtitle="Per player breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: 'white' }} />
            <Bar dataKey="points" fill="#ec4899" radius={[4, 4, 0, 0]} name="Points" />
            <Bar dataKey="catches" fill="#f97316" radius={[4, 4, 0, 0]} name="Catches" />
            <Bar dataKey="intercepts" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Intercepts" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', margin: '1.5rem 0' }}>
        <CategoryTable title="🤾 Top Scorers" color="#ec4899" columns={['Player', 'Pts', 'Avg/M']}
          rows={topPoints.slice(0, 5).map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="p" val={a.totalPoints} />, <StatVal key="avg" val={a.avgPointsPerMatch} />,
          ])} />
        <CategoryTable title="🫳 Best Catchers" color="#f97316" columns={['Player', 'Catches', 'Pts']}
          rows={topCatches.map((a, i) => [
            <PlayerLink key={a.player.id} id={a.player.id} name={a.player.name} team={a.team.name} rank={i + 1} />,
            <StatVal key="c" val={a.totalCatches} />, <StatVal key="p" val={a.totalPoints} />,
          ])} />
      </div>

      <Section title="🤾 Full Throwball Leaderboard">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0a0f1a' }}>
                {['#', 'Player', 'Team', 'M', 'Pts', 'Catches', 'Intercepts', 'Avg/M', 'POTM'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {topPoints.map((a, i) => (
                <tr key={a.player.id} style={{ borderBottom: '1px solid #0a0f1a', background: i % 2 ? '#0d1520' : 'transparent' }}>
                  <Td>{['🥇', '🥈', '🥉'][i] || i + 1}</Td>
                  <Td><Link href={`/players/${a.player.id}`} style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600 }}>{a.player.name}</Link></Td>
                  <Td muted>{a.team.name}</Td>
                  <Td center>{a.matches}</Td>
                  <Td center bold pink>{a.totalPoints}</Td>
                  <Td center>{a.totalCatches}</Td>
                  <Td center>{a.totalIntercepts}</Td>
                  <Td center>{a.avgPointsPerMatch}</Td>
                  <Td center>{a.potmAwards > 0 ? `⭐ ${a.potmAwards}` : '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function CapCard({ title, subtitle, player, primaryStat, primaryLabel, secondaryStats, color }: {
  title: string;
  subtitle: string;
  player: CricketPlayerAggregate | VolleyballPlayerAggregate | ThrowballPlayerAggregate;
  primaryStat: string | number;
  primaryLabel: string;
  secondaryStats: { label: string; value: string | number }[];
  color: string;
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, #0f172a, #1e293b)`,
      border: `2px solid ${color}50`, borderRadius: 20, padding: '1.5rem',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${color}20, transparent)` }} />
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ color, fontWeight: 800, fontSize: '1rem' }}>{title}</span>
        <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', fontWeight: 900, color: 'white'
        }}>{player.player.name.charAt(0)}</div>
        <div>
          <Link href={`/players/${player.player.id}`} style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none' }}>
            {player.player.name}
          </Link>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{player.team.name} · {player.player.role}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="score-display" style={{ color, fontWeight: 900, fontSize: '2.2rem', lineHeight: 1 }}>{primaryStat}</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{primaryLabel}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {secondaryStats.map((s: { label: string; value: string | number }) => (
          <div key={s.label} style={{ background: '#0a0f1a', borderRadius: 8, padding: '0.4rem 0.75rem', textAlign: 'center' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{s.value}</div>
            <div style={{ color: '#475569', fontSize: '0.68rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NRRTable({ nrr }: { nrr: TeamNRR[] }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem' }}>
      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1rem' }}>🧮 Net Run Rate</h3>
      {nrr.length === 0 ? (
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>No completed matches yet</p>
      ) : nrr.map((row, i) => (
        <div key={row.teamId} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.6rem 0', borderBottom: i < nrr.length - 1 ? '1px solid #1e293b' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
              {row.teamName.charAt(0)}
            </div>
            <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{row.teamName}</span>
          </div>
          <span className="score-display" style={{
            color: row.nrr >= 0 ? '#22c55e' : '#f43f5e',
            fontWeight: 700, fontSize: '1rem'
          }}>
            {row.nrr >= 0 ? '+' : ''}{row.nrr.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '0.5rem' }}>
      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px' }}>{title}</h3>
      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 1rem' }}>{subtitle}</p>
      {children}
    </div>
  );
}

function CategoryTable({ title, subtitle, color, columns, rows }: {
  title: string;
  subtitle?: string;
  color: string;
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem' }}>
      <h3 style={{ color, fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.75rem' }}>{title}</h3>
      {subtitle && <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '-0.5rem 0 0.75rem' }}>{subtitle}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>{columns.map((c: string) => <Th key={c} small>{c}</Th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row: React.ReactNode[], i: number) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #1e293b' : 'none' }}>
              {row.map((cell, j) => <td key={j} style={{ padding: '0.5rem 0.25rem', color: '#94a3b8', textAlign: j > 0 ? 'center' : 'left' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', ...style }}>
      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function PlayerLink({ id, name, team, rank }: { id: string; name: string; team: string; rank: number }) {
  return (
    <div>
      <Link href={`/players/${id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
        {['🥇', '🥈', '🥉'][rank - 1] || rank} {name}
      </Link>
      <div style={{ color: '#475569', fontSize: '0.68rem' }}>{team}</div>
    </div>
  );
}

function StatVal({ val }: { val: string | number }) {
  return <span style={{ fontWeight: 700, color: 'white' }}>{val}</span>;
}

function Th({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <th style={{
      padding: small ? '0.4rem 0.25rem' : '0.6rem 0.75rem',
      color: '#475569', fontWeight: 600,
      fontSize: small ? '0.72rem' : '0.75rem',
      textAlign: 'left', whiteSpace: 'nowrap'
    }}>{children}</th>
  );
}

function Td({ children, center, bold, muted, orange, purple, pink }: {
  children: React.ReactNode;
  center?: boolean;
  bold?: boolean;
  muted?: boolean;
  orange?: boolean;
  purple?: boolean;
  pink?: boolean;
}) {
  return (
    <td style={{
      padding: '0.6rem 0.75rem',
      color: orange ? '#f97316' : purple ? '#8b5cf6' : pink ? '#ec4899' : muted ? '#64748b' : '#94a3b8',
      fontWeight: bold ? 800 : 400,
      fontSize: '0.82rem',
      textAlign: center ? 'center' : 'left',
      whiteSpace: 'nowrap'
    }}>{children}</td>
  );
}
