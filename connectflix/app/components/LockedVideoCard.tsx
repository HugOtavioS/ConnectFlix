'use client';

import { Lock } from 'lucide-react';
import Image from 'next/image';

interface LockedVideoCardProps {
  title: string;
  thumbnail?: string;
  rating?: number;
  views?: number;
  onClick?: () => void;
}

export default function LockedVideoCard({
  title,
  thumbnail,
  rating = 0,
  views = 0,
  onClick,
}: LockedVideoCardProps) {
  return (
    <div 
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg aspect-video overflow-hidden">
        {/* Thumbnail com blur */}
        {thumbnail ? (
          <div className="relative w-full h-full">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover blur-md scale-110 opacity-30"
            />
            {/* Overlay escuro */}
            <div className="absolute inset-0 bg-black/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Ícone de cadeado centralizado */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <Lock size={48} className="text-white" strokeWidth={2} />
            </div>
            <p className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
              Bloqueado
            </p>
          </div>
        </div>

        {/* Overlay adicional para mais blur */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Video Info */}
      <div className="mt-3">
        <h3 className="text-white font-semibold line-clamp-2 opacity-75">
          {title}
        </h3>
        {(rating > 0 || views > 0) && (
          <p className="text-sm text-gray-500 mt-1">
            {rating > 0 && `⭐ ${rating}`}
            {rating > 0 && views > 0 && ' • '}
            {views > 0 && `${views}k views`}
          </p>
        )}
      </div>
    </div>
  );
}

