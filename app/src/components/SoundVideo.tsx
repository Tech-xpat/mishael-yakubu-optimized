import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const PREF = 'video-sound'; // "off" once the visitor has turned sound off
const SEEN = 'hint:video-mute';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

/**
 * Gallery video with sound ON by default. A small label says so (and how to turn it off) the first time.
 * If the browser refuses to start with sound, it plays silently and the label invites a tap for sound.
 */
export default function SoundVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(() => read(PREF) === 'off');
  const [blocked, setBlocked] = useState(false);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = read(PREF) === 'off';
    const started = v.play();
    if (started && typeof started.then === 'function') {
      started
        .then(() => {
          if (!v.muted && !read(SEEN)) {
            write(SEEN, '1');
            setTip(true);
          }
        })
        .catch(() => {
          // Sound-on autoplay was refused: start silently and invite a tap.
          v.muted = true;
          setMuted(true);
          setBlocked(true);
          v.play().catch(() => undefined);
        });
    }
  }, []);

  useEffect(() => {
    if (!tip) return;
    const t = window.setTimeout(() => setTip(false), 5000);
    return () => window.clearTimeout(t);
  }, [tip]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = ref.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    setBlocked(false);
    setTip(false);
    write(PREF, next ? 'off' : 'on');
    if (!next) v.play().catch(() => undefined);
  };

  const text = muted ? (blocked ? 'Tap for sound' : 'Sound off') : tip ? 'Sound on · tap to mute' : 'Sound on';

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        key={src}
        src={src}
        controls
        loop
        playsInline
        preload="auto"
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className="h-full w-full object-contain"
      />
      <button
        type="button"
        data-no-press
        onClick={toggle}
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        className={`absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm transition-opacity duration-500 ${
          blocked || tip ? 'opacity-100' : 'opacity-60 hover:opacity-100'
        } ${blocked ? 'animate-pulse' : ''}`}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span>{text}</span>
      </button>
    </div>
  );
}
