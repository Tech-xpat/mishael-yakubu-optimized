/**
 * Skeleton UI building blocks. Every loading state on the site uses these:
 * no spinners, no dots, just the shape of the content that is about to appear.
 */

const bar = 'skeleton rounded';

/** Folder tiles of the home-page portfolio menu (same footprint as the real tiles). */
export function FolderGridSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center p-8"
        >
          <div className="w-[88px] h-[88px] rounded-2xl skeleton mb-4" />
          <div className={`h-4 w-3/4 ${bar}`} />
          <div className={`h-3 w-1/3 mt-3 ${bar}`} />
        </div>
      ))}
    </div>
  );
}

/** Card grid used by the database-driven category sections on the home page. */
export function CardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
      aria-label="Loading projects"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
          <div className={`h-5 w-2/3 ${bar}`} />
          <div className={`h-3.5 w-1/3 mt-3 ${bar}`} />
          <div className={`h-3.5 w-1/2 mt-6 ${bar}`} />
        </div>
      ))}
    </div>
  );
}

/** A whole home-page section while its code and data load. */
export function SectionSkeleton() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-black px-6 md:px-12 lg:px-20" aria-busy="true">
      <div className="mb-16">
        <div className={`h-3 w-24 mb-5 ${bar}`} />
        <div className={`h-10 md:h-14 w-3/4 max-w-xl mb-5 ${bar}`} />
        <div className={`h-4 w-full max-w-2xl ${bar}`} />
      </div>
      <CardGridSkeleton />
    </section>
  );
}

/** Gallery viewer (big preview, title, thumbnails). */
export function GallerySkeleton() {
  return (
    <div className="relative max-w-5xl mx-auto px-4" aria-busy="true" aria-label="Loading gallery">
      <div className="aspect-[16/10] md:aspect-video rounded-2xl overflow-hidden border border-white/10 relative">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className={`h-8 w-2/3 max-w-md ${bar}`} />
        <div className={`h-4 w-1/2 max-w-xs ${bar}`} />
      </div>
      <div className="mt-8 flex gap-3 justify-center overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-20 h-20 skeleton rounded-lg flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className="h-20 px-6 md:px-12 lg:px-20 flex items-center justify-between">
      <div className={`h-7 w-28 ${bar}`} />
      <div className="hidden md:flex items-center gap-10">
        {[56, 52, 72, 60].map((w, i) => (
          <div key={i} className={`h-3 ${bar}`} style={{ width: w }} />
        ))}
      </div>
      <div className="hidden md:block h-11 w-32 skeleton" />
      <div className="md:hidden h-7 w-7 skeleton rounded" />
    </div>
  );
}

/** Generic inner page (gallery / category / admin) while its code loads. */
export function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-black" aria-busy="true" role="status" aria-label="Loading page">
      <NavSkeleton />
      <div className="px-6 md:px-12 lg:px-20 pt-8">
        <div className={`h-3 w-24 mb-4 ${bar}`} />
        <div className={`h-10 md:h-14 w-2/3 max-w-xl mb-8 ${bar}`} />
      </div>
      <GallerySkeleton />
    </div>
  );
}

/**
 * Full-page loader for the home page. Mirrors the real layout (nav, hero,
 * about, portfolio menu) so the page "fills in" instead of popping in.
 */
export function SiteSkeleton({ hiding = false }: { hiding?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden bg-black transition-opacity duration-500 ease-out"
      style={{ opacity: hiding ? 0 : 1, pointerEvents: hiding ? 'none' : 'auto' }}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <NavSkeleton />

      <div className="flex flex-col items-center justify-center gap-6 px-6 h-[calc(100vh-14rem)] min-h-[320px]">
        <div className={`h-14 sm:h-20 md:h-28 w-[88%] max-w-4xl ${bar}`} />
        <div className={`h-3 w-3/4 max-w-xl ${bar}`} />
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="h-12 w-44 skeleton" />
          <div className="h-12 w-44 skeleton" />
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 grid grid-cols-2 gap-4 md:gap-6 opacity-60">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-3xl skeleton" />
        ))}
      </div>
    </div>
  );
}
