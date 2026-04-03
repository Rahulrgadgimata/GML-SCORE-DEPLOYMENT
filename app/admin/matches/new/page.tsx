'use client';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateId } from '@/lib/store';
import { Match, Sport, CricketScore, SetBasedScore } from '@/lib/types';
import { ChevronLeft, Plus } from 'lucide-react';

const SPORTS: { key: Sport; label: string; emoji: string }[] = [
  { key: 'cricket', label: "Men's Cricket", emoji: '🏏' },
  { key: 'volleyball', label: "Men's Volleyball", emoji: '🏐' },
  { key: 'throwball', label: "Women's Throwball", emoji: '🤾' },
];
const ROUNDS = ['Group Stage', 'Quarter-Final', 'Semi-Final', 'Final', 'Friendly'];

export const dynamic = 'force-dynamic';

export default function NewMatchPage() {
  const { data, dispatch, isAdminLoggedIn, hydrated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAdminLoggedIn) router.replace('/admin/login');
  }, [isAdminLoggedIn, router, hydrated]);

  if (!hydrated || !isAdminLoggedIn) return null;

  const [sport, setSport] = useState<Sport>('cricket');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [venue, setVenue] = useState('');
  const [round, setRound] = useState('Group Stage');
  const [totalOvers, setTotalOvers] = useState(10);
  const [error, setError] = useState('');

  const sportTeams = data.teams.filter(t => t.sport === sport);

  const handleCreate = () => {
    if (!teamAId || !teamBId) return setError('Select both teams.');
    if (teamAId === teamBId) return setError('Teams must be different.');
    if (!venue) return setError('Enter a venue.');
    setError('');

    const id = generateId();
    const emptyScore: CricketScore = {
      innings: [{
        battingTeamId: teamAId, bowlingTeamId: teamBId,
        runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, events: [], isComplete: false
      }],
      currentInnings: 0, totalOvers, format: '10'
    };
    const emptySetScore: SetBasedScore = {
      sets: [{ teamA: 0, teamB: 0, isComplete: false }],
      currentSet: 0, setsToWin: 2, fouls: { teamA: 0, teamB: 0 }
    };

    const match: Match = {
      id, sport, teamAId, teamBId,
      status: 'upcoming',
      date: new Date(date).toISOString(),
      venue, round,
      score: sport === 'cricket' ? emptyScore : emptySetScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MATCH', payload: match });
    router.push(`/admin/matches/${id}`);
  };

  if (!isAdminLoggedIn) return null;

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{
          background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem',
          color: '#94a3b8', cursor: 'pointer'
        }}>
          <ChevronLeft size={18} />
        </button>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>Create New Match</h1>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.5rem' }}>
        {/* Sport selection */}
        <FormField label="Sport">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SPORTS.map(s => (
              <button key={s.key} onClick={() => { setSport(s.key); setTeamAId(''); setTeamBId(''); }} style={{
                padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: sport === s.key ? 'rgba(249,115,22,0.15)' : '#1e293b',
                color: sport === s.key ? '#f97316' : '#64748b',
                outline: sport === s.key ? '2px solid rgba(249,115,22,0.4)' : 'none',
              }}>{s.emoji} {s.label}</button>
            ))}
          </div>
        </FormField>

        {/* Teams */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Team A">
            <Select value={teamAId} onChange={setTeamAId} options={sportTeams.map(t => ({ value: t.id, label: t.name }))} placeholder="Select team A" />
          </FormField>
          <FormField label="Team B">
            <Select value={teamBId} onChange={setTeamBId} options={sportTeams.filter(t => t.id !== teamAId).map(t => ({ value: t.id, label: t.name }))} placeholder="Select team B" />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Date & Time">
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Venue">
            <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Main Ground" style={inputStyle} />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Round">
            <Select value={round} onChange={setRound} options={ROUNDS.map(r => ({ value: r, label: r }))} />
          </FormField>
          {sport === 'cricket' && (
            <FormField label="Total Overs">
              <input type="number" min={1} max={50} value={totalOvers} onChange={e => setTotalOvers(parseInt(e.target.value) || 10)} style={inputStyle} />
            </FormField>
          )}
        </div>

        {error && <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

        <button onClick={handleCreate} style={{
          width: '100%', padding: '0.875rem',
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          border: 'none', borderRadius: 10, color: 'white',
          fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <Plus size={18} /> Create Match & Enter Score
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
  color: 'white', padding: '0.6rem 0.75rem', width: '100%',
  fontSize: '0.875rem', boxSizing: 'border-box'
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
