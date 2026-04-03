'use client';
export const dynamic = 'force-dynamic';
import { useAppContext } from '@/lib/context';
import { Sport } from '@/lib/types';
import { useState } from 'react';
import { TrendingUp, Trophy, Star, Target } from 'lucide-react';
import { getAutomatedStandings, getTopPerformers } from '@/lib/store';

const SPORTS: { key: Sport; label: string; emoji: string; color: string; gender: string }[] = [
  { key: 'cricket', label: "Men's Cricket", emoji: '🏏', color: '#f97316', gender: 'mens' },
  { key: 'volleyball', label: "Men's Volleyball", emoji: '🏐', color: '#8b5cf6', gender: 'mens' },
  { key: 'throwball', label: "Women's Throwball", emoji: '🤾', color: '#ec4899', gender: 'womens' },
];

export default function LeaderboardPage() {
  const { data } = useAppContext();
  const [activeSport, setActiveSport] = useState<Sport>('cricket');

  const sportConfig = SPORTS.find(s => s.key === activeSport)!;
  const teams = getAutomatedStandings(data, activeSport);
  const performers = getTopPerformers(data, activeSport);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="responsive-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-title-mobile" style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: '0 0 0.5rem' }}>
          <TrendingUp size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#f97316' }} />
          League Standings
        </h1>
        <p className="text-subtitle-mobile" style={{ color: '#64748b', margin: 0 }}>Live automated points table and player stats</p>
      </div>

      {/* Sport tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {SPORTS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSport(s.key)}
            style={{
              padding: '0.65rem 1.2rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
              background: activeSport === s.key ? s.color + '15' : 'rgba(15,23,42,0.5)',
              color: activeSport === s.key ? s.color : '#94a3b8',
              boxShadow: activeSport === s.key ? `0 0 0 1px ${s.color}40` : '0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="responsive-table glass-card" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Table header */}
        <div 
          className="responsive-table-grid"
          style={{
            display: 'grid', gridTemplateColumns: '3.5rem 1fr 3.5rem 3.5rem 3.5rem 3.5rem 5rem',
            padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(15, 23, 42, 0.4)'
          }}
        >
          {['#', 'Team', 'P', 'W', 'L', 'D', 'Pts'].map((h, i) => (
            <div key={i} className={ (i === 2 || i === 4 || i === 5) ? 'hide-xs' : '' } style={{
              color: '#475569', fontSize: '0.7rem', fontWeight: 800,
              textAlign: i > 1 ? 'center' : 'left', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>{h}</div>
          ))}
        </div>

        {teams.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>No teams registered</div>
        ) : (
          teams.map((team, index) => (
            <div
              key={team.id}
              className="responsive-table-grid"
              style={{
                display: 'grid', gridTemplateColumns: '3.5rem 1fr 3.5rem 3.5rem 3.5rem 3.5rem 5rem',
                padding: '1.25rem 1.25rem',
                borderBottom: index < teams.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                background: index === 0 ? `${sportConfig.color}05` : 'transparent',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '1.1rem', textAlign: 'center' }}>
                {index < 3 ? medals[index] : <span style={{ color: '#334155', fontWeight: 800, fontSize: '0.85rem' }}>{index + 1}</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${team.color || sportConfig.color}, ${team.color || sportConfig.color}dd)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: 'white', fontSize: '0.8rem', flexShrink: 0
                }}>{team.name.charAt(0)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</div>
                </div>
              </div>

              {[team.played, team.wins, team.losses, team.draws].map((val, i) => (
                <div key={i} className={`score-display ${ (i === 0 || i === 2 || i === 3) ? 'hide-xs' : '' }`} style={{
                  color: i === 1 ? '#22c55e' : i === 2 ? '#f43f5e' : '#64748b',
                  fontWeight: 600, textAlign: 'center', fontSize: '1rem'
                }}>{val}</div>
              ))}

              <div className="score-display" style={{
                color: sportConfig.color, fontWeight: 900, fontSize: '1.15rem', textAlign: 'center'
              }}>{team.points}</div>
            </div>
          ))
        )}
      </div>

      {/* Player Stats (IPL style) */}
      {performers && activeSport === 'cricket' && (
        <div style={{ marginTop: '4rem' }}>
          <h2 className="text-title-mobile" style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            🏆 Tournament Honors
          </h2>
          <div className="grid-auto-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <StatsCard title="Orange Cap" color="#f97316" players={performers.orangeCap} metric="runs" label="Runs" />
            <StatsCard title="Purple Cap" color="#8b5cf6" players={performers.purpleCap} metric="wickets" label="Wkts" />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="hide-xs" style={{ display: 'flex', gap: '1.2rem', marginTop: '2rem', flexWrap: 'wrap', padding: '0 0.5rem' }}>
        {[
          { label: 'P = Played', color: '#64748b' },
          { label: 'W = Wins (2 pts)', color: '#22c55e' },
          { label: 'L = Losses', color: '#f43f5e' },
          { label: 'D = Draws (1 pt)', color: '#64748b' },
        ].map(item => (
          <span key={item.label} style={{ color: item.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ title, color, players, metric, label }: { title: string; color: string; players: any[]; metric: string; label: string }) {
  const winner = players[0];
  if (!winner) return null;

  return (
    <div className="glass-card" style={{ borderRadius: 20, padding: '1.5rem', borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{title}</h3>
        <Trophy size={18} color={color} />
      </div>

      {/* Winner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: `${color}10`, padding: '1rem', borderRadius: 12 }}>
         <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>
           {winner.player.name.charAt(0)}
         </div>
         <div>
           <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{winner.player.name}</div>
           <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{winner.team.name}</div>
         </div>
         <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
           <div style={{ color, fontWeight: 900, fontSize: '1.4rem' }}>{winner[metric === 'runs' ? 'totalRuns' : 'wickets']}</div>
           <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>{label}</div>
         </div>
      </div>

      {/* Runners up */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {players.slice(1).map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0 0.25rem' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{p.player.name} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>• {p.team.name}</span></span>
            <span style={{ color: 'white', fontWeight: 700 }}>{p[metric === 'runs' ? 'totalRuns' : 'wickets']}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
