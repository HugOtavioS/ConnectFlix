'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Check, Play, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import apiService from '@/lib/apiService';
import { getVideoDetails, YouTubeVideo } from '@/lib/youtubeService';

interface UnlockRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: string;
  mediaTitle: string;
  onUnlocked?: () => void;
  externalRequirements?: YouTubeVideo[]; // if provided, use these instead of requesting from API
}

export default function UnlockRequirementsModal({
  isOpen,
  onClose,
  mediaId,
  mediaTitle,
  onUnlocked,
}: UnlockRequirementsModalProps) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMet, setAllMet] = useState(false);
  const [targetMedia, setTargetMedia] = useState<any>(null);
  const [youtubeDetails, setYoutubeDetails] = useState<Map<string, YouTubeVideo>>(new Map());

  useEffect(() => {
    if (isOpen && mediaId) {
      if (externalRequirements && externalRequirements.length > 0) {
        loadExternalRequirements();
      } else {
        loadRequirements();
      }
    }
  }, [isOpen, mediaId, externalRequirements]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUnlockRequirements(mediaId);
      setRequirements(data.requirements || []);
      setAllMet(data.all_requirements_met || false);
      setTargetMedia(data.target_media);

      // Os requisitos já vêm do YouTube, então não precisamos buscar detalhes adicionais
      // Mas podemos melhorar os dados se necessário
      const detailsMap = new Map<string, YouTubeVideo>();
      for (const req of data.requirements || []) {
        if (req.youtube_id) {
          try {
            const details = await getVideoDetails(req.youtube_id);
            detailsMap.set(req.youtube_id, details);
          } catch (error) {
            console.error(`Erro ao buscar detalhes do vídeo ${req.youtube_id}:`, error);
          }
        }
      }
      setYoutubeDetails(detailsMap);
    } catch (error) {
      console.error('Erro ao carregar requisitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExternalRequirements = async () => {
    try {
      setLoading(true);
      // compute watched status from user's activities
      const activities = await apiService.getActivities('watch');
      const watchedYoutubeIds = new Set(
        (activities || [])
          .filter((a: any) => a.media && a.media.youtube_id)
          .map((a: any) => a.media.youtube_id)
      );

      const requirements = (externalRequirements || []).map((v) => ({
        youtube_id: v.id,
        title: v.title,
        description: v.description || '',
        thumbnail: v.thumbnail,
        channel_title: v.channelTitle || '',
        is_watched: watchedYoutubeIds.has(v.id),
      }));

      setRequirements(requirements);
      setAllMet(requirements.length > 0 && requirements.every((r) => r.is_watched));
      setTargetMedia({ id: mediaId, title: mediaTitle });
    } catch (error) {
      console.error('Erro ao carregar requisitos externos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUnlock = async () => {
    try {
      // if external requirements were provided, pass their youtube ids to the server for validation
      const youtubeIds = (externalRequirements || requirements || []).map((r: any) => r.youtube_id || r.id).filter(Boolean);
      const result = await apiService.checkAndUnlockMedia(mediaId, youtubeIds);
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

