import axios from 'axios';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyBF20YkYr4uDXbs1KwQVl2JPiWS3rRyPI4';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Debug: Log da chave
if (typeof window !== 'undefined') {
  console.log('🔑 API Key carregada:', YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.substring(0, 10)}...` : 'NÃO CONFIGURADA');
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'viewCount';
  videoDuration?: 'any' | 'short' | 'medium' | 'long';
  videoType?: 'any' | 'movie' | 'episode';
}

// Mock data para fallback quando a API não funciona
const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Documentário: A Evolução da Tecnologia',
    description: 'Explore a história fascinante da evolução tecnológica e como ela moldou nosso mundo moderno.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    channelTitle: 'Tech Evolution',
    publishedAt: new Date().toISOString(),
    viewCount: '1200000',
    duration: 'PT2H34M',
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Cinética: A Magia do Cinema',
    description: 'Uma jornada visual através dos técnicas de cinematografia e direção que definem o cinema moderno.',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    channelTitle: 'Cinema Master',
    publishedAt: new Date().toISOString(),
    viewCount: '850000',
    duration: 'PT1H45M',
  },
  {
    id: '9bZkp7q19f0',
    title: 'Ação Extrema: Cenas de Tirar o Fôlego',
    description: 'Compilação de cenas de ação mais incríveis do cinema. Adrenalina pura!',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    channelTitle: 'Action Films',
    publishedAt: new Date().toISOString(),
    viewCount: '2100000',
    duration: 'PT2H15M',
  },
  {
    id: 'kJQP7kiw9Fk',
    title: 'Comédia: Os Melhores Momentos',
    description: 'Ria com os momentos mais engraçados do cinema e da televisão.',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw9Fk/hqdefault.jpg',
    channelTitle: 'Comedy Central',
    publishedAt: new Date().toISOString(),
    viewCount: '1500000',
    duration: 'PT1H30M',
  },
  {
    id: 'Dkk9gvTmCXY',
    title: 'Drama: Histórias que Tocam o Coração',
    description: 'Explore narrativas profundas e emocionantes que definem o drama cinematográfico.',
    thumbnail: 'https://i.ytimg.com/vi/Dkk9gvTmCXY/hqdefault.jpg',
    channelTitle: 'Drama Classics',
    publishedAt: new Date().toISOString(),
    viewCount: '980000',
    duration: 'PT2H',
  },
  {
    id: 'O0SBWgMkWDQ',
    title: 'Ficção Científica: O Futuro Agora',
    description: 'Viaje para o futuro com as melhores produções de ficção científica.',
    thumbnail: 'https://i.ytimg.com/vi/O0SBWgMkWDQ/hqdefault.jpg',
    channelTitle: 'Sci-Fi Universe',
    publishedAt: new Date().toISOString(),
    viewCount: '1650000',
    duration: 'PT2H20M',
  },
  {
    id: 'HYfiGPmH28M',
    title: 'Terror: Sustos que Vão Além',
    description: 'Os filmes de horror mais assustadores que você já viu.',
    thumbnail: 'https://i.ytimg.com/vi/HYfiGPmH28M/hqdefault.jpg',
    channelTitle: 'Horror Films',
    publishedAt: new Date().toISOString(),
    viewCount: '1100000',
    duration: 'PT1H50M',
  },
  {
    id: 'V7nPs4fnpDI',
    title: 'Animação: Arte em Movimento',
    description: 'Descubra a magia da animação e como ela revoluciona a contação de histórias.',
    thumbnail: 'https://i.ytimg.com/vi/V7nPs4fnpDI/hqdefault.jpg',
    channelTitle: 'Animation Studios',
    publishedAt: new Date().toISOString(),
    viewCount: '1300000',
    duration: 'PT1H40M',
  },
];

/**
 * Busca vídeos no YouTube
 */
export async function searchYouTubeVideos(
  params: YouTubeSearchParams
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key não configurada. Usando dados de demonstração.');
    return getMockVideos(params.query, params.maxResults || 12);
  }

  try {
    console.log('🔍 Buscando vídeos:', params.query);
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: params.query,
        maxResults: params.maxResults || 12,
        type: 'video',
        order: params.order || 'relevance',
        videoDuration: 'long', // Filtra apenas vídeos longos (não shorts)
        region: 'BR',
        relevanceLanguage: 'pt',
      },
    });

    console.log('✅ Vídeos encontrados:', response.data.items?.length);
    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error: any) {
    console.error('❌ Erro ao buscar vídeos:', error.response?.status, error.response?.data?.error?.message || error.message);
    console.warn('⚠️ Usando dados de demonstração como fallback.');
    return getMockVideos(params.query, params.maxResults || 12);
  }
}

/**
 * Obter detalhes de um vídeo específico
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo> {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key não configurada. Usando dados de demonstração.');
    return getMockVideoById(videoId) || MOCK_VIDEOS[0];
  }

  try {
    console.log('📽️ Carregando detalhes do vídeo:', videoId);
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.warn('⚠️ Vídeo não encontrado, usando mock');
      return getMockVideoById(videoId) || MOCK_VIDEOS[0];
    }

    const item = response.data.items[0];
    console.log('✅ Vídeo carregado:', item.snippet.title);

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount,
      duration: item.contentDetails.duration,
    };
  } catch (error: any) {
    console.error('❌ Erro ao obter detalhes do vídeo:', error.response?.status, error.response?.data?.error?.message || error.message);
    console.warn('⚠️ Usando dados de demonstração como fallback.');
    return getMockVideoById(videoId) || MOCK_VIDEOS[0];
  }
}

/**
 * Obter vídeos populares
 */
export async function getPopularVideos(
  maxResults: number = 12,
  region: string = 'BR'
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key não configurada. Usando dados de demonstração.');
    return getMockVideos('', maxResults);
  }

  try {
    console.log('📺 Carregando vídeos populares...');
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        maxResults,
        type: 'video',
        order: 'viewCount',
        videoDuration: 'long', // Filtra apenas vídeos longos (não shorts)
        region,
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    console.log('✅ Vídeos populares carregados:', response.data.items?.length);
    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error: any) {
    console.error('❌ Erro ao obter vídeos populares:', error.response?.status, error.response?.data?.error?.message || error.message);
    console.warn('⚠️ Usando dados de demonstração como fallback.');
    return getMockVideos('', maxResults);
  }
}

/**
 * Buscar vídeos em destaque/trending
 */
export async function getTrendingVideos(
  maxResults: number = 5,
  region: string = 'BR'
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key não configurada. Usando dados de demonstração.');
    return getMockVideos('', maxResults);
  }

  try {
    console.log('🔥 Carregando vídeos em destaque...');
    // Usar a API de vídeos mais populares
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        maxResults,
        regionCode: region,
        videoDuration: 'long',
      },
    });

    console.log('✅ Vídeos em destaque carregados:', response.data.items?.length);
    return response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || '0',
      duration: item.contentDetails?.duration || '',
    }));
  } catch (error: any) {
    console.error('❌ Erro ao obter vídeos em destaque:', error.response?.status, error.response?.data?.error?.message || error.message);
    // Fallback para vídeos populares
    return getPopularVideos(maxResults, region);
  }
}

/**
 * Buscar vídeos por categoria/gênero
 */
export async function searchVideosByGenre(
  genre: string,
  maxResults: number = 12
): Promise<YouTubeVideo[]> {
  const queries: { [key: string]: string } = {
    acao: 'action movies',
    comedia: 'comedy movies',
    drama: 'drama movies',
    'sci-fi': 'science fiction movies',
    terror: 'horror movies',
    romance: 'romance movies',
    documentario: 'documentary',
    animacao: 'animated movies',
  };

  const query = queries[genre.toLowerCase()] || genre;
  return searchYouTubeVideos({
    query,
    maxResults,
    order: 'viewCount',
  });
}

/**
 * Converter ISO 8601 duration para formato legível (ex: 2h 34min)
 */
export function formatDuration(duration: string): string {
  const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
  const matches = duration.match(regex);

  if (!matches) return 'N/A';

  const hours = matches[1] ? parseInt(matches[1]) : 0;
  const minutes = matches[2] ? parseInt(matches[2]) : 0;
  const seconds = matches[3] ? parseInt(matches[3]) : 0;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `${minutes}min`;
  }
  return `${seconds}s`;
}

/**
 * Formatar número de visualizações (ex: 1.2M)
 */
export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Obter vídeos mock para demonstração
 */
function getMockVideos(query: string, maxResults: number): YouTubeVideo[] {
  if (query.toLowerCase().includes('ação') || query.toLowerCase().includes('action')) {
    return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes('ação') || v.id === '2ARrDvyHp5o').slice(0, maxResults);
  }
  if (query.toLowerCase().includes('comédia') || query.toLowerCase().includes('comedy')) {
    return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes('comédia') || v.id === 'kffacxfA7g4').slice(0, maxResults);
  }
  if (query.toLowerCase().includes('drama')) {
    return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes('drama') || v.id === 'tYzMGcUty6s').slice(0, maxResults);
  }
  
  return MOCK_VIDEOS.slice(0, maxResults);
}

/**
 * Obter vídeo mock por ID
 */
function getMockVideoById(videoId: string): YouTubeVideo | undefined {
  return MOCK_VIDEOS.find(v => v.id === videoId);
}
