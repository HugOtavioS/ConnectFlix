'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Search, Radio, Trophy, Users, Compass, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href ? 'text-white' : 'text-gray-400 hover:text-white';
  };

  return (
    <nav className="bg-black/80 border-b border-gray-800 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <Image
              src="/imgs/Logo_Origin.png"
              alt="ConnectFlix Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <span className="text-white font-bold text-lg hidden sm:inline">ConnectFlix</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/home"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/home')}`}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Início</span>
            </Link>
            <Link
              href="/buscar"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/buscar')}`}
            >
              <Search size={18} />
              <span className="hidden sm:inline">Buscar</span>
            </Link>
            <Link
              href="/radio"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/radio')}`}
            >
              <Radio size={18} />
              <span className="hidden sm:inline">Rádio</span>
            </Link>
            <Link
              href="/rankings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/rankings')}`}
            >
              <Trophy size={18} />
              <span className="hidden sm:inline">Rankings</span>
            </Link>
            <Link
              href="/conexoes"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/conexoes')}`}
            >
              <Users size={18} />
              <span className="hidden sm:inline">Conexões</span>
            </Link>
            <Link
              href="/explorador"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/explorador')}`}
            >
              <Compass size={18} />
              <span className="hidden sm:inline">Explorador</span>
            </Link>
            <NotificationBell />
            <Link
              href="/perfil"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/perfil')}`}
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
