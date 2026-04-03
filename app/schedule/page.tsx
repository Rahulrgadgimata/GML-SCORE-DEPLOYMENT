'use client';
import { useAppContext } from '@/lib/context';
import { Sport } from '@/lib/types';
import { getTeamById } from '@/lib/store';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, Clock } from 'lucide-react';
import { Match } from '@/lib/types';

const sportColors: Record<Sport, string> = {
  cricket: '#f97316', volleyball: '#8b5cf6', throwball: '#ec4899'
};
const sportEmoji: Record<Sport, string> = {
  cricket: '🏏', volleyball: '🏐', throwball: '🤾'
};

function groupByDate(matches: Match[]) {
  const groups: Record<string, Match[]> = {};
  matches.forEach(m => {
    const day = new Date(m.date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  });
  return groups;
}

export default function SchedulePage() {
  const { data } = useAppContext();
  const sorted = [...data.matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const groups = groupByDate(sorted);

  return (
    <div className="responsive-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-title-mobile" style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: '0 0 0.5rem' }}>
          <Calendar size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#f97316' }} />
          Match Schedule
        </h1>
        <p className="text-subtitle-mobile" style={{ color: '#64748b', margin: 0 }}>GM League 2026 · Season 3 fixtures</p>
      </div>

      {Object.entries(groups).map(([date, matches]) => (
        <div key={date} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{
               color: '#64748b', fontSize: '0.72rem', fontWeight: 800,
               background: 'rgba(15,23,42,0.6)', padding: '6px 16px', borderRadius: 100,
               border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>{date}</span>
            <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map(m => {
              const teamA = getTeamById(data, m.teamAId);
              const teamB = getTeamById(data, m.teamBId);
              if (!teamA || !teamB) return null;
              const color = sportColors[m.sport as Sport];
              const isLive = m.status === 'live';

              return (
                <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover p-responsive" style={{
                    background: '#0f172a',
                    border: `1px solid ${isLive ? color + '30' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 16, padding: '1.25rem',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem',
                  }}>
                    {/* Time (Desktop primary) */}
                    <div style={{ minWidth: 60 }} className="hide-xs">
                       <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                         {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>

                    {/* Left: Metadata */}
                    <div style={{ minWidth: 100 }}>
                      <div style={{ color, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {sportEmoji[m.sport as Sport]} {m.sport}
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>{m.round}</div>
                    </div>

                    {/* Middle: Teams */}
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 180 }}>
                      <div style={{ flex: 1, textAlign: 'right', color: 'white', fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamA.name}</div>
                      <span style={{ color: '#334155', fontWeight: 800, fontSize: '0.75rem' }}>VS</span>
                      <div style={{ flex: 1, textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamB.name}</div>
                    </div>

                    {/* Right: Info */}
                    <div style={{ minWidth: 120 }} className="w-full-xs">
                       <div style={{
                         fontSize: '0.72rem',
                         color: isLive ? '#22c55e' : m.status === 'upcoming' ? '#f97316' : '#475569',
                         fontWeight: 800, marginBottom: 4, textTransform: 'uppercase'
                       }}>
                         {isLive ? '🔴 LIVE NOW' : m.status === 'upcoming' ? '⌛ COMING UP' : '✔ COMPLETED'}
                       </div>
                       <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> {m.venue}
                         </div>
                         <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                            <Clock size={12} /> {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                       </div>
                    </div>

                    <div style={{ marginLeft: 'auto' }} className="hide-xs">
                      <ChevronRight size={20} color="#1e293b" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
