'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import Link from 'next/link';
import { Tv, Gamepad2, Zap, Users, TrendingUp, X, ArrowLeft, UserPlus, Check, Clock, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loadingConnection, setLoadingConnection] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // Verificar se é o próprio usuário
        const currentUser = await apiService.getCurrentUser();
        const isOwnProfile = currentUser.id.toString() === userId;
        setIsCurrentUser(isOwnProfile);

        // Carregar dados do usuário
        const userData = await apiService.getUser(userId);
        setUser(userData);

        // Carregar status de conexão se não for o próprio usuário
        if (!isOwnProfile) {
          try {
            const status = await apiService.getConnectionStatus(userId);
            setConnectionStatus(status);
          } catch (error) {
            console.error('Erro ao verificar status de conexão:', error);
            setConnectionStatus({ status: 'none', can_request: true });
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados do usuário:', error);
        if (error.response?.status === 404) {
          setError('Usuário não encontrado');
        } else {
          setError('Erro ao carregar dados do usuário');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, router]);

  const handleConnectionRequest = async () => {
    if (!userId || isCurrentUser) return;

    try {
      setLoadingConnection(true);
      await apiService.requestConnection(userId);
      
      // Atualizar status
      const status = await apiService.getConnectionStatus(userId);
      setConnectionStatus(status);
      
      alert('Pedido de conexão enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar pedido de conexão:', error);
      if (error.response?.status === 422) {
        alert(error.response?.data?.message || 'Não foi possível enviar o pedido de conexão');
      } else {
        alert('Erro ao enviar pedido de conexão');
      }
    } finally {
      setLoadingConnection(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-400">Carregando perfil...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/rankings" className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              Voltar
            </Link>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-500 font-semibold mb-2">{error || 'Usuário não encontrado'}</p>
                <Link href="/rankings" className="text-purple-400 hover:text-purple-300">
                  Voltar para Rankings
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/rankings" className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Voltar
          </Link>

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
                  {user.city && user.state && (
                    <p className="text-gray-500 text-sm mt-1">
                      {user.city}, {user.state} - {user.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Button */}
              {!isCurrentUser && (
                <div>
                  {connectionStatus?.status === 'none' || connectionStatus?.can_request ? (
                    <button
                      onClick={handleConnectionRequest}
                      disabled={loadingConnection}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingConnection ? (
                        <>
                          <Clock size={18} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Conectar
                        </>
                      )}
                    </button>
                  ) : connectionStatus?.status === 'pending_sent' ? (
                    <button
                      disabled
                      className="flex items-center gap-2 bg-yellow-600/50 text-yellow-200 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                      <Clock size={18} />
                      Pedido Enviado
                    </button>
                  ) : connectionStatus?.status === 'pending_received' ? (
                    <button
                      disabled
                      className="flex items-center gap-2 bg-blue-600/50 text-blue-200 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                      <Clock size={18} />
                      Aguardando Resposta
                    </button>
                  ) : connectionStatus?.status === 'connected' ? (
                    <button
                      disabled
                      className="flex items-center gap-2 bg-green-600/50 text-green-200 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                      <Check size={18} />
                      Conectado
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <p className="text-sm text-gray-300 mb-2">
                Nível {user.level || 1}
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-red-600 h-full"
                  style={{ width: `${Math.min(((user.xp || 0) / 20000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(user.xp || 0).toLocaleString()} / 20000 XP
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            {['Estatísticas'].map((tab) => (
              <button
                key={tab}
                className="px-4 py-4 border-b-2 border-white text-white font-semibold hover:border-purple-600 transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stats Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="font-bold mb-4">Informações do Perfil</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Username: <span className="font-bold">@{user.username}</span></p>
                  {user.city && (
                    <p className="text-gray-300">Cidade: <span className="font-bold">{user.city}</span></p>
                  )}
                  {user.state && (
                    <p className="text-gray-300">Estado: <span className="font-bold">{user.state}</span></p>
                  )}
                  {user.country && (
                    <p className="text-gray-300">País: <span className="font-bold">{user.country}</span></p>
                  )}
                </div>
              </div>
              <div>
                <p className="font-bold mb-4">Progresso</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-300">Nível</p>
                    <p className="text-2xl font-bold">{user.level || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Experiência</p>
                    <p className="text-2xl font-bold">{(user.xp || 0).toLocaleString()} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

