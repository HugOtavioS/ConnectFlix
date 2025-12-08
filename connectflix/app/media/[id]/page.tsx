'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import CollectibleCard from '@/app/components/CollectibleCard';
import VideoCard from '@/app/components/VideoCard';
import {
  getVideoDetails,
  formatViewCount,
  formatDuration,
  YouTubeVideo,
  searchVideosByGenre,
} from '@/lib/youtubeService';
import apiService from '@/lib/apiService';
import {
  Play,
  Plus,
  Share2,
  Star,
  Lock,
  Clock,
  Users,
  Loader,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'detalhes' | 'colecionaveis' | 'similares';

export default function MediaDetailsPage() {
  const params = useParams();
  const videoId = params.id as string;

  const [videoDetails, setVideoDetails] = useState<YouTubeVideo | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('detalhes');
  const [categoryCards, setCategoryCards] = useState<any[]>([]);
  const [similarMedia, setSimilarMedia] = useState<any[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);

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

              // Buscar detalhes completos da mídia
              const mediaDetails = await apiService.getMediaDetails(foundMediaId);
              setMediaData(mediaDetails);

              // Buscar cards relacionados às categorias
              if (mediaDetails.categories && mediaDetails.categories.length > 0) {
                const firstCategory = mediaDetails.categories[0];
                try {
                  const cards = await apiService.getCardsByCategory(firstCategory.name);
                  setCategoryCards(cards);
                } catch (err) {
                  console.error('Erro ao buscar cards:', err);
                }
              }

              // Buscar mídias similares
              try {
                const similar = await apiService.getSimilarMediaFromDetails(foundMediaId);
                setSimilarMedia(similar);
              } catch (err) {
                console.error('Erro ao buscar similares:', err);
              }
            }
          } catch (err) {
            console.error('Erro ao buscar/criar mídia:', err);
          }
        }

        // Buscar vídeos recomendados
        try {
          const recommended = await searchVideosByGenre('ação', 5);
          setRecommendedVideos(recommended);
        } catch (err) {
          console.error('Erro ao buscar recomendados:', err);
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
  }, [videoId]);

  if (loading) {
    return (
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
    );
  }

  if (error || !videoDetails) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="pt-20 max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <p className="text-red-500 font-semibold">{error || 'Vídeo não encontrado'}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const primaryCategory = mediaData?.categories?.[0]?.name || 'Ação';
  const actors = mediaData?.actors || [];
  const categories = mediaData?.categories || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="pt-16">
          {/* Hero Section com Background */}
          <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
            {/* Background Image */}
            {videoDetails.thumbnail && (
              <div className="absolute inset-0">
                <Image
                  src={videoDetails.thumbnail}
                  alt={videoDetails.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
                    {videoDetails.title}
                  </h1>

                  {/* Info Row */}
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-semibold">4.8</span>
                    </div>
                    <span className="text-gray-300">2024</span>
                    <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {primaryCategory}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xl text-gray-300 mb-6">
                    {videoDetails.description?.substring(0, 100) || 'Uma jornada épica pelo cosmos'}
                  </p>

                  {/* Cast */}
                  {actors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-gray-400 mb-2">Elenco:</p>
                      <p className="text-gray-300">
                        {actors.slice(0, 8).map((a: any) => a.name).join(', ')}
                        {actors.length > 8 && ', ...'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Link
                      href={`/player/${videoId}`}
                      className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                      <Play size={24} fill="black" />
                      Assistir
                    </Link>
                    <button className="bg-black/50 hover:bg-black/70 border border-white/30 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                      <Plus size={24} />
                      Minha Lista
                    </button>
                    <button className="bg-black/50 hover:bg-black/70 border border-white/30 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                      <Share2 size={20} />
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Tabs Content */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800">
                  {(['detalhes', 'colecionaveis', 'similares'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-white text-white'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab === 'detalhes' && 'Detalhes'}
                      {tab === 'colecionaveis' && 'Colecionáveis'}
                      {tab === 'similares' && 'Similares'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'detalhes' && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold mb-4">Gênero</p>
                      <p className="text-gray-300">{primaryCategory}</p>
                    </div>
                    <div>
                      <p className="font-bold mb-4">Ano</p>
                      <p className="text-gray-300">2024</p>
                    </div>
                    <div>
                      <p className="font-bold mb-4">Duração</p>
                      <p className="text-gray-300">
                        {videoDetails.duration ? formatDuration(videoDetails.duration) : '2h 51min'}
                      </p>
                    </div>
                    {actors.length > 0 && (
                      <div>
                        <p className="font-bold mb-4">Elenco:</p>
                        <p className="text-gray-300">
                          {actors.map((a: any) => a.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'colecionaveis' && (
                  <div>
                    {categoryCards.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {categoryCards.map((card) => (
                          <CollectibleCard
                            key={card.id}
                            categoryName={card.name}
                            rarity={card.rarity}
                            isUnlocked={false}
                            points={card.points_value}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Lock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum card disponível para esta categoria</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'similares' && (
                  <div>
                    {similarMedia.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {similarMedia.map((media: any) => (
                          <Link key={media.id} href={`/media/${media.youtube_id || media.id}`}>
                            <div className="bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-900 transition-colors">
                              {media.poster_url && (
                                <div className="relative aspect-video">
                                  <Image
                                    src={media.poster_url}
                                    alt={media.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="p-4">
                                <h3 className="font-bold line-clamp-2">{media.title}</h3>
                                {media.categories && media.categories.length > 0 && (
                                  <p className="text-sm text-gray-400 mt-1">
                                    {media.categories[0].name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p>Nenhuma mídia similar encontrada</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-8 flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
                  {videoDetails.thumbnail && (
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={videoDetails.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Progresso para o Level 1000</p>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <Link
                    href={`/player/${videoId}`}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
                  >
                    Continuar
                  </Link>
                </div>
              </div>

              {/* Right Column - Collectible Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {/* Card Colecionável Grande */}
                  <div className="mb-6">
                    <CollectibleCard
                      categoryName={primaryCategory}
                      rarity={categoryCards[0]?.rarity || 'rare'}
                      isUnlocked={false}
                      points={categoryCards[0]?.points_value || 150}
                    />
                  </div>
                  
                  {/* Card Info */}
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-bold mb-4">Informações do Card</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-400">Raridade:</p>
                        <p className="text-blue-400 font-semibold capitalize">
                          {categoryCards[0]?.rarity || 'Raro'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pontos:</p>
                        <p className="text-yellow-400 font-semibold">
                          +{categoryCards[0]?.points_value || 150} XP
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Categoria:</p>
                        <p className="text-white font-semibold">{primaryCategory}</p>
                      </div>
                    </div>
                    
                    {/* Collection Bonus */}
                    <div className="mt-4 bg-blue-900/30 border border-blue-700/50 p-3 rounded">
                      <div className="flex items-start gap-2">
                        <Star size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-200">
                          Colecionar cards de {primaryCategory} aumenta suas chances de desbloquear conteúdo exclusivo desta categoria!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Você também pode gostar */}
            {recommendedVideos.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {recommendedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      showPlayButton={true}
                      viewCount={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

