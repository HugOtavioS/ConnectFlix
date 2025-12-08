'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import VideoPlayer from '@/app/components/VideoPlayer';
import { getVideoDetails, YouTubeVideo } from '@/lib/youtubeService';
import apiService from '@/lib/apiService';
import { useVideoTracking } from '@/lib/hooks/useVideoTracking';
import { Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const fullscreen = searchParams.get('fullscreen') === 'true';

  const [videoDetails, setVideoDetails] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);

  // Hook de tracking de vídeo
  const { initializeTracking, stopTracking } = useVideoTracking({
    videoId: videoId,
    mediaId: mediaId || undefined,
    enabled: apiService.isAuthenticated() && !!mediaId,
    intervalSeconds: 5,
  });

  const handlePlayerReady = (player: any) => {
    if (apiService.isAuthenticated() && mediaId) {
      initializeTracking(player);
    }
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main video details from YouTube
        const details = await getVideoDetails(videoId);
        setVideoDetails(details);

        // Buscar ou criar mídia no banco de dados
        if (apiService.isAuthenticated()) {
          try {
            const mediaResponse = await apiService.findOrCreateMediaByYoutubeId({
              youtube_id: videoId,
              title: details.title,
              description: details.description,
              poster_url: details.thumbnail,
              type: 'movie',
            });

            if (mediaResponse.media && mediaResponse.media.id) {
              const foundMediaId = mediaResponse.media.id.toString();
              setMediaId(foundMediaId);

              // Buscar última atividade de watch
              try {
                const lastWatch = await apiService.getLastWatch(foundMediaId);
                if (lastWatch && lastWatch.duration_seconds > 0) {
                  setStartTime(lastWatch.duration_seconds);
                }
              } catch (err) {
                console.log('Nenhuma atividade anterior encontrada');
              }
            }
          } catch (err) {
            console.error('Erro ao buscar/criar mídia:', err);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar vídeo:', err);
        setError('Erro ao carregar o vídeo.');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    }

    return () => {
      stopTracking();
    };
  }, [videoId, stopTracking]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          {!fullscreen && <Navigation />}
          <main className={fullscreen ? 'h-screen' : 'pt-20'}>
            <div className="flex items-center justify-center h-screen">
              <Loader size={48} className="animate-spin text-red-600" />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !videoDetails) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          {!fullscreen && <Navigation />}
          <main className={fullscreen ? 'h-screen' : 'pt-20 max-w-7xl mx-auto px-4 py-12'}>
            <div className="text-center">
              <p className="text-red-500 font-semibold">{error || 'Vídeo não encontrado'}</p>
              {!fullscreen && (
                <Link href="/home" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
                  Voltar para Home
                </Link>
              )}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-black text-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {!fullscreen && <Navigation />}
        
        <main className={fullscreen ? 'h-screen flex flex-col' : 'pt-16'}>
          {!fullscreen && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Link
                href={`/media/${videoId}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={20} />
                Voltar para detalhes
              </Link>
            </div>
          )}

          <div className={fullscreen ? 'flex-1 flex items-center justify-center' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8'}>
            <div className={`w-full ${fullscreen ? 'h-full' : 'aspect-video'}`}>
              <VideoPlayer
                videoId={videoId}
                startTime={startTime}
                onPlayerReady={handlePlayerReady}
                autoplay={fullscreen}
                fullscreen={fullscreen}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="pt-20">
            <div className="flex items-center justify-center h-screen">
              <Loader size={48} className="animate-spin text-red-600" />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    }>
      <PlayerContent />
    </Suspense>
  );
}
