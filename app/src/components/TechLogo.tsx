import { useCallback, useEffect, useRef, useState } from 'react';

const NAME = 'MISHAEL';
const NOISE = '01<>/\\#$%&*+=?';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The site wordmark, styled like a machine: it boots up by decoding random characters into the name,
 * re-scrambles on hover, glitches now and then (RGB split), and ends with a blinking terminal cursor.
 * Animations are skipped for visitors who prefer reduced motion.
 */
export default function TechLogo() {
  const [text, setText] = useState(NAME);
  const raf = useRef(0);

  const decode = useCallback((duration = 750) => {
    if (reduced()) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * NAME.length * 1.15);
      setText(
        NAME.split('')
          .map((c, i) => (i < settled ? c : NOISE[Math.floor(Math.random() * NOISE.length)]))
          .join('')
      );
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setText(NAME);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    decode(900); // boot-up
    return () => cancelAnimationFrame(raf.current);
  }, [decode]);

  return (
    <span
      className="tech-logo relative inline-flex items-center gap-2"
      aria-label="Mishael"
      onPointerEnter={() => decode(550)}
      onFocus={() => decode(550)}
    >
      <span className="tech-led" aria-hidden="true" />
      <span className="tech-word" data-text={text} aria-hidden="true">
        {text}
      </span>
      <span className="tech-cursor" aria-hidden="true" />
    </span>
  );
}
