'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Trophy, Zap, Clock } from 'lucide-react';
import apiService from '@/lib/apiService';

export default function Rankings() {
  const [selectedTab, setSelectedTab] = useState<'geral' | 'xp' | 'cards' | 'tempo'>('geral');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true);

        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          setRankingData([]);
          return;
        }

        // Carregar ranking nacional
        const rankings = await apiService.getNationalRanking(period, 10);
        setRankingData(rankings);
      } catch (error) {
        console.error('Erro ao carregar rankings:', error);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, [period]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2"><Trophy size={36} /> Ranking</h1>
          <p className="text-gray-400">Ranking Nacional</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="border-transparent bg-gray-900/50 rounded px-4 py-2 text-white"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="all">Todos os Tempos</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Carregando rankings...</p>
          </div>
        ) : rankingData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Nenhum dados de ranking disponível</p>
          </div>
        ) : (
          <>
        {/* Top 3 */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 2nd Place */}
          {rankingData[1] && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 order-first sm:order-2 sm:pt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold text-gray-400">#2</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mx-auto mb-4 flex items-center justify-center">👤</div>
              <p className="font-bold">{rankingData[1].name}</p>
              <p className="text-gray-400 text-sm">@{rankingData[1].username}</p>
              <p className="text-xs bg-yellow-600/50 px-2 py-1 rounded inline-block mt-2">Level {rankingData[1].level}</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-400">{rankingData[1].experience || 0} <span className="text-gray-500">XP</span></p>
              <p className="text-gray-400">{rankingData[1].collectibles_count || 0} <span className="text-gray-500">Cards</span></p>
              <p className="text-gray-400">{rankingData[1].total_watch_time || 0} <span className="text-gray-500">Horas</span></p>
            </div>
          </div>
          )}

          {/* 1st Place */}
          {rankingData[0] && (
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-6 sm:-mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold text-white">#1</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center text-2xl">👤</div>
              <p className="font-bold text-lg">{rankingData[0].name}</p>
              <p className="text-gray-800 text-sm">@{rankingData[0].username}</p>
              <p className="text-xs bg-purple-600 px-3 py-1 rounded inline-block mt-2 font-bold">Level {rankingData[0].level}</p>
            </div>
            <div className="mt-4 text-sm text-center font-semibold">
              <p>{rankingData[0].experience || 0} <span className="text-gray-800">XP</span></p>
              <p>{rankingData[0].collectibles_count || 0} <span className="text-gray-800">Cards</span></p>
              <p>{rankingData[0].total_watch_time || 0} <span className="text-gray-800">Horas</span></p>
            </div>
          </div>
          )}

          {/* 3rd Place */}
          {rankingData[2] && (
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold">#3</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center">👤</div>
              <p className="font-bold">{rankingData[2].name}</p>
              <p className="text-gray-300 text-sm">@{rankingData[2].username}</p>
              <p className="text-xs bg-amber-700/50 px-2 py-1 rounded inline-block mt-2">Level {rankingData[2].level}</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-200">{rankingData[2].experience || 0} <span className="text-gray-400">XP</span></p>
              <p className="text-gray-200">{rankingData[2].collectibles_count || 0} <span className="text-gray-400">Cards</span></p>
              <p className="text-gray-200">{rankingData[2].total_watch_time || 0} <span className="text-gray-400">Horas</span></p>
            </div>
          </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['geral', 'xp', 'cards', 'tempo'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'geral' && 'Geral'}
              {tab === 'xp' && 'XP'}
              {tab === 'cards' && 'Colecionáveis'}
              {tab === 'tempo' && 'Tempo Assistido'}
            </button>
          ))}
        </div>

        {/* Rankings List */}
        <div className="space-y-2">
          {rankingData.length > 3 && rankingData.slice(3).map((user: any, idx: number) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-400 w-8">#{idx + 4}</p>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">👤</div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="font-bold">{user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">XP</p>
                    <p className="font-bold">{(user.experience || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Cards</p>
                    <p className="font-bold">{user.collectibles_count || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Horas</p>
                    <p className="font-bold">{user.total_watch_time || 0}</p>
                  </div>
                </div>
              </div>
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
