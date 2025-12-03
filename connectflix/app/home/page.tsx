'use client';

import Navigation from '@/app/components/Navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Info, Bookmark, Tv, Trophy, Users, Gamepad2, Loader, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import VideoCard from '@/app/components/VideoCard';
import VideoPlayer from '@/app/components/VideoPlayer';
import {
  getPopularVideos,
  searchVideosByGenre,
  YouTubeVideo,
} from '@/lib/youtubeService';

export default function Home() {
  const [continueWatching, setContinueWatching] = useState<YouTubeVideo[]>([]);
  const [actionMovies, setActionMovies] = useState<YouTubeVideo[]>([]);
  const [trendingNow, setTrendingNow] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeroVideo, setShowHeroVideo] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        // Load different categories
        const [popular, action, trending] = await Promise.all([
          getPopularVideos(6),
          searchVideosByGenre('acao', 6),
          getPopularVideos(3),
        ]);

        setContinueWatching(popular);
        setActionMovies(action);
        setTrendingNow(trending);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Use first trending video as hero
  const heroVideo = trendingNow[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden pt-16">
          {showHeroVideo && heroVideo ? (
            // Fullscreen Video View
            <div className="relative w-full h-screen md:h-[600px] bg-black">
              <div className="absolute inset-0">
                <VideoPlayer videoId={heroVideo.id} autoPlay={true} />
              </div>
              {/* Close Button */}
              <button
                onClick={() => setShowHeroVideo(false)}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/75 rounded-full p-2 transition-all duration-200"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          ) : (
            // Normal Hero View with Content
            <div className="relative w-full h-screen md:h-[600px] overflow-hidden bg-gradient-to-br from-gray-800 to-black">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                {heroVideo && heroVideo.thumbnail ? (
                  <>
                    <Image
                      src={heroVideo.thumbnail}
                      alt={heroVideo.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </>
                ) : (
                  <Image
                    src="/imgs/Banner.jpeg"
                    alt="Cosmic Odyssey"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 items-end justify-between">
                  <div className="max-w-2xl flex-1">
                    {/* Badge */}
                    <div className="mb-4">
                      <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                        Em Destaque
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg line-clamp-2">
                      {heroVideo?.title || 'Carregando...'}
                    </h1>

                    {/* Rating and Info */}
                    <div className="flex items-center gap-4 mb-6 text-gray-300">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold">4.8</span>
                        <span>| 2024</span>
                      </div>
                      <span>2h 30min</span>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-gray-200 mb-6 max-w-xl leading-relaxed line-clamp-3">
                      {heroVideo?.description ||
                        'Uma jornada épica através do universo onde um piloto solitário descobre civilizações antigas e segredos cósmicos que mudarão o destino da humanidade.'}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                      {heroVideo && (
                        <button
                          onClick={() => setShowHeroVideo(true)}
                          className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                        >
                          <Play size={20} />
                          Assistir
                        </button>
                      )}
                      <button className="flex items-center gap-2 bg-gray-600/70 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 backdrop-blur">
                        <Info size={20} />
                        Mais Informações
                      </button>
                      <button className="flex items-center gap-2 bg-purple-600/70 hover:bg-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 backdrop-blur">
                        <Bookmark size={20} />
                        Adicionar Lista
                      </button>
                    </div>
                  </div>

                  {/* Video Player à Direita */}
                  {heroVideo && (
                    <div className="hidden lg:block w-80 h-56 rounded-lg overflow-hidden shadow-2xl bg-black border border-gray-700">
                      <VideoPlayer videoId={heroVideo.id} autoPlay={false} />
                    </div>
                  )}
                </div>
              </div>
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
                  <h2 className="text-3xl font-bold mb-6">Continue Assistindo</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {continueWatching.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              )}

              {/* Action Movies */}
              {actionMovies.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <Tv size={28} /> Filmes de Ação
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actionMovies.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              )}

              {/* Features Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Em Alta Agora</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/cards" className="group">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-900 p-6 rounded-lg group-hover:from-purple-500 group-hover:to-purple-800 transition-all">
                      <Gamepad2 size={32} className="mb-2" />
                      <h3 className="font-bold text-lg mb-2">Cards Colecionáveis</h3>
                      <p className="text-gray-300 text-sm">Ganhe cards únicos ao assistir filmes e séries</p>
                    </div>
                  </Link>

                  <Link href="/rankings" className="group">
                    <div className="bg-gradient-to-br from-red-600 to-red-900 p-6 rounded-lg group-hover:from-red-500 group-hover:to-red-800 transition-all">
                      <Trophy size={32} className="mb-2" />
                      <h3 className="font-bold text-lg mb-2">Rankings Competitivos</h3>
                      <p className="text-gray-300 text-sm">Compita em rankings regionais e nacionais</p>
                    </div>
                  </Link>

                  <Link href="/conexoes" className="group">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-6 rounded-lg group-hover:from-blue-500 group-hover:to-blue-800 transition-all">
                      <Users size={32} className="mb-2" />
                      <h3 className="font-bold text-lg mb-2">Conexões Sociais</h3>
                      <p className="text-gray-300 text-sm">Conecte-se com outros fãs e compartilhe interesses</p>
                    </div>
                  </Link>
                </div>
              </section>

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
  );
}
