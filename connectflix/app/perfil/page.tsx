'use client';

import Navigation from '@/app/components/Navigation';
import Link from 'next/link';
import { Tv, Gamepad2, Zap, Users, TrendingUp, X, Settings, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [userRankings, setUserRankings] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // Carregar dados do usuário, preferências e rankings
        const [userData, preferencesData, rankingsData] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getPreferences(),
          apiService.getUserRankings(),
        ]);

        setUser(userData);
        setPreferences(preferencesData);
        setUserRankings(rankingsData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Carregando perfil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Erro ao carregar dados do usuário</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Close Button */}
        <button className="mb-8 text-gray-400 hover:text-white text-2xl flex items-center gap-1">
          <X size={24} />
        </button>

        {/* User Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{user.collectibles_count || 0}</p>
            <p className="text-gray-300 text-sm mt-2">Colecionáveis</p>
          </div>
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{user.media_watched || 0}</p>
            <p className="text-gray-300 text-sm mt-2">Assistidas</p>
          </div>
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{user.total_watch_time || 0}</p>
            <p className="text-gray-300 text-sm mt-2">Tempo Total</p>
          </div>
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{user.connections_count || 0}</p>
            <p className="text-gray-300 text-sm mt-2">Conexões</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-purple-900/50 to-red-900/50 border border-red-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-4xl">
                👤
              </div>
              <div>
                <p className="text-2xl font-bold">{user.name || user.username}</p>
                <p className="text-gray-400">@{user.username}</p>
              </div>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Settings size={18} /> Editar
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors ml-2 flex items-center gap-2"
            >
              <X size={18} /> Sair
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <p className="text-sm text-gray-300 mb-2">
              Nível {user.level || 1}
            </p>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-red-600 h-full"
                style={{ width: '78%' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {(user.experience || 0).toLocaleString()} / 20000 XP
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {['Atividade Recente', 'Estatísticas'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-4 border-b-2 border-white text-white font-semibold hover:border-purple-600 transition-colors first:border-white"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            {user.recent_activities && user.recent_activities.length > 0 ? (
              user.recent_activities.map((activity: any, idx: number) => (
                <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Tv size={24} />
                    <p className="font-semibold">{activity.media_title || 'Atividade'}</p>
                  </div>
                  <p className="text-gray-400 text-sm">{activity.created_at}</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-gray-400 text-center">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </section>

        {/* Favorite Genres */}
        <section>
          <h2 className="text-xl font-bold mb-4">Gêneros Favoritos</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-4">Conteúdo Assistido</p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">Filme: <span className="font-bold">{user.movies_watched || 0}</span></p>
                <p className="text-gray-300">Séries: <span className="font-bold">{user.series_watched || 0}</span></p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-4">Categorias Favoritas</p>
              <div className="space-y-3">
                {preferences?.favorite_categories && preferences.favorite_categories.length > 0 ? (
                  preferences.favorite_categories.map((cat: any, idx: number) => (
                    <div key={idx}>
                      <p className="text-sm">{cat.name || cat}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Nenhuma preferência definida</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
