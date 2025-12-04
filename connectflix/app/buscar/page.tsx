'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Trash2, TrendingUp, Tv, Loader } from 'lucide-react';
import VideoCard from '@/app/components/VideoCard';
import {
  searchYouTubeVideos,
  searchVideosByGenre,
  getPopularVideos,
  YouTubeVideo,
} from '@/lib/youtubeService';
import apiService from '@/lib/apiService';

export default function Buscar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularVideos, setPopularVideos] = useState<YouTubeVideo[]>([]);

  const genres = ['Ação', 'Comédia', 'Drama', 'Sci-fi', 'Terror', 'Romance', 'Documentário', 'Animação'];

  // Load popular videos on mount
  useEffect(() => {
    const loadPopularVideos = async () => {
      try {
        const videos = await getPopularVideos(8);
        setPopularVideos(videos);
      } catch (error) {
        console.error('Erro ao carregar vídeos populares:', error);
      }
    };

    loadPopularVideos();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const results = await searchYouTubeVideos({
        query,
        maxResults: 24,
      });

      setSearchResults(results);

      // Registrar busca no backend se autenticado
      if (apiService.isAuthenticated()) {
        try {
          await apiService.searchMedia(query);
        } catch (error) {
          console.log('Busca não registrada no backend');
        }
      }

      // Add to recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== query);
        return [query, ...filtered].slice(0, 5);
      });
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSearch = async (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSelectedGenre(genre);
      setHasSearched(true);

      const results = await searchVideosByGenre(genre, 24);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar por gênero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const deleteRecentSearch = (query: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== query));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <h1 className="text-4xl font-bold mb-8">Buscar Vídeos</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar filmes, séries, documentários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !hasSearched && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Buscas Recentes
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 group"
                >
                  {item}
                  <Trash2
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecentSearch(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Genres Section - Always visible */}
        {!hasSearched && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Explorar por Gênero</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSearch(genre)}
                  className={`p-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                    selectedGenre === genre
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                      : 'bg-gradient-to-br from-purple-600 to-red-600 text-white hover:shadow-lg hover:shadow-purple-600/50'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Popular Videos Section - Show when not searching */}
        {!hasSearched && popularVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={24} /> Vídeos Em Alta
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} viewCount={true} />
              ))}
            </div>
          </section>
        )}

        {/* Search Results */}
        {hasSearched && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedGenre ? `Resultados para "${selectedGenre}"` : `Resultados para "${searchQuery}"`}
              </h2>
              {loading && (
                <div className="flex items-center gap-2 text-red-600">
                  <Loader size={20} className="animate-spin" />
                  Carregando...
                </div>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((video) => (
                  <VideoCard key={video.id} video={video} viewCount={true} />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <Tv size={48} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-400 text-lg">Nenhum resultado encontrado</p>
                  <p className="text-gray-500 text-sm mt-2">Tente usar palavras-chave diferentes</p>
                </div>
              )
            )}
          </section>
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
