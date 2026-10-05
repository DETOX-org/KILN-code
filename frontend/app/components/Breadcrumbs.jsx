import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 0 16px',
        fontSize: '12px',
        color: 'var(--ink-muted)',
        fontFamily: 'var(--font-mono)'
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--ink-muted)',
          textDecoration: 'none',
          transition: 'color 0.15s ease'
        }}
      >
        <Home size={13} />
        <span>KILN</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChevronRight size={12} color="var(--line-strong)" />
            {isLast || !item.href ? (
              <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{
                  color: 'var(--ink-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
