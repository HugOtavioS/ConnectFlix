'use client';

import Navigation from '@/app/components/Navigation';
import { RadioIcon, TrendingUp, Tv } from 'lucide-react';

export default function Radio() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8"><RadioIcon className="inline-block mr-2" size={36} /> Rádio</h1>

        {/* Em Alta Agora */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Em Alta Agora</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['FM', 'Rádio Band', 'Jovem Pblbl'].map((radio, idx) => (
              <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-colors">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center relative">
                  <span className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs font-bold">LIVE</span>
                  <p className="text-lg font-bold">{radio}</p>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm"><TrendingUp size={16} className="inline mr-1" /> 5.236 ouvindo</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Todas As Estações */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Todas As Estações</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-colors cursor-pointer">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center relative">
                  {idx === 4 && (
                    <span className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs font-bold">LIVE</span>
                  )}
                  <p className="text-lg font-bold">Lorem ipsum</p>
                </div>
                <div className="p-3">
                  <p className="text-gray-400 text-xs"><TrendingUp size={14} className="inline mr-1" /> 0.000 ouvindo</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gêneros Populares */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Gêneros Populares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Ação', 'Comédia', 'Drama', 'Sci-fi', 'Terror', 'Comance', 'Documentário', 'Animação'].map((genre) => (
              <div key={genre} className="bg-gradient-to-br from-purple-600 to-red-600 p-4 rounded-lg text-center hover:shadow-lg hover:shadow-purple-600/50 transition-all">
                <Tv size={32} className="inline-block mb-2" />
                <p className="font-semibold text-sm mt-2">{genre}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
