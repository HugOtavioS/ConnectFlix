import { useEffect, useRef, useCallback } from 'react';
import apiService from '@/lib/apiService';

interface UseVideoTrackingOptions {
  videoId: string;
  mediaId?: string;
  enabled?: boolean;
  intervalSeconds?: number;
}

/**
 * Hook para rastrear o tempo de visualização de vídeo e enviar ao backend
 * @param videoId - ID do vídeo do YouTube
 * @param mediaId - ID da mídia no banco de dados (opcional)
 * @param enabled - Se o tracking está habilitado
 * @param intervalSeconds - Intervalo em segundos para enviar dados (padrão: 5)
 */
export function useVideoTracking({
  videoId,
  mediaId,
  enabled = true,
  intervalSeconds = 5,
}: UseVideoTrackingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const playerRef = useRef<any>(null);
  const isTrackingRef = useRef<boolean>(false);

  // Função para obter o tempo atual do vídeo usando YouTube IFrame API
  const getCurrentTime = useCallback((): number => {
    if (!playerRef.current) {
      return 0;
    }

    try {
      // getCurrentTime() retorna o tempo atual em segundos (síncrono)
      const time = playerRef.current.getCurrentTime();
      return time || 0;
    } catch (error) {
      console.error('Erro ao obter tempo do vídeo:', error);
      return 0;
    }
  }, []);

  // Função para verificar se o vídeo está pausado
  const isPaused = useCallback((): boolean => {
    if (!playerRef.current) {
      return true;
    }

    try {
      // getPlayerState() retorna o estado atual (síncrono)
      // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
      const state = playerRef.current.getPlayerState();
      return state !== 1; // Não está playing
    } catch (error) {
      console.error('Erro ao verificar estado do vídeo:', error);
      return true;
    }
  }, []);

  // Função para enviar atividade ao backend
  const sendActivity = useCallback(
    async (currentTime: number) => {
      if (!enabled || !apiService.isAuthenticated()) {
        return;
      }

      // Só envia se o tempo mudou significativamente (pelo menos 1 segundo)
      const timeDifference = Math.abs(currentTime - lastSentTimeRef.current);
      if (timeDifference < 1) {
        return;
      }

      try {
        await apiService.logActivity({
          media_id: mediaId || videoId,
          activity_type: 'watch',
          duration_seconds: Math.floor(currentTime),
        });

        lastSentTimeRef.current = currentTime;
        console.log(`Atividade registrada: ${Math.floor(currentTime)}s`);
      } catch (error) {
        console.error('Erro ao registrar atividade:', error);
      }
    },
    [enabled, mediaId, videoId]
  );

  // Função principal de tracking
  const trackVideo = useCallback(async () => {
    if (!enabled || !apiService.isAuthenticated()) {
      return;
    }

    const paused = isPaused();
    if (paused) {
      return; // Não rastreia se o vídeo estiver pausado
    }

    const currentTime = getCurrentTime();
    if (currentTime > 0) {
      await sendActivity(currentTime);
    }
  }, [enabled, getCurrentTime, isPaused, sendActivity]);

  // Inicializar tracking quando o player estiver pronto
  const initializeTracking = useCallback(
    (player: any) => {
      if (!player || !enabled) {
        return;
      }

      playerRef.current = player;
      isTrackingRef.current = true;

      // Limpar intervalo anterior se existir
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Iniciar tracking a cada X segundos
      intervalRef.current = setInterval(() => {
        if (isTrackingRef.current) {
          trackVideo();
        }
      }, intervalSeconds * 1000);

      // Enviar primeira atividade imediatamente
      setTimeout(() => {
        trackVideo();
      }, 1000); // Aguarda 1 segundo para o player estar totalmente carregado
    },
    [enabled, intervalSeconds, trackVideo]
  );

  // Parar tracking
  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    initializeTracking,
    stopTracking,
    playerRef,
  };
}

