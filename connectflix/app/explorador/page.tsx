'use client';

import Navigation from '@/app/components/Navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Compass, Settings, Lock, Star, Eye } from 'lucide-react';

export default function Explorador() {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'filmes' | 'series' | 'documentarios' | 'podcasts'>('todos');

  const categories = ['Todos', 'Filmes', 'Séries', 'Documentários', 'Podcasts'];
  const genres = ['Ação', 'Sci-Fi', 'Drama', 'Comédia', 'Horror', 'Suspense', 'Documentário', 'Animado'];

  const content = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: 'Cosmic Odyssey',
    rating: 4.8,
    views: 25,
    locked: i === 3 || i === 7,
  }));

  return (
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

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
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
          {genres.map((genre) => (
            <button
              key={genre}
              className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors"
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 mb-8">
          <label className="text-gray-400">Ordenar:</label>
          <select className="bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white">
            <option>Recomendados</option>
            <option>Populares</option>
            <option>Novidades</option>
            <option>Melhor Avaliado</option>
          </select>
          <button className="ml-auto p-2 hover:bg-gray-800 rounded transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden hover:shadow-lg hover:shadow-purple-600/50 transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                {item.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <Lock size={40} />
                  </div>
                )}
                <div className="text-center z-0">
                  <p className="font-bold">Cosmic Odyssey</p>
                </div>
              </div>
              <div className="mt-3 group-hover:text-white transition-colors">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Star size={14} className="inline" /> {item.rating} • <Eye size={14} className="inline" /> {item.views}k views
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Carregar Mais
          </button>
        </div>
      </main>
    </div>
  );
}
