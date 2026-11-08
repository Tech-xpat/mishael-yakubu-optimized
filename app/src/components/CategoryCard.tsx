import { Link } from 'react-router-dom';

interface Props {
  to: string;
  title: string;
  count: number;
  /** "project" / "design": pluralised automatically. */
  unit: string;
  /** Preview pictures of what is inside (first three are shown). */
  thumbs?: string[];
}

/** A category tile: name, how many items it holds and a few previews of them. */
export default function CategoryCard({ to, title, count, unit, thumbs = [] }: Props) {
  const empty = count === 0;
  const shown = thumbs.filter(Boolean).slice(0, 3);
  const more = count - shown.length;

  return (
    <Link
      to={to}
      className={`group flex flex-col rounded-xl border p-5 transition-colors sm:p-6 ${
        empty
          ? 'border-white/10 bg-white/[0.02] opacity-70 hover:opacity-100'
          : 'border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10'
      }`}
    >
      {shown.length > 0 && (
        <div className="mb-4 flex items-center -space-x-3">
          {shown.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              className="h-12 w-12 rounded-lg border-2 border-black bg-white/10 object-cover"
            />
          ))}
          {more > 0 && (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-white/15 font-body text-xs font-semibold text-white">
              +{more}
            </span>
          )}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/50">
        {count} {unit}
        {count === 1 ? '' : 's'}
      </p>
      <p className="mt-4 text-sm text-white/70 transition-colors group-hover:text-white">
        {empty ? 'Nothing here yet' : 'View full list →'}
      </p>
    </Link>
  );
}
