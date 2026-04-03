'use client';
export const dynamic = 'force-dynamic';
import { useAppContext } from '@/lib/context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Flame } from 'lucide-react';

export default function AdminLoginPage() {
  const { data, setIsAdminLoggedIn } = useAppContext();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // UX delay
    if (password === data.adminPassword) {
      setIsAdminLoggedIn(true);
      router.push('/admin');
    } else {
      setError('Incorrect password. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', background: '#030712'
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 20, padding: '2.5rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #f97316, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Flame size={28} color="white" />
          </div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Admin Panel</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>Enter your password to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569'
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  background: '#1e293b', border: `1px solid ${error ? '#f43f5e' : '#334155'}`,
                  borderRadius: 10, color: 'white', fontSize: '0.9rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? '#1e293b' : 'linear-gradient(135deg, #f97316, #ec4899)',
              border: 'none', borderRadius: 10, color: 'white',
              fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


      </div>
    </div>
  );
}
