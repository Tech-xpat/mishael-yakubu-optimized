import { lazy, Suspense } from 'react';
import Collapsible from './Collapsible';
import FirebaseGate from './FirebaseGate';

const AdminWebDevelopment = lazy(() => import('./AdminWebDevelopment'));
const AdminBrandDesign = lazy(() => import('./AdminBrandDesign'));
const AdminAIAutomation = lazy(() => import('./AdminAIAutomation'));

const Where = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/60">{children}</p>
);

/**
 * Admin for the three sections that sit under Portfolio on the home page. They are separate from the
 * portfolio library above, which is why empty cards there could not be filled from "Upload to category".
 */
export default function HomeSectionsAdmin() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">
        These are the sections under <strong className="text-white">Portfolio</strong> on the home page. Every card
        or folder you see there, including the empty ones folded away at the bottom of each section, is filled from
        here.
      </p>
      <FirebaseGate>
        <Suspense fallback={<div className="skeleton h-24 rounded-xl" />}>
          <Collapsible title="Web Development section" storageKey="home:web" lazyMount>
            <Where>
              Home page, "Web Development" section. Pick the subcategory (Church Website, E-Commerce...) when adding
              and the project appears in that folder. Empty folders are listed in the dropdown too.
            </Where>
            <AdminWebDevelopment />
          </Collapsible>
          <div className="h-3" />
          <Collapsible title="Brand Design section" storageKey="home:brand" lazyMount>
            <Where>Home page, "Brand Design" section. Pick the subcategory when adding.</Where>
            <AdminBrandDesign />
          </Collapsible>
          <div className="h-3" />
          <Collapsible title="AI Automation section" storageKey="home:ai" lazyMount>
            <Where>Home page, "AI Automation" section.</Where>
            <AdminAIAutomation />
          </Collapsible>
        </Suspense>
      </FirebaseGate>
    </div>
  );
}
