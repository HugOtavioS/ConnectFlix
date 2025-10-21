'use client';

import Navigation from '@/app/components/Navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Search, Trash2, TrendingUp, Tv } from 'lucide-react';

export default function Buscar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['Série de Ação', 'Sci Fi 2024', 'Filmes Premiados', 'Animação', 'Documentários'];
  const genres = ['Ação', 'Comédia', 'Drama', 'Sci-fi', 'Terror', 'Comance', 'Documentário', 'Animação'];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Buscar</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar filmes, séries, stores, gêneros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Buscas Recentes
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Cosmic Odyssey', 'Comedy', 'Comedy', 'Comedy', 'Comedy', 'Comedy'].map((item, idx) => (
              <button
                key={idx}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2"
              >
                {item}
                <Trash2 size={14} />
              </button>
            ))}
          </div>
        </section>

        {/* Trending Searches */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Buscas Em Alta
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Explorar Por Categoria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div key={genre} className="bg-gradient-to-br from-purple-600 to-red-600 p-6 rounded-lg text-center hover:shadow-lg hover:shadow-purple-600/50 transition-all cursor-pointer">
                <p className="font-bold text-lg">📻</p>
                <p className="font-semibold text-sm mt-2">{genre}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
