'use client';

import Navigation from '@/app/components/Navigation';
import { useState } from 'react';
import { Users, MessageCircle, Eye, Users2 } from 'lucide-react';

export default function Conexoes() {
  const [activeTab, setActiveTab] = useState<'minhas' | 'pendentes' | 'sugestoes'>('minhas');

  const connections = [
    { id: 1, name: 'José da Silva', username: '@josedsilva', level: 999, commonInterests: 12, interests: ['Sci-fi', 'Ação', 'Drama'] },
    { id: 2, name: 'José da Silva', username: '@josedsilva', level: 999, commonInterests: 12, interests: ['Sci-fi', 'Ação', 'Drama'] },
    { id: 3, name: 'José da Silva', username: '@josedsilva', level: 999, commonInterests: 12, interests: ['Sci-fi', 'Ação', 'Drama'] },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            <Users size={36} /> Conexões
          </h1>
          <p className="text-gray-400 mb-8">3 Conexões Ativas</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar conexões ..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-400">3</p>
            <p className="text-gray-300 text-sm mt-2">Conexões</p>
          </div>
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">1</p>
            <p className="text-gray-300 text-sm mt-2">Pendentes</p>
          </div>
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-400">2</p>
            <p className="text-gray-300 text-sm mt-2">Sugestões</p>
          </div>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-400">24</p>
            <p className="text-gray-300 text-sm mt-2">Interesses em Comum</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['minhas', 'pendentes', 'sugestoes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'minhas' && 'Minhas Conexões (3)'}
              {tab === 'pendentes' && 'Pendentes (1)'}
              {tab === 'sugestoes' && 'Sugestões'}
            </button>
          ))}
        </div>

        {/* Connections List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <div key={conn.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl flex-shrink-0">
                  <Users2 size={32} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{conn.name}</p>
                  <p className="text-gray-400 text-sm">{conn.username}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-purple-600/50 px-3 py-1 rounded-full text-xs font-bold">
                      Level {conn.level}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2"><Users size={14} className="inline mr-1" /> {conn.commonInterests} Conexões em comum</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex flex-wrap gap-2 mb-4">
                  {conn.interests.map((interest) => (
                    <span key={interest} className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Mensagem
                  </button>
                  <button className="flex-1 bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Eye size={18} /> Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
