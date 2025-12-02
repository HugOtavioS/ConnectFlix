'use client';

import { useState } from 'react';
import { Maximize, Volume2, Volume1, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  autoPlay?: boolean;
  width?: string;
  height?: string;
}

export default function VideoPlayer({
  videoId,
  title = 'Video Player',
  autoPlay = false,
  width = '100%',
  height = '600px',
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handleFullscreen = () => {
    const elem = document.getElementById('video-player-iframe') as HTMLIFrameElement;
    if (elem) {
      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    modestbranding: '1',
    rel: '0',
    controls: '1',
    fs: '1',
    playsinline: '1',
    enablejsapi: '1',
  })}`;

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={isFullscreen ? { width: '100vw', height: '100vh' } : { width, height }}
    >
      {/* Title Overlay */}
      {title && !isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
        </div>
      )}

      {/* YouTube Embed */}
      <iframe
        id="video-player-iframe"
        className="w-full h-full"
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{
          borderRadius: isFullscreen ? '0' : '8px',
        }}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 right-0 z-20 flex items-center gap-2 p-4 bg-gradient-to-l from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleFullscreen}
          className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          title={isFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
        >
          <Maximize size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
