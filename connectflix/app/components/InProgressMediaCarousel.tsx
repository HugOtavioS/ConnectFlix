'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface InProgressMediaCarouselProps {
  inProgressMedia: Array<{
    id: string;
    youtube_id: string;
    title: string;
    thumbnail?: string;
    rating?: number;
    views?: number;
    progress?: number; // 0-100 percentage
  }>;
  title?: string;
  onMediaClick?: (mediaId: string, title: string) => void;
}

export default function InProgressMediaCarousel({ 
  inProgressMedia, 
  title = "Em Progresso de Desbloqueio",
  onMediaClick
}: InProgressMediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (inProgressMedia.length === 0) return null;

  return (
    <div className="relative group mb-8">
      <h3 className="text-2xl sm:text-3xl font-bold mb-4 px-2 flex items-center gap-2">
        {title}
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
      </h3>
      
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
          {inProgressMedia.map((media) => (
            <div
              key={media.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] cursor-pointer group/card"
              onClick={() => onMediaClick?.(media.id, media.title)}
            >
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg aspect-video overflow-hidden">
                {/* Thumbnail */}
                {media.thumbnail ? (
                  <Image
                    src={media.thumbnail}
                    alt={media.title}
                    fill
                    className="object-cover group-hover/card:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                )}

                {/* Overlay com progresso */}
                <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/30 transition-colors" />

                {/* Progress indicator */}
                {media.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="w-full h-1 bg-gray-700">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-300"
                        style={{ width: `${media.progress}%` }}
                      />
                    </div>
                    <div className="px-2 py-1 bg-black/70 backdrop-blur-sm text-xs text-amber-300 font-semibold">
                      {Math.round(media.progress)}% completo
                    </div>
                  </div>
                )}

                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <div className="bg-red-600 hover:bg-red-700 rounded-full p-3">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>

              {/* Media Info */}
              <div className="mt-3">
                <h4 className="text-white font-semibold line-clamp-2 group-hover/card:text-amber-400 transition-colors">
                  {media.title}
                </h4>
                {(media.rating || media.views) && (
                  <p className="text-sm text-gray-400 mt-1">
                    {media.rating && media.rating > 0 && `⭐ ${media.rating}`}
                    {media.rating && media.rating > 0 && media.views && ' • '}
                    {media.views && media.views > 0 && `${media.views}k views`}
                  </p>
                )}
              </div>
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
  );
}
