'use client';

import Navigation from '@/app/components/Navigation';
import Link from 'next/link';
import { Tv, Gamepad2, Zap, Users, TrendingUp, X, Settings, Share2 } from 'lucide-react';

export default function Perfil() {
  const user = {
    name: 'José da Silva',
    username: '@josedsilva',
    level: 999,
    xp: 15563,
    maxXp: 20000,
    cards: 158,
    hours: 269,
    avatar: '👤',
    progress: 78,
  };

  const achievements = [
    { name: 'Colecionador Iniciante', count: 10, icon: Gamepad2 },
    { name: 'Card Raro Desbloqueado', description: '4 horas atrás', icon: Zap },
    { name: 'Maratonista Consultado', description: '1 dia atrás', icon: TrendingUp },
    { name: 'Colecionador Iniciante', count: 10, icon: Tv, color: 'green' },
    { name: 'Explorador', description: 'Visitou 5 gêneros diferentes', icon: Users, color: 'green' },
    { name: 'Social', description: '50 conexões feitas', icon: Users, color: 'green' },
  ];

  const favoriteGenres = [
    { name: 'Sci-fi', percentage: 57 },
    { name: 'Ação', percentage: 69 },
    { name: 'Drama', percentage: 26 },
  ];

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
            <p className="text-3xl font-bold text-purple-400">172</p>
            <p className="text-gray-300 text-sm mt-2">Colecionáveis</p>
          </div>
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">172</p>
            <p className="text-gray-300 text-sm mt-2">Assistidas</p>
          </div>
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-400">342</p>
            <p className="text-gray-300 text-sm mt-2">Tempo Total</p>
          </div>
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-400">89</p>
            <p className="text-gray-300 text-sm mt-2">Conexões</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-purple-900/50 to-red-900/50 border border-red-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-4xl">
                {user.avatar}
              </div>
              <div>
                <p className="text-2xl font-bold">{user.name}</p>
                <p className="text-gray-400">{user.username}</p>
              </div>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Settings size={18} /> Editar
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors ml-2 flex items-center gap-2">
              <Share2 size={18} /> Compartilhar
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <p className="text-sm text-gray-300 mb-2">
              Progresso para o Level 1000
            </p>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-red-600 h-full"
                style={{ width: `${user.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {user.xp.toLocaleString()} / {user.maxXp.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {['Atividade Recente', 'Conquista', 'Estatísticas'].map((tab) => (
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
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Tv size={24} />
                <p className="font-semibold">Cosmic-Odyssey</p>
              </div>
              <p className="text-gray-400 text-sm">3 horas atrás</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 size={24} />
                <p className="font-semibold">Card Raro desbloqueado</p>
              </div>
              <p className="text-gray-400 text-sm">4 horas atrás</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={24} />
                <p className="font-semibold">Maratonista consultado</p>
              </div>
              <p className="text-gray-400 text-sm">1 dia atrás</p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Conquistas Recentes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement, idx) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-lg p-4 text-center ${
                    achievement.color === 'green'
                      ? 'bg-gradient-to-br from-purple-600 to-green-600'
                      : 'bg-gradient-to-br from-purple-600 to-red-600'
                  } hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="flex justify-center mb-2">
                    <IconComponent size={32} />
                  </div>
                  <p className="font-bold text-sm">{achievement.name}</p>
                  {achievement.description && (
                    <p className="text-xs text-gray-200 mt-1">{achievement.description}</p>
                  )}
                  {achievement.count && (
                    <p className="text-xs text-gray-200 mt-1">+{achievement.count} pontos</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Favorite Genres */}
        <section>
          <h2 className="text-xl font-bold mb-4">Gêneros Favoritos</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-4">Conteúdo Assistido</p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">Filme: <span className="font-bold">127</span></p>
                <p className="text-gray-300">Séries: <span className="font-bold">95</span></p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-4">Gêneros Favoritos</p>
              <div className="space-y-3">
                {favoriteGenres.map((genre, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">{idx + 1} {genre.name}</p>
                      <p className="text-sm text-gray-400">{genre.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
