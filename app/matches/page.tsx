'use client';
import { useAppContext } from '@/lib/context';
import { Sport } from '@/lib/types';
import { getTeamById } from '@/lib/store';
import { useState } from 'react';
import { Filter } from 'lucide-react';
import MatchCard from '@/components/MatchCard';

const SPORTS = ['all', 'cricket', 'volleyball', 'throwball'] as const;
const STATUSES = ['all', 'live', 'upcoming', 'completed'] as const;

export default function MatchesPage() {
  const { data } = useAppContext();
  const [sport, setSport] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const filtered = data.matches.filter(m => {
    if (sport !== 'all' && m.sport !== sport) return false;
    if (status !== 'all' && m.status !== status) return false;
    return true;
  }).sort((a, b) => {
    const order = { live: 0, upcoming: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="responsive-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-title-mobile" style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: '0 0 0.5rem' }}>All Matches</h1>
        <p className="text-subtitle-mobile" style={{ color: '#64748b', margin: 0 }}>Live scores, upcoming fixtures, and completed results</p>
      </div>

      {/* Filters */}
      <div className="p-responsive" style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16,
        padding: '1.25rem', marginBottom: '2rem',
        display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
          <Filter size={15} /> <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters:</span>
        </div>

        <FilterGroup label="Sport" options={SPORTS} value={sport} onChange={setSport} colors={{ cricket: '#f97316', volleyball: '#8b5cf6', throwball: '#ec4899' }} />
        <FilterGroup label="Status" options={STATUSES} value={status} onChange={setStatus} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#475569' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>🔍 No matches found</p>
          <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className="grid-auto-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(m => (
            <MatchCard key={m.id} match={m} data={data} href={`/matches/${m.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, value, onChange, colors }: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  colors?: Record<string, string>;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = value === opt;
          const color = (colors && colors[opt]) || '#3b82f6';
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize',
                background: active ? color + '15' : 'rgba(15,23,42,0.6)',
                color: active ? color : '#64748b',
                boxShadow: active ? `0 0 0 1px ${color}40` : '0 0 0 1px rgba(255,255,255,0.03)',
                transition: 'all 0.2s',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
