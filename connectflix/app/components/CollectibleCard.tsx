'use client';

import { Lock, Star, Zap, Film, Music, Users, Trophy, Award } from 'lucide-react';

interface CollectibleCardProps {
  categoryName?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked?: boolean;
  points?: number;
}

// Mapeamento de gêneros/categorias para ícones
const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return Film;
  
  const name = categoryName.toLowerCase();
  
  // Mapeamento baseado nos cards do banco
  if (name.includes('ação') || name.includes('action')) return Zap;
  if (name.includes('comédia') || name.includes('comedy')) return Music;
  if (name.includes('terror') || name.includes('horror')) return Lock;
  if (name.includes('romance') || name.includes('romantic')) return Star;
  if (name.includes('drama')) return Film;
  if (name.includes('sci-fi') || name.includes('ficção') || name.includes('science')) return Zap;
  if (name.includes('anime')) return Award;
  if (name.includes('documentário') || name.includes('documentary')) return Film;
  if (name.includes('fantasia') || name.includes('fantasy')) return Star;
  if (name.includes('suspense')) return Lock;
  if (name.includes('faroeste') || name.includes('western')) return Trophy;
  if (name.includes('musical') || name.includes('music')) return Music;
  if (name.includes('animação') || name.includes('animation')) return Film;
  if (name.includes('super-herói') || name.includes('superhero')) return Zap;
  
  return Film; // Padrão
};

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case 'common':
      return { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300' };
    case 'rare':
      return { bg: 'from-blue-400 to-blue-600', text: 'text-blue-300' };
    case 'epic':
      return { bg: 'from-purple-400 to-purple-600', text: 'text-purple-300' };
    case 'legendary':
      return { bg: 'from-yellow-400 to-orange-600', text: 'text-yellow-300' };
    default:
      return { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300' };
  }
};

export default function CollectibleCard({
  categoryName,
  rarity = 'common',
  isUnlocked = false,
  points = 0,
}: CollectibleCardProps) {
  const Icon = getCategoryIcon(categoryName);
  const colors = getRarityColor(rarity);

  return (
    <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
      {!isUnlocked ? (
        <>
          {/* Background com gradiente baseado na raridade (blur) */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-20 blur-2xl`} />
          
          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Ícone do gênero centralizado com blur */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-30 blur-xl`} />
              <Icon size={80} className={`relative ${colors.text} opacity-50`} />
            </div>
          </div>
          
          {/* Cadeado e texto */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="bg-black/50 rounded-full p-4 mb-3 backdrop-blur-sm">
              <Lock size={48} className="text-white" />
            </div>
            <p className="text-white font-semibold text-sm px-4 text-center bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
              Complete para desbloquear
            </p>
          </div>
          
          {/* Nome da categoria no rodapé */}
          {categoryName && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-center z-10 backdrop-blur-sm">
              <p className="text-white font-bold text-sm">{categoryName}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Card desbloqueado */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
            <Icon size={120} className="text-white drop-shadow-2xl" />
          </div>
          
          {/* Informações do card */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 backdrop-blur-sm">
            {categoryName && (
              <p className="text-white font-bold text-lg mb-2">{categoryName}</p>
            )}
            {points > 0 && (
              <p className="text-yellow-400 font-semibold text-sm">+{points} XP</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

