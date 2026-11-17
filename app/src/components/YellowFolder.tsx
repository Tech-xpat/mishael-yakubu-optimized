import { Link, type LinkProps } from 'react-router-dom';
import { Folder, Play } from 'lucide-react';

interface Props extends Omit<LinkProps, 'className' | 'children'> {
  title: string;
  count: number;
  /** "project" / "item" ... pluralised automatically. */
  unit?: string;
  /** Show a play symbol (videos) instead of the folder symbol. */
  play?: boolean;
  /** Preview pictures: the first two peek out of the folder like papers. */
  thumbs?: string[];
}

/** A classic yellow computer folder: tab, papers inside and a front flap that opens on hover. */
export default function YellowFolder({ title, count, unit = 'item', play, thumbs = [], ...link }: Props) {
  const empty = count === 0;
  const Icon = play ? Play : Folder;
  const pics = thumbs.filter(Boolean).slice(0, 2);

  return (
    <Link {...link} className={`yf group block outline-none ${empty ? 'yf-empty' : ''}`} aria-label={`${title}, ${count} ${unit}${count === 1 ? '' : 's'}`}>
      <div className="yf-body relative w-full" style={{ aspectRatio: '1.18' }}>
        {/* back panel + tab */}
        <span className="yf-tab absolute left-0 top-0 h-[16%] w-[44%]" aria-hidden="true" />
        <span className="yf-back absolute inset-x-0 bottom-0 top-[9%]" aria-hidden="true" />

        {/* papers */}
        <span className="yf-sheet yf-sheet-1 absolute overflow-hidden" aria-hidden="true">
          {pics[1] && <img src={pics[1]} alt="" loading="lazy" decoding="async" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} className="h-full w-full object-cover" />}
        </span>
        <span className="yf-sheet yf-sheet-2 absolute overflow-hidden" aria-hidden="true">
          {pics[0] && <img src={pics[0]} alt="" loading="lazy" decoding="async" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} className="h-full w-full object-cover" />}
        </span>

        {/* front flap with the label */}
        <span className="yf-front absolute inset-x-0 bottom-0 top-[30%] flex flex-col items-center justify-center px-2 text-center">
          <Icon size={22} strokeWidth={2} fill={play ? 'currentColor' : 'none'} className="mb-1 opacity-70" aria-hidden="true" />
          <span className="font-display text-base font-bold leading-tight sm:text-xl">{title}</span>
          <span className="mt-0.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70 sm:text-xs">
            {empty ? 'Empty' : `${count} ${unit}${count === 1 ? '' : 's'}`}
          </span>
        </span>
      </div>
    </Link>
  );
}
