'use client';

import Navigation from '@/app/components/Navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Star, Trophy, Zap, Clock } from 'lucide-react';

export default function Rankings() {
  const [selectedTab, setSelectedTab] = useState<'geral' | 'xp' | 'cards' | 'tempo'>('geral');

  const rankingData = [
    { rank: 1, name: 'José da Silva', username: '@josedsilva', level: 999, xp: 15563, cards: 158, hours: 269 },
    { rank: 2, name: 'José da Silva', username: '@josedsilva', level: 999, xp: 15563, cards: 158, hours: 269 },
    { rank: 3, name: 'José da Silva', username: '@josedsilva', level: 999, xp: 15563, cards: 158, hours: 269 },
    { rank: 4, name: 'José da Silva', username: '@josedsilva', level: 999, xp: 1050563, cards: 158, hours: 269 },
    { rank: 5, name: 'José da Silva', username: '@josedsilva', level: 999, xp: 15563, cards: 158, hours: 269 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2"><Trophy size={36} /> Ranking</h1>
          <p className="text-gray-400">Ranking Nacional</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <select className="border-transparent bg-gray-900/50 rounded px-4 py-2 text-white">
            <option>Nacional</option>
            <option>Regional</option>
          </select>
          <select className="border-transparent bg-gray-900/50 rounded px-4 py-2 text-white">
            <option>Esta Semana</option>
            <option>Este Mês</option>
            <option>Este Ano</option>
          </select>
        </div>

        {/* Top 3 */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 order-first sm:order-2 sm:pt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold text-gray-400">#2</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mx-auto mb-4 flex items-center justify-center">👤</div>
              <p className="font-bold">José da Silva</p>
              <p className="text-gray-400 text-sm">@josedsilva</p>
              <p className="text-xs bg-yellow-600/50 px-2 py-1 rounded inline-block mt-2">Level 999</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-400">15 563 <span className="text-gray-500">XP</span></p>
              <p className="text-gray-400">158 <span className="text-gray-500">Cards</span></p>
              <p className="text-gray-400">269 <span className="text-gray-500">Horas</span></p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-6 sm:-mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold text-white">#1</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center text-2xl">👤</div>
              <p className="font-bold text-lg">José da Silva</p>
              <p className="text-gray-800 text-sm">@josedsilva</p>
              <p className="text-xs bg-purple-600 px-3 py-1 rounded inline-block mt-2 font-bold">Level 999</p>
            </div>
            <div className="mt-4 text-sm text-center font-semibold">
              <p>13 563 <span className="text-gray-800">XP</span></p>
              <p>158 <span className="text-gray-800">Cards</span></p>
              <p>269 <span className="text-gray-800">Horas</span></p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-4xl font-bold">#3</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center">👤</div>
              <p className="font-bold">José da Silva</p>
              <p className="text-gray-300 text-sm">@josedsilva</p>
              <p className="text-xs bg-amber-700/50 px-2 py-1 rounded inline-block mt-2">Level 999</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-200">15 563 <span className="text-gray-400">XP</span></p>
              <p className="text-gray-200">158 <span className="text-gray-400">Cards</span></p>
              <p className="text-gray-200">269 <span className="text-gray-400">Horas</span></p>
            </div>
          </div>
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
          {rankingData.map((user) => (
            <div key={user.rank} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-400 w-8">#{user.rank}</p>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">👤</div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.username}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="font-bold">{user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">XP</p>
                    <p className="font-bold">{user.xp.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Cards</p>
                    <p className="font-bold">{user.cards}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Horas</p>
                    <p className="font-bold">{user.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
