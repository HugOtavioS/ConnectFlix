'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Volume2, Volume1, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  autoPlay?: boolean;
  width?: string;
  height?: string;
  startTime?: number; // Tempo em segundos para começar o vídeo
  onPlayerReady?: (player: any) => void;
  fullscreen?: boolean; // Se deve iniciar em modo fullscreen
}

// Declaração global para YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({
  videoId,
  title = 'Video Player',
  autoPlay = false,
  width = '100%',
  height = '600px',
  startTime,
  onPlayerReady,
  fullscreen = false,
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiLoadedRef = useRef(false);

  // Função para inicializar o player
  const initializePlayer = useCallback(() => {
    const playerElementId = `youtube-player-${videoId}`;
    const playerElement = document.getElementById(playerElementId);
    
    if (!playerElement || !window.YT || !window.YT.Player) {
      return;
    }

    // Destruir player anterior se existir
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Erro ao destruir player anterior:', e);
      }
      playerRef.current = null;
    }

    // Criar novo player
    try {
      const playerVars: any = {
        autoplay: autoPlay ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        controls: 1,
        fs: 1,
        playsinline: 1,
        enablejsapi: 1,
      };

      // Adicionar startTime se fornecido
      if (startTime && startTime > 0) {
        playerVars.start = Math.floor(startTime);
      }

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: playerVars,
        events: {
          onReady: (event: any) => {
            // Se houver startTime, pular para esse tempo após o player estar pronto
            if (startTime && startTime > 0 && playerRef.current) {
              try {
                playerRef.current.seekTo(Math.floor(startTime), true);
              } catch (e) {
                console.error('Erro ao pular para tempo:', e);
              }
            }
            if (onPlayerReady) {
              onPlayerReady(event.target);
            }
          },
          onStateChange: (event: any) => {
            // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            setIsPlaying(event.data === 1);
          },
        },
      });
    } catch (error) {
      console.error('Erro ao inicializar player:', error);
    }
  }, [videoId, autoPlay, startTime, onPlayerReady]);

  // Carregar YouTube IFrame API
  useEffect(() => {
    if (apiLoadedRef.current) {
      // API já carregada, apenas inicializar o player
      setTimeout(() => initializePlayer(), 100);
      return;
    }

    // Verificar se a API já está carregada
    if (window.YT && window.YT.Player) {
      apiLoadedRef.current = true;
      setTimeout(() => initializePlayer(), 100);
      return;
    }

    // Carregar o script da API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Callback quando a API estiver pronta
    window.onYouTubeIframeAPIReady = () => {
      apiLoadedRef.current = true;
      setTimeout(() => initializePlayer(), 100);
    };
  }, [initializePlayer]);

  // Atualizar fullscreen quando a prop mudar
  useEffect(() => {
    setIsFullscreen(fullscreen);
    if (fullscreen && containerRef.current) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.error('Erro ao entrar em fullscreen:', err);
        });
      }
    } else if (!fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error('Erro ao sair de fullscreen:', err);
      });
    }
  }, [fullscreen]);

  // Cleanup: destruir player ao desmontar
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Erro ao destruir player no cleanup:', e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  const handleFullscreen = () => {
    const elem = containerRef.current;
    if (elem) {
      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div
      ref={containerRef}
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

      {/* YouTube Player Container */}
      <div
        id={`youtube-player-${videoId}`}
        className="w-full h-full"
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
