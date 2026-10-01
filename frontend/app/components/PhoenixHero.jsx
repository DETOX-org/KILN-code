'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Code2, Flame, Pause, Play, Trophy } from 'lucide-react';
import styles from './PhoenixHero.module.css';

const chapters = [
  { number: '01', title: 'Find your spark.', text: 'One problem. One new idea. Build the habit that makes the difference.', Icon: Code2 },
  { number: '02', title: 'Enter the arena.', text: 'Put your thinking to the test. Take on a challenge with your community.', Icon: Trophy },
  { number: '03', title: 'Rise. Repeat.', text: 'Learn from every attempt. Come back sharper for the next one.', Icon: Flame },
];

export default function PhoenixHero({ onPractice, onCompete }) {
  const root = useRef(null);
  const video = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReduced(preference.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    const section = root.current;
    const cards = section.querySelectorAll('[data-chapter]');
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === section) setVisible(entry.isIntersecting);
          else if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      observer.observe(section);
      cards.forEach((card) => {
        card.classList.add(styles.pending);
        observer.observe(card);
      });
    } else setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  const moving = !paused && !reduced && visible && pageVisible && !blocked && !failed;
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    let cancelled = false;
    if (moving) player.play().catch(() => { if (!cancelled) setBlocked(true); });
    else player.pause();
    return () => { cancelled = true; };
  }, [moving]);

  function toggleMotion() {
    if (blocked) {
      // Retry directly in the click gesture when browser autoplay was blocked.
      video.current?.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else setPaused((value) => !value);
  }

  return (
    <section ref={root} className={styles.experience} data-moving={moving} aria-labelledby="phoenix-heading">
      <div className={styles.hero}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.copy}>
          <div className={styles.eyebrow}><span /> THE DETOX CODING COMMUNITY</div>
          <h1 id="phoenix-heading" className={styles.title}>Built in fire.<br /><span>Ready to rise.</span></h1>
          <p className={styles.description}>Every great coder starts with a spark. Turn yours into progress through daily practice, shared challenges, and a community that keeps you going.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onPractice}>Take today’s challenge <ArrowRight size={17} /></button>
            <button type="button" className={styles.secondary} onClick={onCompete}>Explore the arena <ArrowUpRight size={17} /></button>
          </div>
          <div className={styles.signature}><span className={styles.line} /> PRACTICE. COMPETE. RISE.</div>
        </div>
        <div className={styles.visual}>
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.orbit} aria-hidden="true"><span /></div>
          <div className={styles.media}>
            <img className={styles.poster} src="/phoenix/phoenix-poster.jpg" alt="Golden and blue phoenix with its wings spread" width="1280" height="720" />
            {!reduced && !failed && <video ref={video} className={styles.video} src="/phoenix/phoenix-hero.mp4" poster="/phoenix/phoenix-poster.jpg" width="1280" height="720" muted loop playsInline preload="none" aria-hidden="true" onError={() => setFailed(true)} />}
          </div>
          <div className={styles.embers} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
          <span className={styles.artLabel}>THE SPIRIT OF KILN <span>↗</span></span>
          {!reduced && !failed && <button type="button" className={styles.motionToggle} onClick={toggleMotion} aria-label={paused || blocked ? 'Play phoenix animation' : 'Pause phoenix animation'}>{paused || blocked ? <Play size={13} /> : <Pause size={13} />}<span>{paused || blocked ? 'Play motion' : 'Pause motion'}</span></button>}
        </div>
        <div className={styles.bottomLine}><span>A LITTLE BETTER, EVERY DAY.</span><span>YOUR NEXT CHAPTER STARTS HERE <ArrowRight size={13} /></span></div>
      </div>
      <div className={styles.chapters}>
        {chapters.map(({ number, title, text, Icon }, index) => <article key={number} data-chapter className={styles.chapter} style={{ '--delay': `${index * 110}ms` }}>
          <div className={styles.chapterTop}><span>{number} / THE JOURNEY</span><Icon size={19} strokeWidth={1.5} /></div>
          <h2>{title}</h2><p>{text}</p>
        </article>)}
      </div>
    </section>
  );
}
