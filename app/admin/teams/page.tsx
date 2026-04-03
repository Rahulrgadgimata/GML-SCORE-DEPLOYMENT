'use client';
export const dynamic = 'force-dynamic';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateId } from '@/lib/store';
import { Team, Player, Sport } from '@/lib/types';
import { Plus, Trash2, UserPlus, ChevronLeft, Check, X as XIcon } from 'lucide-react';

const SPORT_OPTIONS: { key: Sport; label: string; gender: 'mens' | 'womens' }[] = [
  { key: 'cricket', label: "Men's Cricket", gender: 'mens' },
  { key: 'volleyball', label: "Men's Volleyball", gender: 'mens' },
  { key: 'throwball', label: "Women's Throwball", gender: 'womens' },
];

const TEAM_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#f43f5e', '#f59e0b', '#06b6d4'];

export default function AdminTeamsPage() {
  const { data, dispatch, isAdminLoggedIn, hydrated } = useAppContext();
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<Sport>('cricket');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState(TEAM_COLORS[0]);
  const [addingPlayerTo, setAddingPlayerTo] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('');
  const [newPlayerJersey, setNewPlayerJersey] = useState('');

  useEffect(() => {
    if (hydrated && !isAdminLoggedIn) router.replace('/admin/login');
  }, [isAdminLoggedIn, router, hydrated]);

  if (!hydrated || !isAdminLoggedIn) return null;

  const sportConfig = SPORT_OPTIONS.find(s => s.key === selectedSport)!;
  const teams = data.teams.filter(t => t.sport === selectedSport);
  const color = selectedSport === 'cricket' ? '#f97316' : selectedSport === 'volleyball' ? '#8b5cf6' : '#ec4899';

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const team: Team = {
      id: generateId(), name: newTeamName.trim(),
      sport: selectedSport, gender: sportConfig.gender,
      players: [], wins: 0, losses: 0, draws: 0, points: 0,
      color: newTeamColor
    };
    dispatch({ type: 'ADD_TEAM', payload: team });
    setNewTeamName(''); setShowAddTeam(false);
  };

  const deleteTeam = (teamId: string) => {
    if (!confirm('Delete this team?')) return;
    dispatch({ type: 'DELETE_TEAM', payload: teamId });
  };

  const addPlayer = (team: Team) => {
    if (!newPlayerName.trim()) return;
    const player: Player = {
      id: generateId(), name: newPlayerName.trim(),
      jerseyNumber: parseInt(newPlayerJersey) || undefined,
      role: newPlayerRole || undefined,
    };
    dispatch({ type: 'UPDATE_TEAM', payload: { ...team, players: [...team.players, player] } });
    setNewPlayerName(''); setNewPlayerRole(''); setNewPlayerJersey('');
    setAddingPlayerTo(null);
  };

  const removePlayer = (team: Team, playerId: string) => {
    dispatch({ type: 'UPDATE_TEAM', payload: { ...team, players: team.players.filter(p => p.id !== playerId) } });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{ background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
          <ChevronLeft size={18} />
        </button>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>Manage Teams</h1>
      </div>

      {/* Sport tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {SPORT_OPTIONS.map(s => (
          <button key={s.key} onClick={() => setSelectedSport(s.key)} style={{
            padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            background: selectedSport === s.key ? color + '20' : '#0f172a',
            color: selectedSport === s.key ? color : '#64748b',
            outline: selectedSport === s.key ? `2px solid ${color}50` : '1px solid #1e293b',
          }}>
            {s.key === 'cricket' ? '🏏' : s.key === 'volleyball' ? '🏐' : '🤾'} {s.label}
          </button>
        ))}
        <button onClick={() => setShowAddTeam(true)} style={{
          marginLeft: 'auto', padding: '0.5rem 1.25rem', borderRadius: 10,
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Plus size={15} /> Add Team
        </button>
      </div>

      {/* Add team form */}
      {showAddTeam && (
        <div style={{ background: '#0f172a', border: `1px solid ${color}40`, borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ color: 'white', margin: '0 0 1rem', fontWeight: 700 }}>New Team</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              placeholder="Team name" style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && addTeam()}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {TEAM_COLORS.map(c => (
                <button key={c} onClick={() => setNewTeamColor(c)} style={{
                  width: 24, height: 24, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: newTeamColor === c ? '3px solid white' : '2px solid transparent'
                }} />
              ))}
            </div>
            <button onClick={addTeam} style={actionBtnStyle('#22c55e')}><Check size={15} /> Save</button>
            <button onClick={() => setShowAddTeam(false)} style={actionBtnStyle('#f43f5e')}><XIcon size={15} /></button>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#475569', background: '#0f172a', borderRadius: 16, border: '1px solid #1e293b' }}>
          No teams for this sport yet. Add one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {teams.map(team => (
            <div key={team.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden', borderTop: `3px solid ${team.color}` }}>
              {/* Team header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${team.color}, ${team.color}80)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: 'white'
                  }}>{team.name.charAt(0)}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700 }}>{team.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{team.players.length} players</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {/* Stats edit */}
                  <div style={{ display: 'flex', gap: 4, marginRight: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {['W', 'L', 'D', 'Pts'].map(label => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700 }}>{label}</span>
                        <input
                          type="number"
                          defaultValue={label === 'W' ? team.wins : label === 'L' ? team.losses : label === 'D' ? team.draws : team.points}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const key = label === 'W' ? 'wins' : label === 'L' ? 'losses' : label === 'D' ? 'draws' : 'points';
                            dispatch({ type: 'UPDATE_TEAM', payload: { ...team, [key]: val } });
                          }}
                          style={{ width: 34, background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: 'white', fontSize: '0.75rem', padding: '2px 4px', textAlign: 'center' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setAddingPlayerTo(addingPlayerTo === team.id ? null : team.id)} style={actionBtnStyle('#3b82f6')}>
                    <UserPlus size={14} /> Add Player
                  </button>
                  <button onClick={() => deleteTeam(team.id)} style={actionBtnStyle('#f43f5e')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Add player form */}
              {addingPlayerTo === team.id && (
                <div style={{ padding: '0 1.25rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(59,130,246,0.05)' }}>
                  <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="Player name" style={{ ...inputStyle, flex: 2 }} />
                  <input value={newPlayerRole} onChange={e => setNewPlayerRole(e.target.value)}
                    placeholder="Role (e.g. Batsman)" style={{ ...inputStyle, flex: 2 }} />
                  <input value={newPlayerJersey} onChange={e => setNewPlayerJersey(e.target.value)}
                    placeholder="#" type="number" style={{ ...inputStyle, width: 60 }} />
                  <button onClick={() => addPlayer(team)} style={actionBtnStyle('#22c55e')}>
                    <Check size={15} /> Add
                  </button>
                </div>
              )}

              {/* Player list */}
              {team.players.length > 0 && (
                <div style={{ borderTop: '1px solid #1e293b' }}>
                  {team.players.map((p, i) => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 1.25rem',
                      borderBottom: i < team.players.length - 1 ? '1px solid #1e293b' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#475569', fontSize: '0.72rem', minWidth: 24, textAlign: 'right' }}>#{p.jerseyNumber || '—'}</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{p.name}</span>
                        {p.role && <span style={{ color: '#64748b', fontSize: '0.72rem', background: '#1e293b', padding: '2px 8px', borderRadius: 100 }}>{p.role}</span>}
                      </div>
                      <button onClick={() => removePlayer(team, p.id)} style={{
                        background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
                        padding: 4, borderRadius: 6, display: 'flex'
                      }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
  color: 'white', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box'
};

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '0.4rem 0.75rem', borderRadius: 7, border: 'none',
    background: color + '15', color, cursor: 'pointer',
    fontWeight: 600, fontSize: '0.8rem'
  };
}
