'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Trophy, LayoutDashboard, Calendar, BarChart3,
  ShieldCheck, Menu, X, Flame
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        background: 'rgba(3,7,18,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Flame size={20} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>GM</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f97316' }}> League</span>
              <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1, marginTop: -2 }}>2026 · S3 · Sports Championship</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: '0.25rem' }} className="hidden-mobile">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 0.85rem', borderRadius: 8,
                    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                    transition: 'all 0.2s',
                    background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
                    color: active ? '#f97316' : '#94a3b8',
                    border: active ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: '0.5rem', display: 'none'
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            padding: '0.75rem 0 1rem 0',
            borderTop: '1px solid #1e293b',
            display: 'flex', flexDirection: 'column', gap: '0.25rem'
          }}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.6rem 0.75rem', borderRadius: 8,
                    textDecoration: 'none', fontSize: '0.9rem',
                    background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: active ? '#f97316' : '#94a3b8',
                  }}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
