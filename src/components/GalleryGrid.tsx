import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import Lightbox from './Lightbox';

interface GalleryItem {
  id: string;
  url: string;
  title?: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
  columns?: number;
}

const GalleryGrid = ({ items, columns = 3 }: GalleryGridProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-3';

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/50">No images yet. Start uploading!</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleImageClick(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all"
          >
            <img
              src={item.url}
              alt={item.title || 'Gallery image'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn size={32} className="text-white/0 group-hover:text-white/70 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={items.map((item) => item.url)}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default GalleryGrid;
