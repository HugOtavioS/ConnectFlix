'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Maximize2, Info } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtubeService';

interface CarouselHeroProps {
  videos: YouTubeVideo[];
  autoScroll?: boolean;
  scrollInterval?: number;
}

export default function CarouselHero({
  videos,
  autoScroll = true,
  scrollInterval = 5000,
}: CarouselHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);

  useEffect(() => {
    if (!isAutoScrolling || videos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, scrollInterval);

    return () => clearInterval(timer);
  }, [isAutoScrolling, videos.length, scrollInterval]);

  if (videos.length === 0) return null;

  const currentVideo = videos[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsAutoScrolling(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsAutoScrolling(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoScrolling(false);
  };

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl group">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentVideo.thumbnail}
            alt={currentVideo.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12 max-w-4xl">
          <div>
            {/* Badge */}
            <div className="mb-3">
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm font-bold">
                EM DESTAQUE
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 line-clamp-2">
              {currentVideo.title}
            </h2>

            {/* Description */}
            <p className="text-gray-200 text-sm sm:text-base mb-6 line-clamp-2 max-w-2xl">
              {currentVideo.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/player/${currentVideo.id}`}>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 rounded-lg font-bold transition-all duration-200 hover:scale-105">
                  <Play size={18} fill="white" />
                  Assistir
                </button>
              </Link>

              {/* More Info button */}
              <Link href={`/media/${currentVideo.id}`}>
                <button className="flex items-center gap-2 bg-gray-600/70 hover:bg-gray-600 text-white px-6 sm:px-8 py-2.5 rounded-lg font-bold transition-all duration-200 hover:scale-105 backdrop-blur">
                  <Info size={18} />
                  Mais Informações
                </button>
              </Link>

              {/* Fullscreen button - opens player in fullscreen */}
              <Link href={`/player/${currentVideo.id}?fullscreen=true`}>
                <button className="flex items-center gap-2 bg-gray-600/70 hover:bg-gray-600 text-white px-6 sm:px-8 py-2.5 rounded-lg font-bold transition-all duration-200 hover:scale-105 backdrop-blur">
                  <Maximize2 size={18} />
                  Tela Cheia
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
          aria-label="Vídeo anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
          aria-label="Próximo vídeo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnails Strip */}
      {videos.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative w-24 h-14 sm:w-32 sm:h-18 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-4 ring-red-600 scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-black/0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Dot Indicators */}
      {videos.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-red-600 w-8'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Ir para vídeo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
