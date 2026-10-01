'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Code2, Flame, Pause, Play, Trophy } from 'lucide-react';
import PhoenixScene from './PhoenixScene';
import PhoenixScene3D from './PhoenixScene3D';
import { journeyState } from './phoenixJourney.mjs';
import { clamp, phoenixTimeline } from './phoenixTimeline.mjs';
import styles from './PhoenixLanding.module.css';

const chapters = [
  { label: 'AMONG THE LEAVES', title: <>Let curiosity<br /><em>take flight.</em></>, body: 'A spark in a quiet studio. Follow the phoenix as it finds its way through the leaves.' },
  { label: 'A MOMENT TO WARM UP', title: <>Small rituals.<br /><em>Big possibilities.</em></>, body: 'A warm cup. A fresh idea. The little moments that keep you coming back.' },
  { label: 'A DIFFERENT PERSPECTIVE', title: <>See the work.<br /><em>From every angle.</em></>, body: 'Circle the studio with the phoenix. Behind every breakthrough is someone who kept trying.' },
  { label: 'INTO YOUR NEXT WORLD', title: <>Follow the spark.<br /><em>Find your arena.</em></>, body: 'One last flight toward the screen. A whole community waiting on the other side.' },
];

export default function PhoenixLanding() {
  const track = useRef(null);
  const root = useRef(null);
  const progress = useRef(0);
  const frozen = useRef(false);
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [rendererStatus, setRendererStatus] = useState('loading');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setMotion(!mq.matches); setReady(true); };
    update(); mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!motion) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      if (frozen.current) return;
      const rect = track.current.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      progress.current = p;
      const t = phoenixTimeline(p), journey = journeyState(p), el = root.current;
      el.style.setProperty('--flight', `translate(${t.x}px, ${t.y}px) rotate(${t.roll}deg) scale(${t.scale})`);
      el.style.setProperty('--bird-opacity', t.birdOpacity);
      el.style.setProperty('--back-opacity', 1 - t.front);
      el.style.setProperty('--front-opacity', t.front);
      el.style.setProperty('--zoom', 1 + t.zoom * 6);
      el.style.setProperty('--scene-opacity', 1 - journey.reveal);
      el.style.setProperty('--reveal', journey.reveal);
      el.style.setProperty('--glow', t.glow);
      el.style.setProperty('--progress', p);
      setStage(journey.stage);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [motion, paused]);

  function goToChapter(index) {
    if (!motion) return;
    frozen.current = false; setPaused(false);
    const position = [0, .36, .64, .87, 1][index];
    const rect = track.current.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + position * (rect.height - window.innerHeight), behavior: 'smooth' });
  }

  function togglePause() {
    frozen.current = !frozen.current;
    setPaused(frozen.current);
  }

  return <div ref={root} className={styles.landing} data-motion={motion} data-paused={paused} data-ready={ready} data-renderer={rendererStatus}>
    <div ref={track} className={styles.track}>
      <div className={styles.sticky}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="DETOX home"><Flame size={27} strokeWidth={1.3} /><span>DETOX<span className={styles.brandSuffix}> / KILN</span></span></Link>
          <span className={styles.headerNote}>A COMMUNITY FOR THE CURIOUS.</span>
          <Link href="/arena" className={styles.skip}>Enter Arena <ArrowUpRight size={16} /></Link>
        </header>
        <main id="phoenix-story" className={styles.main}>
          <h1 className={styles.srOnly}>From a spark to the DETOX Arena</h1>
          <div className={styles.editorial}>
            {chapters.map((chapter, i) => <section key={chapter.label} className={styles.chapter} data-active={motion ? stage === i : i === 0} aria-hidden={motion ? stage !== i : i !== 0}>
              <div className={styles.eyebrow}><span>0{i+1}</span> / {chapter.label}</div>
              <h2>{chapter.title}</h2>
              <p>{chapter.body}</p>
              {i === 0 && <div className={styles.smallNote}><span /> A DETOX COMMUNITY STORY</div>}
            </section>)}
          </div>
          <div className={styles.art}>
            <div className={styles.vectorFallback} aria-hidden={rendererStatus === 'ready'}><PhoenixScene /></div>
            <PhoenixScene3D progress={progress} paused={paused} enabled={motion} onStatus={setRendererStatus} />
            {motion && rendererStatus === 'fallback' && <span className={styles.rendererNote}>Illustrated mode · 3D is unavailable in this browser</span>}
          </div>
          <div className={styles.portal} aria-hidden="true" />
          <section className={styles.arrival} aria-hidden={motion && stage !== 4} inert={motion && stage !== 4}>
            <div className={styles.arrivalMark}><Flame size={37} strokeWidth={1} /></div>
            <div className={styles.eyebrow}>THE SPARK WAS ALWAYS YOURS.</div>
            <h2>Welcome to<br /><span>DETOX Arena.</span></h2>
            <p>A place to practice with purpose, take on the challenge,<br className={styles.desktopBreak} /> and grow alongside your people.</p>
            <Link href="/arena" className={styles.enter}>Enter the Arena <ArrowRight size={18} /></Link>
            <div className={styles.features}>
              <div><Code2 size={18} /><span>Sharpen your skills</span><small>One problem at a time.</small></div>
              <div><Trophy size={18} /><span>Find your challenge</span><small>Step into the competition.</small></div>
              <div><Flame size={18} /><span>Rise together</span><small>Keep the curiosity alive.</small></div>
            </div>
          </section>
        </main>
        <footer className={styles.controls}>
          <div className={styles.scrollCue}><ArrowDown size={15} /><span>{stage === 4 ? 'YOUR NEXT CHAPTER AWAITS' : 'SCROLL TO FOLLOW THE SPARK'}</span></div>
          <nav className={styles.chapterNav} aria-label="Story chapters">{['Tree', 'Coffee', 'Orbit', 'Laptop', 'Arena'].map((label, i) => <button key={label} onClick={() => goToChapter(i)} aria-label={`Go to ${label.toLowerCase()} chapter`} aria-current={stage === i ? 'step' : undefined}><span className={styles.dot} /><span>{label}</span></button>)}</nav>
          {motion && <button className={styles.pause} onClick={togglePause} aria-pressed={paused} aria-label={paused ? 'Resume story animation' : 'Pause story animation'}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Resume' : 'Pause motion'}</span></button>}
        </footer>
        <div className={styles.progress} aria-hidden="true" />
      </div>
    </div>
  </div>;
}
