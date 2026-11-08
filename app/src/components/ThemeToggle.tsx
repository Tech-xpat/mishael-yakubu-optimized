import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { setTheme, useTheme } from '../lib/theme';
import { setMuted, useSoundOn } from '../lib/sound';

const iconBtn =
  'key-btn-outline relative inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer';

/** Light / dark switch for the navbar. */
export function ThemeToggle() {
  const theme = useTheme();
  const toLight = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(toLight ? 'light' : 'dark')}
      className={iconBtn}
      aria-label={toLight ? 'Switch to light theme' : 'Switch to dark theme'}
      title={toLight ? 'Light theme' : 'Dark theme'}
    >
      <Sun
        size={18}
        className={`absolute transition-all duration-500 ${
          toLight ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'
        }`}
      />
      <Moon
        size={18}
        className={`absolute transition-all duration-500 ${
          toLight ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </button>
  );
}

/** Mute / unmute the faint button sounds. */
export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      onClick={() => setMuted(on)}
      className={iconBtn}
      aria-label={on ? 'Mute button sounds' : 'Unmute button sounds'}
      aria-pressed={on}
      title={on ? 'Sound on' : 'Sound off'}
    >
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
