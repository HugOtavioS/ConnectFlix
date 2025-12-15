'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Check, Play, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import apiService from '@/lib/apiService';
import { getVideoDetails, searchYouTubeVideos, YouTubeVideo } from '@/lib/youtubeService';

interface UnlockRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: string;
  mediaTitle: string;
  genre?: string;
  onUnlocked?: () => void;
}

export default function UnlockRequirementsModal({
  isOpen,
  onClose,
  mediaId,
  mediaTitle,
  genre,
  onUnlocked,
}: UnlockRequirementsModalProps) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMet, setAllMet] = useState(false);
  const [targetMedia, setTargetMedia] = useState<any>(null);
  const [youtubeDetails, setYoutubeDetails] = useState<Map<string, YouTubeVideo>>(new Map());

  useEffect(() => {
    if (isOpen && mediaId) {
      loadRequirements();
    }
  }, [isOpen, mediaId]);
  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUnlockRequirements(mediaId);
      setTargetMedia(data.target_media);

      // Build list of youtube videos on the frontend by querying YouTube (2-4 vídeos)
      let youtubeVideos: YouTubeVideo[] = [];
      
      // Usar o gênero passado como prop, ou categoria do backend se disponível
      const searchGenre = genre || (data.categories?.[0]?.name);
      
      if (searchGenre) {
        // Mapa de gêneros para termos de busca
        const genreSearchTerms: { [key: string]: string } = {
          'Ação': 'filmes de ação completos',
          'Comédia': 'filmes de comédia completos',
          'Drama': 'filmes de drama completos',
          'Terror': 'filmes de terror completos',
          'Romance': 'filmes de romance completos',
          'Ficção Científica': 'filmes de ficção científica completos',
          'Animação': 'filmes de animação completos',
          'Documentário': 'documentários completos',
          'Suspense': 'filmes de suspense completos',
          'Faroeste': 'filmes de faroeste completos',
          'Musical': 'filmes musicais completos',
          'Super-Herói': 'filmes de super-herói completos',
        };

        const query = genreSearchTerms[searchGenre] || `${searchGenre} filmes completos`;
        const videosPerCategory = 4; // Buscar 4 vídeos
        
        try {
          youtubeVideos = await searchYouTubeVideos({
            query,
            maxResults: videosPerCategory,
            order: 'viewCount',
            videoDuration: 'long',
          });
          console.log(`✅ Encontrados ${youtubeVideos.length} vídeos para o gênero "${searchGenre}"`);
        } catch (err) {
          console.error(`Erro buscando vídeos do YouTube para gênero ${searchGenre}:`, err);
        }
      } else {
        // Se não tiver gênero, buscar vídeos populares gerais
        try {
          youtubeVideos = await searchYouTubeVideos({
            query: 'filmes completos',
            maxResults: 4,
            order: 'viewCount',
            videoDuration: 'long',
          });
        } catch (err) {
          console.error('Erro buscando vídeos padrão:', err);
        }
      }

      // Remover duplicatas por id e limitar a 4
      const uniqueMap = new Map<string, YouTubeVideo>();
      for (const v of youtubeVideos) {
        if (v && v.id && !uniqueMap.has(v.id)) {
          uniqueMap.set(v.id, v);
        }
      }
      const uniqueVideos = Array.from(uniqueMap.values()).slice(0, 4);

      // Watched ids recebidos do backend
      const watchedIds: string[] = data.watched_youtube_ids || [];

      // Mapear requisitos
      const reqs = uniqueVideos.map((video) => ({
        youtube_id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        channel_title: video.channelTitle || '',
        is_watched: watchedIds.includes(video.id),
      }));

      setRequirements(reqs);
      setAllMet(reqs.length > 0 ? reqs.every((r) => r.is_watched) : false);
      const detailsMap = new Map<string, YouTubeVideo>();
      for (const v of uniqueVideos) {
        if (v) detailsMap.set(v.id, v);
      }
      setYoutubeDetails(detailsMap);
    } catch (error) {
      console.error('Erro ao carregar requisitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUnlock = async () => {
    try {
      const requiredYoutubeIds = requirements.map((r) => r.youtube_id).filter(Boolean);
      const result = await apiService.checkAndUnlockMedia(mediaId, requiredYoutubeIds);
      if (result.unlocked) {
        setAllMet(true);
        if (onUnlocked) {
          onUnlocked();
        }
        // Fechar modal após 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar desbloqueio:', error);
    }
  };

  if (!isOpen) return null;

  const watchedCount = requirements.filter((r) => r.is_watched).length;
  const totalCount = requirements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Desbloquear: {mediaTitle}</h2>
            <p className="text-gray-400 text-sm">
              Assista {totalCount} {totalCount === 1 ? 'vídeo' : 'vídeos'} para desbloquear este conteúdo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm font-semibold">
                {watchedCount} / {totalCount} assistidos
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${(watchedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader size={48} className="animate-spin text-purple-600" />
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Lock size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum requisito encontrado para esta mídia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requirements.map((req) => {
                const youtubeData = youtubeDetails.get(req.youtube_id);
                const thumbnail = youtubeData?.thumbnail || req.thumbnail;

                return (
                  <div
                    key={req.youtube_id}
                    className={`bg-gray-800/50 border rounded-lg overflow-hidden transition-all ${
                      req.is_watched
                        ? 'border-green-500/50 bg-green-900/20'
                        : 'border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <Link href={`/media/${req.youtube_id}`}>
                      <div className="relative aspect-video">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={req.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                            <Play size={48} className="text-gray-500" />
                          </div>
                        )}
                        {req.is_watched && (
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-2">
                            <Check size={20} className="text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-bold line-clamp-2 mb-2">{req.title}</h3>
                      {req.channel_title && (
                        <p className="text-sm text-gray-400 mb-2">{req.channel_title}</p>
                      )}
                      {req.is_watched ? (
                        <span className="inline-block bg-green-600/30 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                          ✓ Assistido
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-semibold">
                          Não assistido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {allMet && (
          <div className="p-6 border-t border-gray-800 bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check size={24} className="text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Todos os requisitos foram atendidos!</p>
                  <p className="text-sm text-gray-400">Esta mídia foi desbloqueada.</p>
                </div>
              </div>
              <button
                onClick={handleCheckUnlock}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Confirmar Desbloqueio
              </button>
            </div>
          </div>
        )}

        {!allMet && totalCount > 0 && (
          <div className="p-6 border-t border-gray-800">
            <p className="text-center text-gray-400 text-sm">
              Continue assistindo os vídeos acima para desbloquear este conteúdo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

