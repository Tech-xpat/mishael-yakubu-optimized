import YellowFolder from './YellowFolder';

interface Props {
  to: string;
  title: string;
  count: number;
  /** "project" / "design": pluralised automatically. */
  unit: string;
  /** Preview pictures of what is inside (the first two peek out of the folder). */
  thumbs?: string[];
}

/** A category folder: name, how many items it holds and a peek at what is inside. */
export default function CategoryCard({ to, title, count, unit, thumbs = [] }: Props) {
  return <YellowFolder to={to} title={title} count={count} unit={unit} thumbs={thumbs} />;
}
