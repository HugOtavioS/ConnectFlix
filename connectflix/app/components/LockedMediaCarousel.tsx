'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LockedMediaCarouselProps {
  lockedMedia: Array<{
    id: string;
    youtube_id: string;
    title: string;
    thumbnail?: string;
    rating?: number;
    views?: number;
  }>;
  title?: string;
  onMediaClick?: (mediaId: string, title: string) => void;
}

export default function LockedMediaCarousel({ 
  lockedMedia, 
  title = "Mídias Bloqueadas",
  onMediaClick
}: LockedMediaCarouselProps) {
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

  if (lockedMedia.length === 0) return null;

  return (
    <div className="relative group">
      {title && <h3 className="text-2xl sm:text-3xl font-bold mb-4 px-2">{title}</h3>}
      
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
            <div
              key={media.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] cursor-pointer group/card"
              onClick={() => onMediaClick?.(media.id, media.title)}
            >
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg aspect-video overflow-hidden">
                {/* Thumbnail com efeito bloqueado */}
                {media.thumbnail ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={media.thumbnail}
                      alt={media.title}
                      fill
                      className="object-cover blur-sm scale-110 opacity-40 group-hover/card:opacity-60 transition-opacity"
                    />
                    {/* Overlay escuro */}
                    <div className="absolute inset-0 bg-black/60 group-hover/card:bg-black/50 transition-colors" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                )}

                {/* Ícone de cadeado centralizado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-80 group-hover/card:opacity-100 transition-opacity">
                    <div className="bg-red-600/80 rounded-full p-3 backdrop-blur-sm">
                      <Lock size={32} className="text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <div className="bg-red-600 hover:bg-red-700 rounded-full p-3">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>

              {/* Media Info */}
              <div className="mt-3">
                <h4 className="text-white font-semibold line-clamp-2 group-hover/card:text-red-500 transition-colors">
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
