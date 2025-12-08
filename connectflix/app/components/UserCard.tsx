'use client';

import Link from 'next/link';
import { Users, MapPin, Trophy, Zap } from 'lucide-react';

interface UserCardProps {
  user: {
    id: number | string;
    username: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    level?: number;
    xp?: number;
    collectibles_count?: number;
    media_watched?: number;
    total_watch_time?: number;
    connections_count?: number;
  };
  showStats?: boolean;
}

export default function UserCard({ user, showStats = true }: UserCardProps) {
  return (
    <Link href={`/users/${user.id}`}>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors truncate">
              {user.name || user.username}
            </h3>
            <p className="text-gray-400 text-sm">@{user.username}</p>
            
            {/* Location */}
            {(user.city || user.state) && (
              <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                <MapPin size={12} />
                <span>
                  {user.city && user.state 
                    ? `${user.city}, ${user.state}`
                    : user.city || user.state}
                  {user.country && ` - ${user.country}`}
                </span>
              </div>
            )}

            {/* Level Badge */}
            {user.level && (
              <div className="mt-2">
                <span className="inline-block bg-purple-600/50 px-2 py-1 rounded text-xs font-bold">
                  Level {user.level}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
            {user.xp !== undefined && (
              <div className="flex items-center gap-1 text-gray-400">
                <Zap size={14} />
                <span>{(user.xp || 0).toLocaleString()} XP</span>
              </div>
            )}
            {user.collectibles_count !== undefined && (
              <div className="flex items-center gap-1 text-gray-400">
                <Trophy size={14} />
                <span>{user.collectibles_count || 0} Cards</span>
              </div>
            )}
            {user.media_watched !== undefined && (
              <div className="flex items-center gap-1 text-gray-400">
                <Users size={14} />
                <span>{user.media_watched || 0} Assistidas</span>
              </div>
            )}
            {user.connections_count !== undefined && (
              <div className="flex items-center gap-1 text-gray-400">
                <Users size={14} />
                <span>{user.connections_count || 0} Conexões</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

