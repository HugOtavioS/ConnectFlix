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
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'atividade' | 'estatisticas'>('atividade');
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

        // Carregar dados do usuário, preferências, rankings, atividades e estatísticas
        const [userData, preferencesData, rankingsData, activitiesData, statsData] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getPreferences(),
          apiService.getUserRankings(),
          apiService.getActivities('watch').catch(() => []),
          apiService.getActivityStats().catch(() => null),
        ]);

        setUser(userData);
        setPreferences(preferencesData);
        setUserRankings(rankingsData);
        
        // Processar atividades recentes (agora já vem agrupadas por mídia do backend)
        let activitiesToProcess = [];
        if (activitiesData && activitiesData.data && Array.isArray(activitiesData.data)) {
          activitiesToProcess = activitiesData.data;
        } else if (Array.isArray(activitiesData)) {
          activitiesToProcess = activitiesData;
        }
        
        // Mapear atividades únicas (já vêm agrupadas do backend)
        const activities = activitiesToProcess.slice(0, 10).map((activity: any) => ({
          id: activity.id || `${activity.media_id}-${activity.timestamp}`,
          media_title: activity.media?.title || 'Mídia desconhecida',
          activity_type: activity.activity_type,
          duration_seconds: activity.duration_seconds,
          created_at: new Date(activity.timestamp || activity.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        
        setRecentActivities(activities);
        
        // Processar estatísticas
        if (statsData && statsData.stats) {
          setActivityStats(statsData.stats);
        }
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
            <p className="text-3xl font-bold text-green-400">
              {user.total_watch_time ? `${user.total_watch_time}h` : '0h'}
            </p>
            <p className="text-gray-300 text-sm mt-2">Tempo Total Assistido</p>
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
                className="bg-gradient-to-r from-purple-600 to-red-600 h-full transition-all"
                style={{ 
                  width: `${Math.min(((user.xp || 0) % 20000) / 20000 * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {(user.xp || 0).toLocaleString()} XP
              {user.xp && (
                <span className="text-gray-500">
                  {' '}/ {Math.ceil((user.xp || 0) / 20000) * 20000} XP (Próximo nível)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('atividade')}
            className={`px-4 py-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'atividade'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Atividade Recente
          </button>
          <button
            onClick={() => setActiveTab('estatisticas')}
            className={`px-4 py-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'estatisticas'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Estatísticas
          </button>
        </div>

        {/* Recent Activity Tab */}
        {activeTab === 'atividade' && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Tv size={24} />
                      <div className="flex-1">
                        <p className="font-semibold">{activity.media_title || 'Atividade'}</p>
                        <p className="text-gray-400 text-sm">
                          {activity.duration_seconds ? `${Math.floor(activity.duration_seconds / 60)} minutos assistidos` : 'Atividade registrada'}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">{activity.created_at}</p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-gray-400 text-center">
                  Nenhuma atividade recente
                </div>
              )}
            </div>
          </section>
        )}

        {/* Statistics Tab */}
        {activeTab === 'estatisticas' && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activityStats ? (
                <>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="font-bold mb-4 text-purple-400">Tempo Total Assistido</h3>
                    <p className="text-3xl font-bold">{activityStats.total_watch_time_hours || 0}h</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {activityStats.total_watch_time_seconds || 0} segundos
                    </p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="font-bold mb-4 text-blue-400">Mídias Assistidas</h3>
                    <p className="text-3xl font-bold">{activityStats.media_watched || 0}</p>
                    <p className="text-gray-400 text-sm mt-2">Títulos únicos</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="font-bold mb-4 text-green-400">Total de Atividades</h3>
                    <p className="text-3xl font-bold">{activityStats.total_activities || 0}</p>
                    <p className="text-gray-400 text-sm mt-2">Registros totais</p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-gray-400 text-center col-span-2">
                  Carregando estatísticas...
                </div>
              )}
            </div>
          </section>
        )}

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
