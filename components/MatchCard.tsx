'use client';
import Link from 'next/link';
import { Match, Team, Sport } from '@/lib/types';
import { getTeamById } from '@/lib/store';
import { AppData, CricketScore, SetBasedScore } from '@/lib/types';
import { Clock, MapPin, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const sportColors: Record<Sport, string> = {
  cricket: '#f97316',
  volleyball: '#8b5cf6',
  throwball: '#ec4899',
};

const sportEmoji: Record<Sport, string> = {
  cricket: '🏏',
  volleyball: '🏐',
  throwball: '🤾',
};

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'live') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="live-dot" style={{
          width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block'
        }} />
        <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
      </div>
    );
  }
  if (status === 'upcoming') {
    return <span style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 600 }}>UPCOMING</span>;
  }
  return <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>COMPLETED</span>;
}

function CricketSummary({ score, teamA, teamB }: { score: CricketScore; teamA: Team; teamB: Team }) {
  const inn = score.innings;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {inn.map((inning, i) => {
        const team = inning.battingTeamId === teamA.id ? teamA : teamB;
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {team.name}
            </span>
            <span className="score-display" style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
              {inning.runs}/{inning.wickets}
              <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 4 }}>
                ({inning.overs}.{inning.balls} ov)
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SetSummary({ score, teamA, teamB }: { score: SetBasedScore; teamA: Team; teamB: Team }) {
  const completed = score.sets.filter(s => s.isComplete);
  const aWins = completed.filter(s => s.winner === 'A').length;
  const bWins = completed.filter(s => s.winner === 'B').length;
  const current = score.sets[score.currentSet];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamA.name}</span>
        <span className="score-display" style={{ fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>{aWins} – {bWins}</span>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamB.name}</span>
      </div>
      {current && !current.isComplete && (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
          Set {score.currentSet + 1}: {current.teamA} – {current.teamB}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
        {score.sets.filter(s => s.isComplete).map((s, i) => (
          <span key={i} style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {s.teamA}-{s.teamB}
          </span>
        ))}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  data: AppData;
  href?: string;
}

export default function MatchCard({ match, data, href }: MatchCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const teamA = getTeamById(data, match.teamAId);
  const teamB = getTeamById(data, match.teamBId);
  if (!teamA || !teamB) return null;

  const color = sportColors[match.sport];
  const isLive = match.status === 'live';

  const card = (
    <div
      className="card-hover"
      style={{
        background: '#0f172a',
        border: `1px solid ${isLive ? color + '40' : '#1e293b'}`,
        borderRadius: 16,
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {/* Top glow for live */}
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            background: color + '20', color, borderRadius: 6, padding: '2px 8px',
            fontSize: '0.75rem', fontWeight: 700
          }}>
            {sportEmoji[match.sport]} {match.sport.toUpperCase()}
          </span>
          <span style={{ color: '#475569', fontSize: '0.72rem' }}>{match.round}</span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Score / Teams */}
      <div style={{ marginBottom: '0.875rem' }}>
        {match.score ? (
          match.sport === 'cricket' ? (
            <CricketSummary
              score={match.score as CricketScore}
              teamA={teamA}
              teamB={teamB}
            />
          ) : (
            <SetSummary
              score={match.score as SetBasedScore}
              teamA={teamA}
              teamB={teamB}
            />
          )
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamA.name}</span>
            <span style={{ color: '#475569', fontWeight: 700 }}>vs</span>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{teamB.name}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.75rem' }}>
          <MapPin size={12} />
          {match.venue}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.75rem' }}>
          <Clock size={12} />
          {mounted ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
        </div>
        {match.winnerId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f97316', fontSize: '0.75rem', marginLeft: 'auto' }}>
            <Trophy size={12} />
            {getTeamById(data, match.winnerId)?.name} won
          </div>
        )}
        {isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: '0.75rem', marginLeft: 'auto' }}>
            <Zap size={12} />
            View Live
          </div>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{card}</Link>;
  return card;
}
