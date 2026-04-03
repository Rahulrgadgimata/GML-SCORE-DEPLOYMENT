'use client';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { getTeamById } from '@/lib/store';
import { Match, CricketScore, SetBasedScore, CricketInnings } from '@/lib/types';
import { Save, ChevronLeft, Star } from 'lucide-react';
import { MatchStatus } from '@/lib/types';
import CricketBallScorer from '@/components/CricketBallScorer';

export const dynamic = 'force-dynamic';

export default function AdminMatchScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, dispatch, isAdminLoggedIn, hydrated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAdminLoggedIn) router.replace('/admin/login');
  }, [isAdminLoggedIn, router, hydrated]);

  const match = data.matches.find(m => m.id === id);
  const teamA = match ? getTeamById(data, match.teamAId) : undefined;
  const teamB = match ? getTeamById(data, match.teamBId) : undefined;

  const [status, setStatus] = useState<string>(match?.status ?? 'upcoming');
  const [winnerId, setWinnerId] = useState(match?.winnerId ?? '');
  const [potm, setPotm] = useState(match?.playerOfTheMatch ?? '');
  const [saved, setSaved] = useState(false);

  const [cricketScore, setCricketScore] = useState<CricketScore>(
    (match?.score as CricketScore) ?? {
      innings: [
        { battingTeamId: match?.teamAId ?? '', bowlingTeamId: match?.teamBId ?? '', runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, events: [], isComplete: false }
      ],
      currentInnings: 0, totalOvers: 10, format: '10'
    }
  );

  const [setScore, setSetScore] = useState<SetBasedScore>(
    (match?.score as SetBasedScore) ?? {
      sets: [{ teamA: 0, teamB: 0, isComplete: false }],
      currentSet: 0, setsToWin: 2, fouls: { teamA: 0, teamB: 0 }
    }
  );

  if (!isAdminLoggedIn || !match || !teamA || !teamB) return null;

  const allPlayers = [...teamA.players, ...teamB.players];
  const color = match.sport === 'cricket' ? '#f97316' : match.sport === 'volleyball' ? '#8b5cf6' : '#ec4899';

  const saveMatch = () => {
    const updated: Match = {
      ...match,
      status: status as MatchStatus,
      winnerId: winnerId || undefined,
      playerOfTheMatch: potm || undefined,
      score: match.sport === 'cricket' ? cricketScore : setScore,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_MATCH', payload: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateInnings = (idx: number, updated: CricketInnings) => {
    setCricketScore(prev => {
      const innings = [...prev.innings];
      innings[idx] = updated;
      return { ...prev, innings };
    });
  };

  const addInnings = () => {
    setCricketScore(prev => ({
      ...prev,
      innings: [...prev.innings, {
        battingTeamId: prev.innings.length % 2 === 0 ? match.teamBId : match.teamAId,
        bowlingTeamId: prev.innings.length % 2 === 0 ? match.teamAId : match.teamBId,
        runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, events: [], isComplete: false
      }],
      currentInnings: prev.innings.length
    }));
  };

  const updateSet = (idx: number, field: 'teamA' | 'teamB', val: number) => {
    setSetScore(prev => {
      const sets = [...prev.sets];
      sets[idx] = { ...sets[idx], [field]: val };
      const s = sets[idx];
      const winScore = match.sport === 'volleyball' ? 25 : 15;
      if ((s.teamA >= winScore || s.teamB >= winScore) && Math.abs(s.teamA - s.teamB) >= 2) {
        sets[idx].isComplete = true;
        sets[idx].winner = s.teamA > s.teamB ? 'A' : 'B';
      }
      return { ...prev, sets };
    });
  };

  const addSet = () => {
    setSetScore(prev => ({
      ...prev,
      sets: [...prev.sets, { teamA: 0, teamB: 0, isComplete: false }],
      currentSet: prev.sets.length
    }));
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{ background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>Score Entry</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
            {match.sport === 'cricket' ? '🏏' : match.sport === 'volleyball' ? '🏐' : '🤾'} {teamA.name} vs {teamB.name} · {match.round}
          </p>
        </div>
        <button onClick={saveMatch} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.65rem 1.25rem',
          background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : `linear-gradient(135deg,${color},${color}cc)`,
          border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s'
        }}>
          <Save size={15} /> {saved ? '✅ Saved!' : 'Save'}
        </button>
      </div>

      {/* Match Status */}
      <Section title="Match Status">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['upcoming', 'live', 'completed'] as const).map(s => (
            <StatusBtn key={s} value={s} current={status} color={color} onChange={setStatus} />
          ))}
        </div>
      </Section>

      {/* Cricket: Ball-by-Ball Scorer */}
      {match.sport === 'cricket' ? (
        <>
          {/* Format selector */}
          <Section title="🏏 Cricket Format">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {(['10', '20', 'T20', 'ODI'] as const).map(f => (
                <button key={f} onClick={() => setCricketScore(p => ({ ...p, format: f }))} style={{
                  padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.82rem',
                  background: cricketScore.format === f ? 'rgba(249,115,22,0.2)' : '#1e293b',
                  color: cricketScore.format === f ? '#f97316' : '#64748b',
                  outline: cricketScore.format === f ? '2px solid rgba(249,115,22,0.4)' : 'none',
                }}>{f} overs</button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <label style={{ color: '#64748b', fontSize: '0.8rem' }}>Total Overs:</label>
                <input type="number" min={1} max={50} value={cricketScore.totalOvers}
                  onChange={e => setCricketScore(p => ({ ...p, totalOvers: parseInt(e.target.value) || 10 }))}
                  style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', padding: '0.4rem 0.6rem', width: 70, fontSize: '0.875rem' }} />
              </div>
            </div>
          </Section>

          {/* Innings */}
          {cricketScore.innings.map((inn, i) => {
            const battingTeam = inn.battingTeamId === teamA.id ? teamA : teamB;
            const bowlingTeam = inn.battingTeamId === teamA.id ? teamB : teamA;
            return (
              <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
                {/* Innings header with complete toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.9rem' }}>
                    {['1st', '2nd', '3rd'][i] ?? `${i + 1}th`} Innings — {battingTeam.name} Batting
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={inn.isComplete}
                      onChange={e => updateInnings(i, { ...inn, isComplete: e.target.checked })} />
                    Innings Complete
                  </label>
                </div>
                {/* Target display for 2nd innings */}
                {i === 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', flexShrink: 0 }}>Target Runs:</label>
                    <input type="number" min={0} value={inn.targetRuns ?? ''}
                      onChange={e => updateInnings(i, { ...inn, targetRuns: parseInt(e.target.value) || undefined })}
                      placeholder={cricketScore.innings[0] ? String(cricketScore.innings[0].runs + 1) : ''}
                      style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', padding: '0.5rem 0.75rem', width: 120, fontSize: '0.875rem' }} />
                    {cricketScore.innings[0] && !inn.targetRuns && (
                      <button onClick={() => updateInnings(i, { ...inn, targetRuns: cricketScore.innings[0].runs + 1 })} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '0.35rem 0.75rem', color: '#f97316', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                        Auto ({cricketScore.innings[0].runs + 1})
                      </button>
                    )}
                  </div>
                )}
                {/* Ball-by-Ball scorer */}
                <CricketBallScorer
                  innings={inn}
                  inningsIndex={i}
                  totalOvers={cricketScore.totalOvers}
                  battingTeam={battingTeam}
                  bowlingTeam={bowlingTeam}
                  onUpdate={(updated) => updateInnings(i, updated)}
                />
              </div>
            );
          })}
          {cricketScore.innings.length < 2 && (
            <button onClick={addInnings} style={{
              background: 'rgba(249,115,22,0.1)', border: '1px dashed rgba(249,115,22,0.4)',
              borderRadius: 10, padding: '0.75rem', width: '100%', color: '#f97316',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem'
            }}>
              + Add 2nd Innings
            </button>
          )}
        </>
      ) : (
        /* Volleyball / Throwball set-based scoring */
        <Section title={`${match.sport === 'volleyball' ? '🏐 Volleyball' : '🤾 Throwball'} Score — Sets`}>
          {setScore.sets.map((s, i) => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem', minWidth: 50 }}>Set {i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{teamA.name}</label>
                  <input type="number" value={s.teamA} min={0} onChange={e => updateSet(i, 'teamA', parseInt(e.target.value) || 0)} style={numInputStyle} />
                </div>
                <span style={{ color: '#475569', fontWeight: 800, fontSize: '1.1rem', marginTop: 18 }}>—</span>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{teamB.name}</label>
                  <input type="number" value={s.teamB} min={0} onChange={e => updateSet(i, 'teamB', parseInt(e.target.value) || 0)} style={numInputStyle} />
                </div>
              </div>
              {s.isComplete && (
                <span style={{ color, fontSize: '0.78rem', fontWeight: 700 }}>
                  {s.winner === 'A' ? teamA.name : teamB.name} won
                </span>
              )}
            </div>
          ))}
          <button onClick={addSet} style={{ background: `${color}15`, border: `1px dashed ${color}50`, borderRadius: 10, padding: '0.75rem', width: '100%', color, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            + Add Set
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Fouls — {teamA.name}</label>
              <input type="number" min={0} value={setScore.fouls?.teamA ?? 0}
                onChange={e => setSetScore(p => ({ ...p, fouls: { ...p.fouls!, teamA: parseInt(e.target.value) || 0 } }))}
                style={numInputStyle} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Fouls — {teamB.name}</label>
              <input type="number" min={0} value={setScore.fouls?.teamB ?? 0}
                onChange={e => setSetScore(p => ({ ...p, fouls: { ...p.fouls!, teamB: parseInt(e.target.value) || 0 } }))}
                style={numInputStyle} />
            </div>
          </div>
        </Section>
      )}

      {/* Winner + POTM */}
      {status === 'completed' && (
        <Section title="🏆 Match Result">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Winner</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[{ id: '', label: 'No result / Draw' }, { id: teamA.id, label: teamA.name }, { id: teamB.id, label: teamB.name }].map(opt => (
                <button key={opt.id} onClick={() => setWinnerId(opt.id)} style={{
                  padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: winnerId === opt.id ? 'rgba(245,158,11,0.2)' : '#1e293b',
                  color: winnerId === opt.id ? '#f59e0b' : '#94a3b8',
                  outline: winnerId === opt.id ? '2px solid rgba(245,158,11,0.4)' : 'none',
                }}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>
              <Star size={13} style={{ verticalAlign: 'middle', marginRight: 4, color: '#f97316' }} />Player of the Match
            </label>
            <select value={potm} onChange={e => setPotm(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', padding: '0.6rem 0.75rem', width: '100%', fontSize: '0.875rem' }}>
              <option value="">Select player...</option>
              {allPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {allPlayers.indexOf(p) < teamA.players.length ? teamA.name : teamB.name}</option>
              ))}
            </select>
          </div>
        </Section>
      )}
    </div>
  );
}

const numInputStyle: React.CSSProperties = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
  color: 'white', padding: '0.5rem 0.75rem', width: '100%',
  fontSize: '1rem', fontWeight: 700, marginTop: 4, boxSizing: 'border-box'
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
      <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 1rem', fontSize: '0.95rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function StatusBtn({ value, current, onChange, color }: { value: string; current: string; color: string; onChange: (v: string) => void }) {
  const colors: Record<string, string> = { live: '#22c55e', upcoming: '#f97316', completed: '#8b5cf6' };
  const c = colors[value];
  return (
    <button onClick={() => onChange(value)} style={{
      padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize',
      background: current === value ? c + '20' : '#1e293b',
      color: current === value ? c : '#64748b',
      outline: current === value ? `2px solid ${c}50` : 'none',
    }}>{value === 'live' ? '🔴' : value === 'upcoming' ? '⏳' : '✅'} {value}</button>
  );
}
