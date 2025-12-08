'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LockedVideoCard from './LockedVideoCard';
import UnlockRequirementsModal from './UnlockRequirementsModal';

interface LockedMedia {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail?: string;
  rating?: number;
  views?: number;
}

interface LockedVideosCarouselProps {
  lockedMedia: LockedMedia[];
  title?: string;
}

export default function LockedVideosCarousel({ lockedMedia, title }: LockedVideosCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedLockedMedia, setSelectedLockedMedia] = useState<{ id: string; title: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleLockedVideoClick = (media: LockedMedia) => {
    setSelectedLockedMedia({
      id: media.id,
      title: media.title,
    });
    setIsModalOpen(true);
  };

  if (lockedMedia.length === 0) return null;

  return (
    <>
      <div className="relative group">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-2">{title}</h2>
        )}
        
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-2 pb-4 hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {lockedMedia.map((media) => (
              <div key={media.id} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                <LockedVideoCard
                  title={media.title}
                  thumbnail={media.thumbnail}
                  rating={media.rating}
                  views={media.views}
                  onClick={() => handleLockedVideoClick(media)}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg"
            aria-label="Rolar para direita"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Unlock Requirements Modal */}
      {selectedLockedMedia && (
        <UnlockRequirementsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLockedMedia(null);
          }}
          mediaId={selectedLockedMedia.id}
          mediaTitle={selectedLockedMedia.title}
          onUnlocked={() => {
            // Recarregar página após desbloqueio
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

