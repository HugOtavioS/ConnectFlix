'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import VideoPlayer from '@/app/components/VideoPlayer';
import {
  getVideoDetails,
  formatViewCount,
  formatDuration,
  YouTubeVideo,
} from '@/lib/youtubeService';
import apiService from '@/lib/apiService';
import {
  Heart,
  Share2,
  Download,
  MoreVertical,
  AlertCircle,
  X,
} from 'lucide-react';

export default function PlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const isFullscreen = searchParams.get('fullscreen') === 'true';

  const [videoDetails, setVideoDetails] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(isFullscreen);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main video details
        const details = await getVideoDetails(videoId);
        setVideoDetails(details);

        // Registrar atividade de visualização se autenticado
        if (apiService.isAuthenticated()) {
          try {
            await apiService.logActivity({
              media_id: videoId,
              activity_type: 'watch',
              duration_seconds: 0,
            });
          } catch (error) {
            console.log('Atividade não registrada');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar vídeo:', err);
        setError(
          'Erro ao carregar o vídeo. Verifique se a chave da API do YouTube está configurada corretamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  // Fullscreen mode view
  if (fullscreenMode && videoDetails) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Close button */}
        <button
          onClick={() => setFullscreenMode(false)}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        {/* Fullscreen player */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full">
            <VideoPlayer videoId={videoId} title={videoDetails.title} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-400">Carregando vídeo...</p>
            </div>
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
          <Navigation />
        <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
              <p className="text-red-500 font-semibold mb-2">Erro ao carregar vídeo</p>
              <p className="text-gray-400">{error || 'Vídeo não encontrado'}</p>
            </div>
          </div>
        </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Player Section - Full Width */}
        <div className="space-y-6">
          {/* Video Player */}
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <VideoPlayer videoId={videoId} title={videoDetails?.title} />
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            {/* Title and Channel */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{videoDetails.title}</h1>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{videoDetails.channelTitle}</p>
                  <p className="text-gray-500 text-xs">
                    Publicado em {new Date(videoDetails.publishedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Subscribe Button */}
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                  Inscrever-se
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 py-4 border-y border-gray-700">
              {videoDetails.viewCount && (
                <div>
                  <p className="text-xs text-gray-400">Visualizações</p>
                  <p className="text-lg font-semibold">
                    {formatViewCount(videoDetails.viewCount)}
                  </p>
                </div>
              )}

              {videoDetails.duration && (
                <div>
                  <p className="text-xs text-gray-400">Duração</p>
                  <p className="text-lg font-semibold">
                    {formatDuration(videoDetails.duration)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400">Qualidade</p>
                <p className="text-lg font-semibold">Full HD</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isLiked
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                {isLiked ? 'Favoritado' : 'Favoritar'}
              </button>

              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                <Share2 size={20} />
                Compartilhar
              </button>

              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                <Download size={20} />
                Baixar
              </button>

              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-300 text-sm line-clamp-3 whitespace-pre-wrap">
                {videoDetails.description}
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
