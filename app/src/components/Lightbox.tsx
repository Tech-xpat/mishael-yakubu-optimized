import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  onClose?: () => void;
}

const Lightbox = ({ images, initialIndex = 0, onClose }: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [arrowsVisible, setArrowsVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showArrows = () => {
    setArrowsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setArrowsVisible(false), 4000);
  };

  useEffect(() => {
    showArrows();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    showArrows();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    showArrows();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      onMouseMove={showArrows}
      onTouchStart={showArrows}
      tabIndex={0}
    >
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={24} className="text-white" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className={`absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-opacity duration-500 ${
                arrowsVisible ? 'opacity-[0.35] hover:opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-label="Previous"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className={`absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-opacity duration-500 ${
                arrowsVisible ? 'opacity-[0.35] hover:opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-label="Next"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
