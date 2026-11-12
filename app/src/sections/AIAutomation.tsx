import CategorySection from '../components/CategorySection';
import { HOME_SECTIONS } from '../lib/homeSections';

/** Home-page section fed by the admin's uploads (Supabase), grouped by subcategory. */
export default function AIAutomation() {
  return <CategorySection def={HOME_SECTIONS['ai-automation']} />;
}
