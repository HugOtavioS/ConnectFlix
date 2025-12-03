/**
 * EXEMPLOS DE USO - YouTube Service
 * 
 * Este arquivo demonstra como usar o serviço de integração com YouTube
 */

import {
  searchYouTubeVideos,
  searchVideosByGenre,
  getPopularVideos,
  getVideoDetails,
  formatDuration,
  formatViewCount,
} from '@/lib/youtubeService';

// ============================================================
// 1. BUSCAR VÍDEOS POR PALAVRAS-CHAVE
// ============================================================

async function exemploBasicSearch() {
  try {
    const videos = await searchYouTubeVideos({
      query: 'filmes de ação 2024',
      maxResults: 10,
      order: 'viewCount', // relevance, date, viewCount
    });

    console.log('Vídeos encontrados:', videos);
    // Output: Array de vídeos com id, title, description, thumbnail, etc
  } catch (error) {
    console.error('Erro na busca:', error);
  }
}

// ============================================================
// 2. BUSCAR POR GÊNERO
// ============================================================

async function exemploBuscarGenero() {
  try {
    // Gêneros suportados: acao, comedia, drama, sci-fi, terror, romance, documentario, animacao
    const videos = await searchVideosByGenre('acao', 20);
    console.log('Filmes de ação:', videos);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// ============================================================
// 3. OBTER VÍDEOS POPULARES
// ============================================================

async function exemploVideoPopulares() {
  try {
    // Últimos 30 dias, região Brasil
    const videos = await getPopularVideos(12, 'BR');
    console.log('Vídeos em alta:', videos);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// ============================================================
// 4. OBTER DETALHES DE UM VÍDEO ESPECÍFICO
// ============================================================

async function exemploDetalhesVideo() {
  try {
    const details = await getVideoDetails('dQw4w9WgXcQ');
    console.log('Detalhes:', {
      title: details.title,
      channel: details.channelTitle,
      views: formatViewCount(details.viewCount || '0'),
      duration: formatDuration(details.duration || 'PT0S'),
      published: details.publishedAt,
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

// ============================================================
// 5. USAR EM COMPONENTES REACT
// ============================================================

// Exemplo em um componente React:
/*
'use client';

import { useState, useEffect } from 'react';
import { searchYouTubeVideos, YouTubeVideo } from '@/lib/youtubeService';

export default function VideoList() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const results = await searchYouTubeVideos({
          query: 'documentários natureza',
          maxResults: 12,
        });
        setVideos(results);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div key={video.id}>
          <img src={video.thumbnail} alt={video.title} />
          <h3>{video.title}</h3>
          <p>{video.channelTitle}</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================
// 6. FORMATAR DADOS PARA EXIBIÇÃO
// ============================================================

async function exemploFormatacao() {
  try {
    const video = await getVideoDetails('dQw4w9WgXcQ');

    // Formatar visualizações: "1200000" → "1.2M"
    const views = formatViewCount(video.viewCount || '0');
    console.log('Visualizações:', views); // Output: "1.2M"

    // Formatar duração: "PT2H34M15S" → "2h 34min"
    const duration = formatDuration(video.duration || 'PT0S');
    console.log('Duração:', duration); // Output: "2h 34min"
  } catch (error) {
    console.error('Erro:', error);
  }
}

// ============================================================
// 7. TRATAMENTO DE ERROS
// ============================================================

async function exemploErros() {
  try {
    // Se a API key não estiver configurada:
    // throw new Error('YouTube API key não configurada...')

    const videos = await searchYouTubeVideos({
      query: 'teste',
      maxResults: 10,
    });
    console.log('Sucesso:', videos);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('Configure a chave da API no .env.local');
      } else if (error.message.includes('quota')) {
        console.error('Limite de requisições atingido');
      } else {
        console.error('Erro desconhecido:', error.message);
      }
    }
  }
}

// ============================================================
// 8. TIPOS DISPONÍVEIS
// ============================================================

/*
interface YouTubeVideo {
  id: string;                    // ID do vídeo
  title: string;                 // Título
  description: string;           // Descrição completa
  thumbnail: string;             // URL da thumbnail
  channelTitle: string;          // Nome do canal
  publishedAt: string;           // Data de publicação (ISO)
  viewCount?: string;            // Número de visualizações
  duration?: string;             // Duração em formato ISO 8601
}

interface YouTubeSearchParams {
  query: string;                 // Termo de busca
  maxResults?: number;           // 1-50, padrão: 12
  order?: 'relevance' | 'date' | 'viewCount';  // Ordenação
  videoDuration?: 'any' | 'short' | 'medium' | 'long';  // Duração
  videoType?: 'any' | 'movie' | 'episode';     // Tipo de vídeo
}
*/

// ============================================================
// CONFIGURAÇÃO NECESSÁRIA
// ============================================================

/*
1. Crie um arquivo .env.local na raiz do projeto (connectflix/)

2. Adicione:
   NEXT_PUBLIC_YOUTUBE_API_KEY=sua_chave_aqui

3. Para obter a chave:
   - Acesse: https://console.cloud.google.com/
   - Crie um novo projeto
   - Ative a YouTube Data API v3
   - Crie uma chave de API
   - Copie a chave e cole em .env.local

4. Reinicie o servidor Next.js
*/

// ============================================================
// LIMITES E QUOTAS
// ============================================================

/*
YouTube API tem limites:
- Quota diária: 10,000 unidades
- Cada busca usa ~100 unidades
- Cada detalhe de vídeo usa ~1 unidade

Para produção, considere:
- Cache de resultados
- API Route backend (mais seguro)
- Sincronização periódica
*/

export {
  exemploBasicSearch,
  exemploBuscarGenero,
  exemploVideoPopulares,
  exemploDetalhesVideo,
  exemploFormatacao,
  exemploErros,
};
