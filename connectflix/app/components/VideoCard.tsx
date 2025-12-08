'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtubeService';

interface VideoCardProps {
  video: YouTubeVideo;
  showPlayButton?: boolean;
  viewCount?: boolean;
}

export default function VideoCard({
  video,
  showPlayButton = true,
  viewCount = false,
}: VideoCardProps) {
  return (
    <Link href={`/media/${video.id}`}>
      <div className="group cursor-pointer">
        <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg aspect-video overflow-hidden">
          {/* Thumbnail */}
          <div className="relative w-full h-full">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

            {/* Play Button */}
            {showPlayButton && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play size={24} className="text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Channel Badge */}
            <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              VÍDEO
            </div>

            {/* View Count */}
            {viewCount && video.viewCount && (
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {parseInt(video.viewCount) > 1000000
                  ? (parseInt(video.viewCount) / 1000000).toFixed(1) + 'M'
                  : parseInt(video.viewCount) > 1000
                    ? (parseInt(video.viewCount) / 1000).toFixed(1) + 'K'
                    : video.viewCount}
                {' visualizações'}
              </div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="mt-3 space-y-2">
          <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
            {video.title}
          </h3>

          <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors">
            {video.channelTitle}
          </p>

          {/* Description Preview */}
          <p className="text-gray-500 text-xs line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
