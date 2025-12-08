'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Settings, Lock, Star, Eye, Loader, Play } from 'lucide-react';
import apiService from '@/lib/apiService';
import { getVideoDetails, searchYouTubeVideos, searchVideosByGenre, getPopularVideos, YouTubeVideo } from '@/lib/youtubeService';
import VideoCard from '@/app/components/VideoCard';
import LockedVideoCard from '@/app/components/LockedVideoCard';
import UnlockRequirementsModal from '@/app/components/UnlockRequirementsModal';

type SortOption = 'created_at' | 'rating' | 'title';
type SortDirection = 'asc' | 'desc';

export default function Explorador() {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'filmes' | 'series' | 'documentarios' | 'podcasts'>('todos');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [selectedLockedMedia, setSelectedLockedMedia] = useState<{ id: string; title: string } | null>(null);
  const [selectedLockedMediaCandidates, setSelectedLockedMediaCandidates] = useState<YouTubeVideo[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const typeCategories = ['Todos', 'Filmes', 'Séries', 'Documentários', 'Podcasts'];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        if (!apiService.isAuthenticated()) {
          setContent([]);
          return;
        }

        let youtubeVideos: YouTubeVideo[] = [];

        // Mapear categorias para termos de busca no YouTube
        const categorySearchTerms: { [key: string]: string } = {
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

        // Buscar vídeos do YouTube baseado nos filtros
        if (selectedGenre && categorySearchTerms[selectedGenre]) {
          // Buscar por gênero/categoria específica
          youtubeVideos = await searchYouTubeVideos({
            query: categorySearchTerms[selectedGenre],
            maxResults: 24,
            order: sortBy === 'rating' ? 'viewCount' : sortBy === 'title' ? 'relevance' : 'date',
          });
        } else if (selectedCategory === 'filmes') {
          // Buscar filmes
          youtubeVideos = await searchYouTubeVideos({
            query: 'filmes completos dublados',
            maxResults: 24,
            order: sortBy === 'rating' ? 'viewCount' : sortBy === 'title' ? 'relevance' : 'date',
          });
        } else if (selectedCategory === 'series') {
          // Buscar séries
          youtubeVideos = await searchYouTubeVideos({
            query: 'séries completas dubladas',
            maxResults: 24,
            order: sortBy === 'rating' ? 'viewCount' : sortBy === 'title' ? 'relevance' : 'date',
          });
        } else if (selectedCategory === 'documentarios') {
          // Buscar documentários
          youtubeVideos = await searchYouTubeVideos({
            query: 'documentários completos',
            maxResults: 24,
            order: sortBy === 'rating' ? 'viewCount' : sortBy === 'title' ? 'relevance' : 'date',
          });
        } else if (selectedCategory === 'podcasts') {
          // Buscar podcasts
          youtubeVideos = await searchYouTubeVideos({
            query: 'podcasts completos',
            maxResults: 24,
            order: sortBy === 'rating' ? 'viewCount' : sortBy === 'title' ? 'relevance' : 'date',
          });
        } else {
          // Buscar vídeos populares
          youtubeVideos = await getPopularVideos(24);
        }

        // Para cada vídeo do YouTube, criar/sincronizar com o banco e verificar desbloqueio
        const contentWithDetails = await Promise.all(
          youtubeVideos.map(async (youtubeVideo) => {
            try {
              // Buscar ou criar mídia no banco
              const mediaResponse = await apiService.findOrCreateMediaByYoutubeId({
                youtube_id: youtubeVideo.id,
                title: youtubeVideo.title,
                description: youtubeVideo.description,
                poster_url: youtubeVideo.thumbnail,
                type: selectedCategory === 'series' ? 'series' : 'movie',
              });

              const media = mediaResponse.media;
              const mediaId = media.id;

              // Verificar se está desbloqueado (sem tentar desbloquear)
              let isUnlocked = false;
              try {
                // Buscar mídias desbloqueadas do usuário
                const unlockedMedia = await apiService.getUnlockedMedia();
                isUnlocked = unlockedMedia.some((m: any) => m.id === mediaId);
              } catch (error) {
                // Se não conseguir verificar, assume bloqueado
                isUnlocked = false;
              }

              return {
                id: mediaId,
                youtube_id: youtubeVideo.id,
                title: youtubeVideo.title,
                description: youtubeVideo.description,
                thumbnail: youtubeVideo.thumbnail,
                rating: media.rating || 0,
                views: youtubeVideo.viewCount ? parseInt(youtubeVideo.viewCount) : 0,
                is_unlocked: isUnlocked,
                youtubeDetails: youtubeVideo,
              };
            } catch (error) {
              console.error(`Erro ao processar vídeo ${youtubeVideo.id}:`, error);
              // Retornar vídeo bloqueado mesmo se houver erro
              return {
                id: null,
                youtube_id: youtubeVideo.id,
                title: youtubeVideo.title,
                description: youtubeVideo.description,
                thumbnail: youtubeVideo.thumbnail,
                rating: 0,
                views: youtubeVideo.viewCount ? parseInt(youtubeVideo.viewCount) : 0,
                is_unlocked: false,
                youtubeDetails: youtubeVideo,
              };
            }
          })
        );

        // Ordenar se necessário (will apply sorting on contentWithDetails)
        let sortedContent = contentWithDetails;

        // Agora, para cada item bloqueado, buscar 2-4 vídeos diferentes para requisitos de desbloqueio
        const usedYoutubeIds = new Set<string>();
        const contentWithCandidates = await Promise.all(
          sortedContent.map(async (c) => {
            if (c.is_unlocked) return c;

            try {
              // Obter categorias da mídia
              const categories = await apiService.getMediaCategories(c.id.toString());
              const categoryNames = (categories || []).map((cat: any) => cat.name);

              let candidatePool: YouTubeVideo[] = [];
              // Para cada categoria, buscar 12 resultados e misturá-los
              for (const catName of categoryNames) {
                let query = catName;
                // Usar mapeamento de pesquisa quando disponível
                if (categorySearchTerms[catName]) query = categorySearchTerms[catName];
                const videos = await searchYouTubeVideos({ query, maxResults: 12, order: 'relevance' });
                candidatePool = candidatePool.concat(videos);
              }

              // Se não houver categorias, buscar por gênero geral
              if (candidatePool.length === 0) {
                candidatePool = await getPopularVideos(12);
              }

              // Filtrar com base nos usados e decidir 2-4 itens únicos
              const uniquePool = candidatePool.filter((v) => !usedYoutubeIds.has(v.id));
              // Caso não haja suficientes únicos, liberar o filtro (aceitar repetidos)
              const poolToChooseFrom = uniquePool.length >= 4 ? uniquePool : candidatePool;

              const pickAmount = Math.floor(Math.random() * 3) + 2; // 2 to 4
              // Shuffle poolToChooseFrom and pick first N
              const shuffled = poolToChooseFrom.sort(() => Math.random() - 0.5);
              const candidates = shuffled.slice(0, pickAmount);

              // Marcar como usados
              for (const cand of candidates) usedYoutubeIds.add(cand.id);

              return {
                ...c,
                unlockCandidates: candidates,
              };
            } catch (err) {
              console.error('Erro ao buscar candidatos de desbloqueio:', err);
              return c;
            }
          })
        );

        // Ordenar se necessário
        let sortedContent = contentWithDetails;
        if (sortBy === 'title') {
          sortedContent = [...contentWithDetails].sort((a, b) => {
            const comparison = a.title.localeCompare(b.title);
            return sortDir === 'asc' ? comparison : -comparison;
          });
        } else if (sortBy === 'rating') {
          sortedContent = [...contentWithDetails].sort((a, b) => {
            const comparison = a.rating - b.rating;
            return sortDir === 'asc' ? comparison : -comparison;
          });
        }

        setContent(contentWithCandidates.length ? contentWithCandidates : sortedContent);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [selectedCategory, selectedGenre, sortBy, sortDir]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/imgs/Logo_Origin.png"
            alt="ConnectFlix"
            width={44}
            height={44}
            className="h-11 w-auto"
          />
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2"><Compass size={36} /> Explorador</h1>
            <p className="text-gray-400">Descubra novos filmes e séries</p>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {typeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat.toLowerCase() as any)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.toLowerCase()
                  ? 'bg-white text-black font-semibold'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedGenre(selectedGenre === category.name ? null : category.name)}
              className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap ${
                selectedGenre === category.name
                  ? 'bg-white text-black font-semibold'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 mb-8">
          <label className="text-gray-400">Ordenar:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white"
          >
            <option value="created_at">Novidades</option>
            <option value="rating">Melhor Avaliado</option>
            <option value="title">Título (A-Z)</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            title={sortDir === 'asc' ? 'Crescente' : 'Decrescente'}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
          <button className="ml-auto p-2 hover:bg-gray-800 rounded transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader size={48} className="mx-auto mb-4 text-red-600 animate-spin" />
              <p className="text-gray-400">Carregando conteúdo...</p>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Compass size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nenhum conteúdo encontrado</p>
              <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.map((item) => {
              if (item.is_unlocked && item.youtube_id && item.youtubeDetails) {
                // Vídeo desbloqueado - usar VideoCard normal
                return (
                  <VideoCard
                    key={item.id}
                    video={item.youtubeDetails}
                    showPlayButton={true}
                    viewCount={true}
                  />
                );
              } else if (item.is_unlocked && item.youtube_id) {
                // Vídeo desbloqueado mas sem detalhes do YouTube - criar card básico
                return (
                  <Link key={item.id} href={`/media/${item.youtube_id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg aspect-video overflow-hidden">
                        {item.thumbnail && (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-red-600 hover:bg-red-700 rounded-full p-3">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
                          {item.title}
                        </h3>
                        {item.rating > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            ⭐ {item.rating}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              } else {
                // Vídeo bloqueado - usar LockedVideoCard
                return (
                  <div key={item.youtube_id || item.id}>
                    <LockedVideoCard
                      title={item.title}
                      thumbnail={item.thumbnail}
                      rating={item.rating}
                      views={item.views}
                      onClick={() => {
                        // Abrir modal com requisitos
                        if (item.id) {
                          setSelectedLockedMedia({
                            id: item.id.toString(),
                            title: item.title,
                          });
                          setIsModalOpen(true);
                        } else {
                          // Se não tem ID ainda, tentar criar e depois abrir modal
                          (async () => {
                            try {
                              const mediaResponse = await apiService.findOrCreateMediaByYoutubeId({
                                youtube_id: item.youtube_id,
                                title: item.title,
                                description: item.description,
                                poster_url: item.thumbnail,
                                type: selectedCategory === 'series' ? 'series' : 'movie',
                              });
                              if (mediaResponse.media?.id) {
                                setSelectedLockedMedia({
                                  id: mediaResponse.media.id.toString(),
                                  title: item.title,
                                });
                                setIsModalOpen(true);
                              }
                            } catch (error) {
                              console.error('Erro ao criar mídia:', error);
                              alert('Não foi possível abrir os requisitos de desbloqueio. Tente novamente.');
                            }
                          })();
                        }
                      }}
                    />
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Info */}
        {!loading && content.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Mostrando {content.length} {content.length === 1 ? 'resultado' : 'resultados'}
              {selectedGenre && ` para "${selectedGenre}"`}
            </p>
          </div>
        )}

        {/* Unlock Requirements Modal */}
        {selectedLockedMedia && (
          <UnlockRequirementsModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedLockedMedia(null);
            }}
            mediaId={selectedLockedMedia.id}
            mediaTitle={selectedLockedMedia.title}
            onUnlocked={() => {
              // Recarregar conteúdo após desbloqueio
              window.location.reload();
            }}
          />
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
