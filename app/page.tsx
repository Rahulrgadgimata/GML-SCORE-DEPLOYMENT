'use client';
export const dynamic = 'force-dynamic';
import { useAppContext } from '@/lib/context';
import { Team } from '@/lib/types';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { data } = useAppContext();
  const liveMatches = data.matches.filter(m => m.status === 'live');
  const upcomingMatches = data.matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const recentMatches = data.matches.filter(m => m.status === 'completed').slice(-2);

  const totalTeams = data.teams.length;
  const totalMatches = data.matches.length;
  const liveCount = liveMatches.length;

  // Top teams per sport
  const cricketTeams = data.teams.filter(t => t.sport === 'cricket').sort((a, b) => b.points - a.points);
  const volleyballTeams = data.teams.filter(t => t.sport === 'volleyball').sort((a, b) => b.points - a.points);
  const throwballTeams = data.teams.filter(t => t.sport === 'throwball').sort((a, b) => b.points - a.points);

  return (
    <div className="responsive-container" style={{ padding: '2rem 1rem' }}>
      {/* Hero Banner */}
      <div className="p-responsive" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
        border: '1px solid #312e81',
        borderRadius: 20, padding: '3.5rem 2rem', marginBottom: '2.5rem',
        position: 'relative', overflow: 'hidden', textAlign: 'center'
      }}>
        {/* Decorative blobs */}
        <div className="hide-xs" style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent)',
          borderRadius: '50%'
        }} />
        <div className="hide-xs" style={{
          position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              background: 'rgba(249,115,22,0.15)', color: '#f97316',
              padding: '6px 18px', borderRadius: 100, fontSize: '0.75rem',
              fontWeight: 700, border: '1px solid rgba(249,115,22,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              🔥 Season 3 · 2026 — In Progress
            </span>
          </div>
          <h1 className="shimmer-text text-title-mobile" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, margin: '0 0 0.5rem', lineHeight: 1.1 }}>
            GM League 2026
          </h1>
          <p className="text-subtitle-mobile" style={{ color: '#94a3b8', fontSize: '1.2rem', margin: '0 0 2rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            College Sports Championship · 🏏 Cricket · 🏐 Volleyball · 🤾 Throwball
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <StatPill label="Teams" value={totalTeams} icon="🏆" />
            <StatPill label="Matches" value={totalMatches} icon="🎯" />
            <StatPill label="Live Now" value={liveCount} icon="🔴" live />
          </div>
        </div>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <SectionHeader title="🔴 Live Matches" href="/matches" />
          <div className="grid-auto-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} data={data} href={`/matches/${m.id}`} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats / Leader per sport */}
      <section style={{ marginBottom: '3rem' }}>
        <SectionHeader title="🏅 Category Leaders" />
        <div className="grid-auto-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <LeaderCard sport="cricket" teams={cricketTeams} emoji="🏏" color="#f97316" />
          <LeaderCard sport="volleyball" teams={volleyballTeams} emoji="🏐" color="#8b5cf6" />
          <LeaderCard sport="throwball" teams={throwballTeams} emoji="🤾" color="#ec4899" />
        </div>
      </section>

      {/* Upcoming + Recent */}
      <div className="grid-auto-mobile" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
        {upcomingMatches.length > 0 && (
          <section>
            <SectionHeader title="📅 Upcoming Matches" href="/schedule" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingMatches.map(m => (
                <MatchCard key={m.id} match={m} data={data} href={`/matches/${m.id}`} />
              ))}
            </div>
          </section>
        )}
        {recentMatches.length > 0 && (
          <section>
            <SectionHeader title="✅ Recent Results" href="/matches" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentMatches.map(m => (
                <MatchCard key={m.id} match={m} data={data} href={`/matches/${m.id}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, icon, live }: { label: string; value: number; icon: string; live?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.05)', borderRadius: 10,
      padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div>
        <div style={{ color: live ? '#22c55e' : 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{label}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{title}</h2>
      {href && (
        <Link href={href} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: '#f97316', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500
        }}>
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function LeaderCard({ sport, teams, emoji, color }: { sport: string; teams: Team[]; emoji: string; color: string }) {
  const top = teams[0];
  const second = teams[1];
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b',
      borderRadius: 16, padding: '1.25rem',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
          {emoji} {sport.charAt(0).toUpperCase() + sport.slice(1)}
        </span>
        <Star size={14} color={color} />
      </div>
      {top ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, color }}>🥇</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{top.name}</span>
            </div>
            <span style={{ color, fontWeight: 700 }}>{top.points} pts</span>
          </div>
          {second && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, color: '#94a3b8' }}>🥈</span>
                <span style={{ color: '#94a3b8' }}>{second.name}</span>
              </div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>{second.points} pts</span>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>No teams</p>
      )}
    </div>
  );
}
