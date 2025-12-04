'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import { Gamepad2, Pin, Gift } from 'lucide-react';
import apiService from '@/lib/apiService';

export default function Cards() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollectibles = async () => {
      try {
        setLoading(true);

        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          setCards([]);
          return;
        }

        // Carregar colecionáveis do usuário
        const collectibles = await apiService.getCollectibles();
        setCards(collectibles.cards || []);
      } catch (error) {
        console.error('Erro ao carregar colecionáveis:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollectibles();
  }, []);

  const rarityColors = {
    comum: 'from-gray-500 to-gray-700',
    incomum: 'from-green-500 to-green-700',
    raro: 'from-blue-500 to-blue-700',
    épico: 'from-purple-500 to-purple-700',
    lendário: 'from-yellow-500 to-orange-700',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-2"><Gamepad2 size={36} /> Minha Coleção de Cards</h1>
        <p className="text-gray-400 mb-8">Você tem {cards.length} cards na sua coleção</p>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Carregando coleção...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Você ainda não tem nenhum card. Comece a assistir mídias para ganhar cards!</p>
          </div>
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{cards.length}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{cards.filter((c: any) => c.rarity === 'comum').length}</p>
            <p className="text-gray-400 text-sm">Comum</p>
          </div>
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{cards.filter((c: any) => c.rarity === 'raro').length}</p>
            <p className="text-gray-400 text-sm">Raro</p>
          </div>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{cards.filter((c: any) => c.rarity === 'épico').length}</p>
            <p className="text-gray-400 text-sm">Épico</p>
          </div>
          <div className="bg-orange-900/50 border border-orange-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{cards.filter((c: any) => c.rarity === 'lendário').length}</p>
            <p className="text-gray-400 text-sm">Lendário</p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card: any, idx: number) => (
            <div
              key={idx}
              onClick={() => setSelectedCard(selectedCard === idx ? null : idx)}
              className="cursor-pointer group"
            >
              <div
                className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br ${
                  rarityColors[card.rarity as keyof typeof rarityColors]
                } p-4 transition-all transform group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-600/50`}
              >
                {/* Card Content */}
                <div className="h-full flex flex-col justify-between">
                  {/* Top */}
                  <div>
                    <div className="bg-black/40 px-3 py-1 rounded inline-block text-xs font-bold">
                      {card.rarity?.toUpperCase() || 'COMUM'}
                    </div>
                  </div>

                  {/* Center Image Placeholder */}
                  <div className="flex items-center justify-center h-32">
                    <Gamepad2 size={64} />
                  </div>

                  {/* Bottom */}
                  <div>
                    <p className="font-bold text-lg">{card.title || 'Card'}</p>
                    <p className="text-sm opacity-90">Card #{(idx + 1).toString().padStart(3, '0')}</p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>

              {/* Card Info */}
              {selectedCard === idx && (
                <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <p className="font-bold mb-2">{card.title || 'Card'}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Card #{(idx + 1).toString().padStart(3, '0')} • Raridade: {card.rarity || 'comum'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                      <Pin size={18} /> Destacar
                    </button>
                    <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                      <Gift size={18} /> Presentear
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
          </>
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
