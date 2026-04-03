'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { CricketInnings, BallEvent, Team, Player } from '@/lib/types';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  innings: CricketInnings;
  inningsIndex: number;
  totalOvers: number;
  battingTeam: Team;
  bowlingTeam: Team;
  onUpdate: (updated: CricketInnings) => void;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function isLegalBall(e: BallEvent): boolean {
  return !e.isExtra || (e.extraType !== 'wide' && e.extraType !== 'noball');
}

function recalc(events: BallEvent[]) {
  let runs = 0, wickets = 0, legalBalls = 0, extras = 0;
  for (const e of events) {
    runs += e.runs + e.extraRuns;
    if (e.isWicket) wickets++;
    if (isLegalBall(e)) legalBalls++;
    if (e.isExtra) extras += e.extraRuns;
  }
  return { runs, wickets: Math.min(wickets, 10), overs: Math.floor(legalBalls / 6), balls: legalBalls % 6, extras, legalBalls };
}

function getCurrentOverEvents(events: BallEvent[]): BallEvent[] {
  let startIdx = 0, legal = 0;
  for (let i = 0; i < events.length; i++) {
    if (isLegalBall(events[i]) && ++legal % 6 === 0) startIdx = i + 1;
  }
  return events.slice(startIdx);
}

function bColor(e: BallEvent): string {
  if (e.isWicket) return '#f43f5e';
  if (e.isSix) return '#8b5cf6';
  if (e.isFour) return '#22c55e';
  if (e.extraType === 'wide' || e.extraType === 'noball') return '#eab308';
  if (e.runs + e.extraRuns === 0) return '#475569';
  return '#3b82f6';
}

function bLabel(e: BallEvent): string {
  if (e.isWicket) return 'W';
  if (e.isSix) return '6';
  if (e.isFour) return '4';
  if (e.extraType === 'wide') return 'Wd';
  if (e.extraType === 'noball') return 'NB';
  if (e.extraType === 'bye') return `B`;
  if (e.extraType === 'legbye') return `LB`;
  return String(e.runs);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBtn({ label, sub, bg, color = 'white', onClick }: {
  label: string; sub?: string; bg: string; color?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      background: bg, color, border: 'none', borderRadius: 14, padding: '1rem 0.5rem',
      cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      transition: 'transform 0.1s, opacity 0.1s', width: '100%',
    }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.94)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {label}
      {sub && <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.7 }}>{sub}</span>}
    </button>
  );
}

function PlayerSelect({ label, value, onChange, players, color }: {
  label: string; value: string; onChange: (v: string) => void; players: Player[]; color: string;
}) {
  return (
    <div>
      <label style={{ color, fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: '#1e293b', border: `1px solid ${color}40`, borderRadius: 8,
        color: 'white', padding: '0.5rem 0.75rem', width: '100%', fontSize: '0.875rem', cursor: 'pointer',
      }}>
        <option value="">— Select —</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.name}{p.role ? ` (${p.role})` : ''}</option>)}
      </select>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CricketBallScorer({ innings, inningsIndex, totalOvers, battingTeam, bowlingTeam, onUpdate }: Props) {
  const [striker, setStriker] = useState(battingTeam.players[0]?.id ?? '');
  const [nonStriker, setNonStriker] = useState(battingTeam.players[1]?.id ?? '');
  const [bowler, setBowler] = useState(bowlingTeam.players[0]?.id ?? '');
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [extrasPanel, setExtrasPanel] = useState<'wide' | 'noball' | 'bye' | 'legbye' | null>(null);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [dismissalType, setDismissalType] = useState('bowled');
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [prevBowler, setPrevBowler] = useState<string>('');

  const events: BallEvent[] = innings.events ?? [];
  const stats = useMemo(() => recalc(events), [events]);
  const currentOverBalls = useMemo(() => getCurrentOverEvents(events), [events]);
  const legalInCurrentOver = currentOverBalls.filter(isLegalBall).length;

  const rr = stats.legalBalls > 0 ? (stats.runs / (stats.legalBalls / 6)).toFixed(2) : '0.00';
  const runsNeeded = innings.targetRuns != null ? innings.targetRuns - stats.runs : null;
  const oversLeft = totalOvers - stats.legalBalls / 6;
  const rrr = (runsNeeded != null && runsNeeded > 0 && oversLeft > 0) ? (runsNeeded / oversLeft).toFixed(2) : null;

  const putToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const persist = useCallback((ball: BallEvent) => {
    const newEvents = [...events, ball];
    const newStats = recalc(newEvents);
    // Detect end of over
    const legal = isLegalBall(ball);
    const wasOverEnd = legal && newStats.balls === 0 && newStats.legalBalls > 0 && newStats.legalBalls > stats.legalBalls;
    const totalRuns = ball.runs + ball.extraRuns;
    const oddRuns = totalRuns % 2 !== 0;
    // Swap strike: odd runs (not at over-end) OR over-end without odd runs
    const doSwap = (oddRuns && !wasOverEnd) || (!oddRuns && wasOverEnd);
    if (doSwap) { setStriker(nonStriker); setNonStriker(striker); }
    onUpdate({ ...innings, ...newStats, events: newEvents });
    if (wasOverEnd) {
      setPrevBowler(ball.bowler);
      setBowler(''); // clear so guard blocks further scoring
      setShowBowlerSelect(true);
    }
  }, [events, innings, onUpdate, striker, nonStriker, stats.legalBalls]);

  const guard = () => {
    if (!striker) { putToast('⚠️ Select a striker'); return false; }
    if (!bowler) { putToast('⚠️ Select a bowler'); return false; }
    return true;
  };

  const handleRuns = (runs: number, isFour = false, isSix = false) => {
    if (!guard()) return;
    persist({ runs, extraRuns: 0, isWicket: false, isExtra: false, batsman: striker, bowler, isFour, isSix });
    setExtrasPanel(null);
  };

  const handleExtra = (type: 'wide' | 'noball' | 'bye' | 'legbye', extraRuns: number) => {
    if (!bowler) { putToast('⚠️ Select a bowler'); return; }
    const penalty = (type === 'wide' || type === 'noball') ? 1 : 0;
    persist({ runs: 0, extraRuns: penalty + extraRuns, isWicket: false, isExtra: true, extraType: type, batsman: striker, bowler });
    setExtrasPanel(null);
    const names: Record<string, string> = { wide: 'Wide', noball: 'No Ball', bye: 'Bye', legbye: 'Leg Bye' };
    putToast(`${names[type]} +${penalty + extraRuns} run${(penalty + extraRuns) !== 1 ? 's' : ''}`);
  };

  const confirmWicket = () => {
    persist({ runs: 0, extraRuns: 0, isWicket: true, isExtra: false, batsman: striker, bowler, description: dismissalType });
    setShowWicketModal(false);
    putToast('🏏 Wicket! Update striker for new batsman.');
  };

  const undo = () => {
    if (events.length === 0) { putToast('Nothing to undo'); return; }
    const newEvents = events.slice(0, -1);
    onUpdate({ ...innings, ...recalc(newEvents), events: newEvents });
    putToast('↩ Last ball undone');
  };

  // History grouped by over
  const history = useMemo(() => {
    const result: { label: string; desc: string; color: string }[] = [];
    let legal = 0, overNum = 0, ballInOver = 0;
    for (const e of events) {
      const isL = isLegalBall(e);
      if (isL) { ballInOver++; }
      const overLabel = isL ? `${overNum}.${ballInOver}` : `${overNum}.${ballInOver}+`;
      const desc = e.isWicket ? `WICKET (${e.description ?? 'out'})` : e.isSix ? 'SIX!' : e.isFour ? 'FOUR!' : e.isExtra ? `${e.extraType?.toUpperCase()} +${e.extraRuns}` : `${e.runs} run${e.runs !== 1 ? 's' : ''}`;
      result.push({ label: overLabel, desc, color: bColor(e) });
      if (isL) {
        legal++;
        if (ballInOver === 6) { overNum++; ballInOver = 0; }
      }
    }
    return result.reverse();
  }, [events]);

  const isOver = stats.wickets >= 10 || stats.overs >= totalOvers || innings.isComplete;
  const ordinals = ['1st', '2nd', '3rd', '4th'];

  return (
    <div style={{ position: 'relative', fontFamily: 'inherit' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
          padding: '0.6rem 1.5rem', color: 'white', fontWeight: 600, fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>{toast}</div>
      )}

      {/* Wicket Modal */}
      {showWicketModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '2px solid #f43f5e60', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 380 }}>
            <h3 style={{ color: '#f43f5e', fontWeight: 800, margin: '0 0 1.25rem', fontSize: '1.1rem', textAlign: 'center' }}>🏏 How was {battingTeam.players.find(p => p.id === striker)?.name || 'batsman'} dismissed?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket'].map(dt => (
                <button key={dt} onClick={() => setDismissalType(dt)} style={{
                  background: dismissalType === dt ? '#f43f5e25' : '#1e293b',
                  color: dismissalType === dt ? '#f43f5e' : '#94a3b8',
                  border: `1px solid ${dismissalType === dt ? '#f43f5e60' : '#2d3748'}`,
                  borderRadius: 8, padding: '0.55rem 0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize',
                }}>{dt}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowWicketModal(false)} style={{ flex: 1, background: '#1e293b', border: 'none', borderRadius: 10, padding: '0.7rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={confirmWicket} style={{ flex: 2, background: 'linear-gradient(135deg,#f43f5e,#dc2626)', border: 'none', borderRadius: 10, padding: '0.7rem', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}>✅ Confirm Wicket</button>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', border: '1px solid #312e81', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ color: '#6366f1', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          {ordinals[inningsIndex] ?? `${inningsIndex + 1}th`} INNINGS · {battingTeam.name} BATTING
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: 'white', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{stats.runs}</span>
              <span style={{ color: '#94a3b8', fontSize: '2.2rem', fontWeight: 700 }}>/{stats.wickets}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
              {stats.overs}.{stats.balls} overs &nbsp;·&nbsp; Extras: {stats.extras}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <StatPill label="Run Rate" value={rr} color="#f97316" />
            {runsNeeded != null && <StatPill label="Need" value={runsNeeded > 0 ? String(runsNeeded) : '🏆'} color={runsNeeded <= 0 ? '#22c55e' : '#e2e8f0'} />}
            {rrr && <StatPill label="Req. Rate" value={rrr} color={parseFloat(rrr) > 12 ? '#f43f5e' : '#22c55e'} />}
          </div>
        </div>
      </div>

      {/* Complete banner */}
      {isOver && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '0.65rem 1rem', marginBottom: '1rem', color: '#22c55e', fontWeight: 700, textAlign: 'center', fontSize: '0.875rem' }}>
          ✅ Innings Complete — tick &quot;Innings Complete&quot; and Save
        </div>
      )}

      {/* Player Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <PlayerSelect label="🏏 Striker (on strike)" value={striker} onChange={setStriker} players={battingTeam.players} color="#f97316" />
        <PlayerSelect label="🔄 Non-Striker" value={nonStriker} onChange={setNonStriker} players={battingTeam.players} color="#64748b" />
        <PlayerSelect label="🎯 Current Bowler" value={bowler} onChange={setBowler} players={bowlingTeam.players} color="#8b5cf6" />
      </div>

      {/* Current Over Tracker */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Over {stats.overs + 1} · {legalInCurrentOver}/6 balls
          </span>
          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
            {currentOverBalls.filter(isLegalBall).reduce((s, e) => s + e.runs + e.extraRuns, 0)} runs this over
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {currentOverBalls.map((e, i) => (
            <div key={i} style={{ width: 42, height: 42, borderRadius: '50%', background: bColor(e) + '20', border: `2px solid ${bColor(e)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: bColor(e), flexShrink: 0 }}>
              {bLabel(e)}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - legalInCurrentOver) }).map((_, i) => (
            <div key={`e${i}`} style={{ width: 42, height: 42, borderRadius: '50%', border: '2px dashed #1e293b', flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Scoring Pad */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>SCORE THIS BALL — TAP TO RECORD</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ScoreBtn label="0" bg="#1e293b" onClick={() => handleRuns(0)} />
          <ScoreBtn label="1" bg="#0f2744" onClick={() => handleRuns(1)} />
          <ScoreBtn label="2" bg="#0f2744" onClick={() => handleRuns(2)} />
          <ScoreBtn label="3" bg="#0f2744" onClick={() => handleRuns(3)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          <ScoreBtn label="FOUR" sub="4 Runs" bg="#052e16" color="#22c55e" onClick={() => handleRuns(4, true)} />
          <ScoreBtn label="SIX!" sub="6 Runs" bg="#2e1065" color="#a78bfa" onClick={() => handleRuns(6, false, true)} />
          <ScoreBtn label="WICKET" sub="Out!" bg="#450a0a" color="#f87171" onClick={() => { if (guard()) { setShowWicketModal(true); setExtrasPanel(null); } }} />
        </div>
      </div>

      {/* Extras */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em' }}>EXTRAS</span>
          <span style={{ color: '#334155', fontSize: '0.68rem' }}>Wide/NB = no ball counted · Bye/LB = ball counted</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {(['wide', 'noball', 'bye', 'legbye'] as const).map(type => {
            const labels: Record<string, string> = { wide: 'WIDE', noball: 'NO BALL', bye: 'BYE', legbye: 'LEG BYE' };
            const open = extrasPanel === type;
            return (
              <button key={type} onClick={() => setExtrasPanel(open ? null : type)} style={{
                background: open ? '#eab30818' : '#1e293b', color: open ? '#eab308' : '#94a3b8',
                border: `1px solid ${open ? '#eab30850' : '#334155'}`, borderRadius: 8,
                padding: '0.55rem 0.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem',
                transition: 'all 0.15s',
              }}>{labels[type]}</button>
            );
          })}
        </div>
        {extrasPanel && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
              {extrasPanel === 'wide' && 'Overthrows / penalty runs (1 penalty always added):'}
              {extrasPanel === 'noball' && 'Runs scored off no-ball (1 NB penalty always added):'}
              {extrasPanel === 'bye' && 'Bye runs (1 to 4 — counts as a legal ball):'}
              {extrasPanel === 'legbye' && 'Leg bye runs (1 to 4 — counts as a legal ball):'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[0, 1, 2, 3, 4].map(r => (
                <button key={r} onClick={() => handleExtra(extrasPanel, r)} style={{
                  background: '#1e293b', border: '1px solid #eab30840', borderRadius: 8,
                  color: '#eab308', padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                }}>+{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button onClick={undo} disabled={events.length === 0} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          background: events.length > 0 ? 'rgba(249,115,22,0.1)' : '#0a0f1a',
          border: `1px solid ${events.length > 0 ? 'rgba(249,115,22,0.3)' : '#1e293b'}`,
          borderRadius: 10, padding: '0.65rem', color: events.length > 0 ? '#f97316' : '#1e293b',
          cursor: events.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.875rem',
        }}>
          <RotateCcw size={15} /> Undo Last Ball
        </button>
        <button onClick={() => setShowHistory(!showHistory)} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '0.65rem',
          color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
        }}>
          {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />} History ({events.length})
        </button>
      </div>

      {/* Ball-by-Ball History */}
      {showHistory && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>📋 Ball-by-Ball History</div>
          {history.length === 0 ? (
            <div style={{ color: '#334155', textAlign: 'center', padding: '1rem', fontSize: '0.875rem' }}>No balls bowled yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 300, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem', background: '#0a0f1a', borderRadius: 8 }}>
                  <span style={{ color: '#334155', fontSize: '0.75rem', fontFamily: 'monospace', minWidth: 32 }}>{h.label}</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                  <span style={{ color: h.color, fontSize: '0.85rem', fontWeight: 600 }}>{h.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auto Bowler Selection Modal — appears after every completed over */}
      {showBowlerSelect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '2px solid #8b5cf660', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <h3 style={{ color: 'white', fontWeight: 800, margin: 0, fontSize: '1.2rem' }}>Over {stats.overs} Complete!</h3>
              <p style={{ color: '#64748b', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Select the bowler for Over {stats.overs + 1}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', maxHeight: 280, overflowY: 'auto' }}>
              {bowlingTeam.players.map(p => {
                const isDisallowed = p.id === prevBowler;
                return (
                  <button key={p.id} onClick={() => { if (!isDisallowed) { setBowler(p.id); setShowBowlerSelect(false); } }} style={{
                    background: isDisallowed ? '#0a0f1a' : '#1e293b',
                    border: `1px solid ${isDisallowed ? '#1e293b' : '#8b5cf640'}`,
                    borderRadius: 10, padding: '0.75rem 1rem', cursor: isDisallowed ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    opacity: isDisallowed ? 0.4 : 1,
                  }}>
                    <span style={{ color: isDisallowed ? '#334155' : 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                      {p.name}{p.role ? <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.78rem' }}> · {p.role}</span> : null}
                    </span>
                    {isDisallowed
                      ? <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>Prev. over</span>
                      : <span style={{ color: '#8b5cf6', fontSize: '0.78rem', fontWeight: 600 }}>Select →</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color, fontWeight: 900, fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#475569', fontSize: '0.68rem', marginTop: 2 }}>{label}</div>
    </div>
  );
}
