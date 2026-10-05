import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer style={{
      background: 'var(--bg-deep)',
      borderTop: '1px solid var(--line-subtle)',
      padding: '20px 0',
      marginTop: 'auto',
      fontSize: '12px',
      color: 'var(--ink-muted)',
      fontFamily: 'var(--font-mono)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>DETOX Code Engine</span> · Multi-Cluster Dual-Engine Sandbox (Judge0 &amp; Piston)
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>WCAG 2.1 AA Compliant</span>
          <span>•</span>
          <span>Server-Authoritative NTP Clock</span>
          <span>•</span>
          <span>AST Structural Diff</span>
          <span>•</span>
          <Link href="/admin/dashboard" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Admin Console</Link>
        </div>
      </div>
    </footer>
  );
}
