'use client';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Plus, Users, Edit, LogOut, Activity, Trophy, Calendar, Trash2, RefreshCcw, TrendingUp } from 'lucide-react';
import { getAutomatedStandings } from '@/lib/store';
import { Sport } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const { data, dispatch, isAdminLoggedIn, setIsAdminLoggedIn, hydrated } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAdminLoggedIn) {
      router.replace('/admin/login');
    }
  }, [isAdminLoggedIn, router, hydrated]);

  if (!hydrated || !isAdminLoggedIn) return null;

  const handleReset = async () => {
    if (confirm('Restore demo defaults? This will erase current progress.')) {
        try {
            await fetch('/api/reset', { method: 'POST' });
            window.location.reload();
        } catch (err) { alert('Reset failed!'); }
    }
  };

  const handleClear = async () => {
    if (confirm('⚠️ PERMANENTLY DELETE ALL DATA? This cannot be undone.')) {
        try {
            await fetch('/api/clear', { method: 'POST' });
            window.location.reload();
        } catch (err) { alert('Clear failed!'); }
    }
  };

  const handleDeleteMatch = (id: string, teams: string) => {
    if (confirm(`Are you sure you want to delete the match: ${teams}?`)) {
      dispatch({ type: 'DELETE_MATCH', payload: id });
    }
  };

  const handleDeleteTeam = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the team: ${name}?`)) {
      dispatch({ type: 'DELETE_TEAM', payload: id });
    }
  };

  const liveMatches = data.matches.filter(m => m.status === 'live');
  const upcomingMatches = data.matches.filter(m => m.status === 'upcoming');
  const completedMatches = data.matches.filter(m => m.status === 'completed');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: '0 0 0.25rem' }}>
            <Shield size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: '#f97316' }} />
            Admin Panel
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage matches, teams, and scores</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleReset} style={secondaryBtnStyle}><RefreshCcw size={14} /> Restore Defaults</button>
            <button onClick={handleClear} style={{ ...secondaryBtnStyle, color: '#f43f5e' }}><Trash2 size={14} /> Clear All</button>
            <button onClick={() => { setIsAdminLoggedIn(false); router.push('/'); }} style={signoutBtnStyle}><LogOut size={14} /> Sign Out</button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Live Matches', value: liveMatches.length, color: '#22c55e', icon: <Activity size={18} /> },
          { label: 'Upcoming', value: upcomingMatches.length, color: '#f97316', icon: <Calendar size={18} /> },
          { label: 'Completed', value: completedMatches.length, color: '#8b5cf6', icon: <Trophy size={18} /> },
          { label: 'Total Teams', value: data.teams.length, color: '#3b82f6', icon: <Users size={18} /> },
        ].map(stat => (
          <div key={stat.label} style={statCardStyle(stat.color)}>
            <div style={{ color: stat.color }}>{stat.icon}</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem' }}>{stat.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeaderStyle}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <ActionCard href="/admin/matches/new" icon={<Plus size={20} />} title="Create New Match" desc="Set up a fixture" color="#f97316" />
          <ActionCard href="/admin/teams" icon={<Users size={20} />} title="Manage Teams" desc="Edit players & base stats" color="#3b82f6" />
          <ActionCard href="/leaderboard" icon={<TrendingUp size={20} />} title="View Leaderboard" desc="Public site view" color="#22c55e" />
        </div>
      </div>

      {/* Leaderboard Management Preview */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={sectionHeaderStyle}>🏅 Standings Management</h2>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 4rem 8rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
             {['#', 'Team', 'P', 'Actions'].map((h, i) => <div key={i} style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 800, textAlign: i > 2 ? 'right' : 'left' }}>{h.toUpperCase()}</div>)}
          </div>
          {['cricket', 'volleyball', 'throwball'].map(s => {
            const table = getAutomatedStandings(data, s as Sport);
            const color = s === 'cricket' ? '#f97316' : s === 'volleyball' ? '#8b5cf6' : '#ec4899';
            if (table.length === 0) return null;
            return (
              <div key={s} style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color, marginBottom: '0.4rem' }}>{s.toUpperCase()}</div>
                {table.map((t, idx) => (
                  <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 4rem 8rem', padding: '0.5rem 0', alignItems: 'center' }}>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{idx + 1}</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{t.played}</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link href="/admin/teams" style={rowBtnStyle('#3b82f6')}><Edit size={12} /></Link>
                        <button onClick={() => handleDeleteTeam(t.id, t.name)} style={rowBtnStyle('#f43f5e')}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {!data.teams.length && <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>No teams. Add one above!</div>}
        </div>
      </div>

      {/* Live matches - score entry */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={sectionHeaderStyle}>🔴 Enter Scores — Live Matches</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {liveMatches.map(m => {
              const teamA = data.teams.find(t => t.id === m.teamAId);
              const teamB = data.teams.find(t => t.id === m.teamBId);
              const color = m.sport === 'cricket' ? '#f97316' : m.sport === 'volleyball' ? '#8b5cf6' : '#ec4899';
              return (
                <Link key={m.id} href={`/admin/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{
                    background: '#0f172a', border: `1px solid ${color}30`, borderRadius: 12,
                    padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ color, fontSize: '0.75rem', fontWeight: 800 }}>{m.sport.toUpperCase()} · {m.round}</span>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', marginTop: 4 }}>{teamA?.name} vs {teamB?.name}</div>
                    </div>
                    <span style={{ background: color + '20', color, padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem' }}>Edit Score</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All matches manage */}
      <div>
        <h2 style={sectionHeaderStyle}>All Matches</h2>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
          {data.matches.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>No matches found.</div>
          ) : (
            data.matches.map((m, i) => {
              const teamA = data.teams.find(t => t.id === m.teamAId);
              const teamB = data.teams.find(t => t.id === m.teamBId);
              const color = m.sport === 'cricket' ? '#f97316' : m.sport === 'volleyball' ? '#8b5cf6' : '#ec4899';
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: i < data.matches.length - 1 ? '1px solid #1e293b' : 'none' }}>
                  <div>
                    <span style={{ color, fontSize: '0.72rem', fontWeight: 800 }}>{m.sport.toUpperCase()}</span>
                    <div style={{ color: 'white', fontWeight: 600 }}>{teamA?.name} vs {teamB?.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.venue} · {m.round}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={statusBadgeStyle(m.status)}>{m.status.toUpperCase()}</span>
                    <Link href={`/admin/matches/${m.id}`} style={rowBtnStyle('#94a3b8')}><Edit size={14} /></Link>
                    <button onClick={() => handleDeleteMatch(m.id, `${teamA?.name} vs ${teamB?.name}`)} style={rowBtnStyle('#f43f5e')}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: '0.75rem', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{title}</div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{desc}</div>
      </div>
    </Link>
  );
}

const sectionHeaderStyle: React.CSSProperties = { color: 'white', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1rem' };
const secondaryBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' };
const signoutBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, color: '#f43f5e', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' };
const rowBtnStyle = (color: string): React.CSSProperties => ({ background: color + '15', border: 'none', borderRadius: 6, padding: '6px', color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' });

function statCardStyle(color: string): React.CSSProperties {
  return { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6, borderLeft: `3px solid ${color}` };
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const isLive = status === 'live';
  const isUp = status === 'upcoming';
  return { fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: isLive ? 'rgba(34,197,94,0.1)' : isUp ? 'rgba(249,115,22,0.1)' : '#1e293b', color: isLive ? '#22c55e' : isUp ? '#f97316' : '#64748b' };
}
