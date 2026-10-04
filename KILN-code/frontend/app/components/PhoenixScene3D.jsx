'use client';
import { useEffect, useRef } from 'react';
import styles from './PhoenixLanding.module.css';

export default function PhoenixScene3D({ progress, paused, enabled, onStatus }) {
  const host = useRef(null);
  const pausedRef = useRef(paused);
  const controller = useRef(null);
  useEffect(() => { pausedRef.current = paused; controller.current?.refresh(); }, [paused]);
  useEffect(() => {
    if (!enabled) { onStatus('static'); return; }
    let cancelled = false;
    onStatus('loading');
    import('./phoenixWorld.mjs').then(({ mountPhoenixWorld }) => {
      if (cancelled || !host.current) return;
      try {
        controller.current = mountPhoenixWorld(host.current, () => progress.current,
          () => pausedRef.current, () => { if (!cancelled) onStatus('fallback'); });
        onStatus('ready');
      } catch { onStatus('fallback'); }
    }).catch(() => { if (!cancelled) onStatus('fallback'); });
    return () => { cancelled = true; controller.current?.dispose(); controller.current = null; };
  }, [enabled, progress, onStatus]);
  return <div ref={host} className={styles.webglStage} role="img" aria-label="A three-dimensional studio: a phoenix circles a leafy tree, flies past steaming coffee, orbits a coder at their desk, and enters the laptop." />;
}
