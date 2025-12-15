'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Info, Bookmark, Tv, Trophy, Users, Gamepad2, Loader, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import VideoCard from '@/app/components/VideoCard';
import CarouselHero from '@/app/components/CarouselHero';
import HorizontalCarousel from '@/app/components/HorizontalCarousel';
import LockedVideosCarousel from '@/app/components/LockedVideosCarousel';
import {
  getPopularVideos,
  getTrendingVideos,
  searchVideosByGenre,
  searchYouTubeVideos,
  getVideoDetails,
  YouTubeVideo,
} from '@/lib/youtubeService';
import apiService from '@/lib/apiService';

interface LockedMediaItem {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail?: string;
  rating?: number;
  views?: number;
}

export default function Home() {
  const [continueWatching, setContinueWatching] = useState<YouTubeVideo[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
  const [trendingNow, setTrendingNow] = useState<YouTubeVideo[]>([]);
  const [trendingVideos1, setTrendingVideos1] = useState<YouTubeVideo[]>([]);
  const [trendingVideos2, setTrendingVideos2] = useState<YouTubeVideo[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<YouTubeVideo[]>([]);
  const [lockedMedia, setLockedMedia] = useState<LockedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeroVideo, setShowHeroVideo] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          // Carregar apenas vídeos populares se não autenticado
          const [popular] = await Promise.all([
            getPopularVideos(6),
          ]);
          setContinueWatching(popular);
          setTrendingNow(popular);
          setRecommendedVideos([]);
        } else {
          // Carregar conteúdo personalizado se autenticado
          try {
            // Buscar vídeos para continuar assistindo (apenas os que têm atividades)
            const continueWatchingData = await apiService.getContinueWatching(6);
            
            // Converter dados da API para formato YouTubeVideo
            const continueVideos: YouTubeVideo[] = [];
            if (continueWatchingData.media && Array.isArray(continueWatchingData.media)) {
              for (const item of continueWatchingData.media) {
                if (item.media && item.media.youtube_id) {
                  try {
                    // Buscar detalhes do vídeo do YouTube
                    const videoDetails = await getVideoDetails(item.media.youtube_id);
                    continueVideos.push(videoDetails);
                  } catch (err) {
                    console.error('Erro ao buscar detalhes do vídeo:', err);
                  }
                }
              }
            }

            // Se não houver vídeos para continuar, usar vídeos populares
            if (continueVideos.length === 0) {
              const popular = await getPopularVideos(6);
              setContinueWatching(popular);
            } else {
              setContinueWatching(continueVideos);
            }
          } catch (err) {
            console.error('Erro ao carregar continue watching:', err);
            // Fallback para vídeos populares
            const popular = await getPopularVideos(6);
            setContinueWatching(popular);
          }

          // Carregar outras seções
          const [recommended, trending, trending1, trending2, featured] = await Promise.all([
            getPopularVideos(10), // Vídeos recomendados
            getPopularVideos(3),
            getTrendingVideos(10),
            getTrendingVideos(10),
            getTrendingVideos(5),
          ]);

          setRecommendedVideos(recommended);
          setTrendingNow(trending);
          setTrendingVideos1(trending1);
          setTrendingVideos2(trending2);
          setFeaturedVideos(featured);

          // Buscar mídias bloqueadas (similar ao explorador)
          try {
            const lockedVideos = await searchYouTubeVideos({
              query: 'filmes completos dublados',
              maxResults: 10,
              order: 'viewCount',
            });

            // Processar vídeos bloqueados
            const lockedMediaList: LockedMediaItem[] = [];
            for (const youtubeVideo of lockedVideos.slice(0, 5)) {
              try {
                // Selecionar gênero aleatório
                const defaultGenres = ['Ação', 'Comédia', 'Drama', 'Terror', 'Romance', 'Ficção Científica'];
                const randomGenre = defaultGenres[Math.floor(Math.random() * defaultGenres.length)];

                // Buscar ou criar mídia no banco
                const mediaResponse = await apiService.findOrCreateMediaByYoutubeId({
                  youtube_id: youtubeVideo.id,
                  title: youtubeVideo.title,
                  description: youtubeVideo.description,
                  poster_url: youtubeVideo.thumbnail,
                  type: 'movie',
                  genre: randomGenre,
                });

                if (mediaResponse.media && mediaResponse.media.id) {
                  const mediaId = mediaResponse.media.id.toString();
                  
                  // Verificar se está desbloqueado
                  let isUnlocked = false;
                  try {
                    const unlockedMedia = await apiService.getUnlockedMedia();
                    isUnlocked = unlockedMedia.some((m: any) => m.id === parseInt(mediaId));
                  } catch (err) {
                    // Se não conseguir verificar, assume bloqueado
                    isUnlocked = false;
                  }

                  // Se estiver bloqueado, adicionar à lista
                  if (!isUnlocked) {
                    lockedMediaList.push({
                      id: mediaId,
                      youtube_id: youtubeVideo.id,
                      title: youtubeVideo.title,
                      thumbnail: youtubeVideo.thumbnail,
                      rating: 0,
                      views: youtubeVideo.viewCount ? parseInt(youtubeVideo.viewCount) : 0,
                    });
                  }
                }
              } catch (err) {
                console.error('Erro ao processar vídeo bloqueado:', err);
              }
            }

            setLockedMedia(lockedMediaList);
          } catch (err) {
            console.error('Erro ao carregar mídias bloqueadas:', err);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Use featured videos for hero carousel
  const heroVideo = featuredVideos[0];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="w-full">
        {/* Hero Section - Carousel */}
        <section className="relative w-full overflow-hidden pt-16">
          {featuredVideos.length > 0 ? (
            <CarouselHero videos={featuredVideos} autoScroll={true} scrollInterval={6000} />
          ) : (
            <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
              <Loader size={48} className="animate-spin text-red-600" />
            </div>
          )}
        </section>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader size={48} className="mx-auto mb-4 text-red-600 animate-spin" />
                <p className="text-gray-400">Carregando conteúdo...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Continue Watching */}
              {continueWatching.length > 0 && (
                <section className="mb-12">
                  <HorizontalCarousel videos={continueWatching} title="Continue Assistindo" />
                </section>
              )}

              {/* Trending Now Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Em Alta Agora</h2>
                {trendingVideos1.length > 0 && (
                  <div className="mb-8">
                    <HorizontalCarousel videos={trendingVideos1} />
                  </div>
                )}
                {trendingVideos2.length > 0 && (
                  <div className="mb-8">
                    <HorizontalCarousel videos={trendingVideos2} />
                  </div>
                )}
              </section>

              {/* Recommended for You */}
              {recommendedVideos.length > 0 && (
                <section className="mb-12">
                  <HorizontalCarousel videos={recommendedVideos} title="Recomendados para Você" />
                </section>
              )}

              {/* Unlock by Watching More */}
              {lockedMedia.length > 0 && (
                <section className="mb-12">
                  <LockedVideosCarousel lockedMedia={lockedMedia} title="Desbloqueie Assistindo Mais" />
                </section>
              )}

              {/* Genre Section */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Explorar por Gênero</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['Ação', 'Comédia', 'Drama', 'Sci-fi', 'Terror', 'Romance', 'Documentário', 'Animação'].map(
                    (genre) => (
                      <Link key={genre} href={`/buscar?genero=${genre.toLowerCase()}`} className="group">
                        <div className="bg-gradient-to-br from-purple-600 to-red-600 p-4 rounded-lg text-center group-hover:shadow-lg group-hover:shadow-purple-600/50 transition-all">
                          <Tv size={24} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm">{genre}</p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
