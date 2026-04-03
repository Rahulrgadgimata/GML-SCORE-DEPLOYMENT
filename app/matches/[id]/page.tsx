'use client';
import { useAppContext } from '@/lib/context';
import { getTeamById } from '@/lib/store';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { CricketScore, SetBasedScore, Sport, Player } from '@/lib/types';
import { MapPin, Clock, Trophy, Star } from 'lucide-react';
import { Team } from '@/lib/types';

const sportColors: Record<Sport, string> = {
  cricket: '#f97316', volleyball: '#8b5cf6', throwball: '#ec4899'
};

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = useAppContext();
  const match = data.matches.find(m => m.id === id);
  if (!match) return notFound();

  const teamA = getTeamById(data, match.teamAId);
  const teamB = getTeamById(data, match.teamBId);
  if (!teamA || !teamB) return notFound();

  const color = sportColors[match.sport];
  const isLive = match.status === 'live';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        border: `1px solid ${color}30`, borderRadius: 20, padding: '2rem',
        marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`
        }} />

        {/* Sport badge + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: color + '20', color, borderRadius: 8, padding: '4px 12px',
              fontWeight: 700, fontSize: '0.85rem',
              border: `1px solid ${color}40`
            }}>
              {match.sport === 'cricket' ? '🏏' : match.sport === 'volleyball' ? '🏐' : '🤾'} {match.sport.toUpperCase()}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{match.round}</span>
          </div>
          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '4px 12px' }}>
              <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>LIVE</span>
            </div>
          )}
          {match.status === 'completed' && <span style={{ background: '#1e293b', color: '#64748b', padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem' }}>COMPLETED</span>}
          {match.status === 'upcoming' && <span style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem' }}>UPCOMING</span>}
        </div>

        {/* Teams vs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
          <TeamBlock team={teamA} isWinner={match.winnerId === teamA.id} color={color} />
          <div style={{ color: '#475569', fontWeight: 800, fontSize: '1.4rem', padding: '0 1rem' }}>VS</div>
          <TeamBlock team={teamB} isWinner={match.winnerId === teamB.id} color={color} />
        </div>

        {/* Venue + time */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #1e293b', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <InfoItem icon={<MapPin size={14} />} text={match.venue} />
          <InfoItem icon={<Clock size={14} />} text={new Date(match.date).toLocaleString()} />
          {match.winnerId && <InfoItem icon={<Trophy size={14} color="#f97316" />} text={`${getTeamById(data, match.winnerId)?.name} won`} color="#f97316" />}
        </div>
      </div>

      {/* Scorecard */}
      {match.score && (
        <div style={{ marginBottom: '1.5rem' }}>
          {match.sport === 'cricket' ? (
            <CricketScorecard score={match.score as CricketScore} teamA={teamA} teamB={teamB} />
          ) : (
            <SetScorecard score={match.score as SetBasedScore} teamA={teamA} teamB={teamB} color={color} />
          )}
        </div>
      )}

      {/* Player of the Match */}
      {match.playerOfTheMatch && (() => {
        const allPlayers = [...teamA.players, ...teamB.players];
        const potm = allPlayers.find(p => p.id === match.playerOfTheMatch);
        if (!potm) return null;
        return (
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid #f97316', borderRadius: 16, padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem'
            }}>⭐</div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>PLAYER OF THE MATCH</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{potm.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{potm.role} · #{potm.jerseyNumber}</div>
            </div>
            <Star size={20} color="#f97316" style={{ marginLeft: 'auto' }} />
          </div>
        );
      })()}

      {/* Team Rosters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <RosterCard team={teamA} color={color} />
        <RosterCard team={teamB} color={color} />
      </div>
    </div>
  );
}

function TeamBlock({ team, isWinner, color }: { team: Team; isWinner?: boolean; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%', margin: '0 auto 0.5rem',
        background: `linear-gradient(135deg, ${team.color || color}, ${team.color || color}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', fontWeight: 800, color: 'white',
        border: isWinner ? `3px solid #f59e0b` : '3px solid transparent',
        boxShadow: isWinner ? '0 0 20px rgba(245,158,11,0.4)' : 'none'
      }}>
        {team.name.charAt(0)}
      </div>
      <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{team.name}</div>
      {isWinner && <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 2 }}>🏆 Winner</div>}
    </div>
  );
}

function InfoItem({ icon, text, color = '#64748b' }: { icon: React.ReactNode; text: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color }}>
      {icon} <span style={{ fontSize: '0.85rem' }}>{text}</span>
    </div>
  );
}

function CricketScorecard({ score, teamA, teamB }: { score: CricketScore; teamA: Team; teamB: Team }) {
  return (
    <div>
      {score.innings.map((inning, i) => {
        const battingTeam = inning.battingTeamId === teamA.id ? teamA : teamB;
        const rr = inning.overs > 0 ? (inning.runs / (inning.overs + inning.balls / 6)).toFixed(2) : '0.00';
        return (
          <div key={i} style={{
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
                  {i === 0 ? '1st' : '2nd'} Innings — {battingTeam.name} batting
                </div>
                <div className="score-display" style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {inning.runs}/{inning.wickets}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
                  {inning.overs}.{inning.balls} overs · RR: {rr}
                </div>
              </div>
              {inning.targetRuns && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Target</div>
                  <div style={{ color: '#f97316', fontSize: '1.5rem', fontWeight: 800 }}>{inning.targetRuns}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <StatBadge label="Runs" value={inning.runs} />
              <StatBadge label="Wickets" value={`${inning.wickets}/10`} />
              <StatBadge label="Overs" value={`${inning.overs}.${inning.balls}`} />
              <StatBadge label="Extras" value={inning.extras} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SetScorecard({ score, teamA, teamB, color }: { score: SetBasedScore; teamA: Team; teamB: Team; color: string }) {
  const aWins = score.sets.filter(s => s.winner === 'A').length;
  const bWins = score.sets.filter(s => s.winner === 'B').length;

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 8 }}>Overall Score</div>
        <div className="score-display" style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>
          <span style={{ color: aWins > bWins ? color : 'white' }}>{aWins}</span>
          <span style={{ color: '#475569', margin: '0 0.5rem' }}>—</span>
          <span style={{ color: bWins > aWins ? color : 'white' }}>{bWins}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 2rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{teamA.name}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{teamB.name}</span>
        </div>
      </div>

      {/* Sets table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {score.sets.map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#1e293b', borderRadius: 10, padding: '0.6rem 1rem'
          }}>
            <span className="score-display" style={{
              color: s.winner === 'A' ? color : '#94a3b8', fontWeight: 700, fontSize: '1.2rem'
            }}>{s.teamA}</span>
            <span style={{ color: '#475569', fontSize: '0.8rem' }}>Set {i + 1}{!s.isComplete ? ' (in progress)' : ''}</span>
            <span className="score-display" style={{
              color: s.winner === 'B' ? color : '#94a3b8', fontWeight: 700, fontSize: '1.2rem'
            }}>{s.teamB}</span>
          </div>
        ))}
      </div>

      {score.fouls && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '0.75rem 1rem', background: '#1e293b', borderRadius: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f43f5e', fontWeight: 700 }}>{score.fouls.teamA}</div>
            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Fouls — {teamA.name}</div>
          </div>
          <div style={{ color: '#475569' }}>|</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f43f5e', fontWeight: 700 }}>{score.fouls.teamB}</div>
            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Fouls — {teamB.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '0.4rem 0.75rem', textAlign: 'center' }}>
      <div style={{ color: 'white', fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{label}</div>
    </div>
  );
}

function RosterCard({ team, color }: { team: Team; color: string }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem',
        paddingBottom: '0.75rem', borderBottom: '1px solid #1e293b'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, ${team.color || color}, ${team.color || color}80)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'white', fontSize: '0.9rem'
        }}>{team.name.charAt(0)}</div>
        <span style={{ color: 'white', fontWeight: 700 }}>{team.name}</span>
        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.75rem' }}>{team.players.length} players</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {team.players.slice(0, 8).map((p: Player) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#475569', fontSize: '0.7rem', width: 18, textAlign: 'right' }}>#{p.jerseyNumber}</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{p.name}</span>
            </div>
            {p.role && <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{p.role}</span>}
          </div>
        ))}
        {team.players.length > 8 && (
          <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>+{team.players.length - 8} more</p>
        )}
      </div>
    </div>
  );
}
