'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ArrowLeft, Users, Loader } from 'lucide-react';
import UserCard from '@/app/components/UserCard';
import apiService from '@/lib/apiService';
import Link from 'next/link';

export default function BuscarUsuarios() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    country: '',
    min_level: '',
    max_level: '',
    min_xp: '',
    max_xp: '',
    order_by: 'username' as 'username' | 'level' | 'xp' | 'created_at',
    order_dir: 'asc' as 'asc' | 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, []);

  const performSearch = async (page: number = 1) => {
    try {
      setLoading(true);

      const searchFilters: any = {
        limit: 20,
        page,
      };

      if (query.trim()) {
        searchFilters.q = query.trim();
      }

      // Adicionar filtros apenas se preenchidos
      if (filters.city) searchFilters.city = filters.city;
      if (filters.state) searchFilters.state = filters.state;
      if (filters.country) searchFilters.country = filters.country;
      if (filters.min_level) searchFilters.min_level = parseInt(filters.min_level);
      if (filters.max_level) searchFilters.max_level = parseInt(filters.max_level);
      if (filters.min_xp) searchFilters.min_xp = parseInt(filters.min_xp);
      if (filters.max_xp) searchFilters.max_xp = parseInt(filters.max_xp);
      if (filters.order_by) searchFilters.order_by = filters.order_by;
      if (filters.order_dir) searchFilters.order_dir = filters.order_dir;

      const response = await apiService.searchUsersAdvanced(searchFilters);
      
      setUsers(response.data || []);
      setTotal(response.total || 0);
      setCurrentPage(response.current_page || 1);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      state: '',
      country: '',
      min_level: '',
      max_level: '',
      min_xp: '',
      max_xp: '',
      order_by: 'username',
      order_dir: 'asc',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'username' && value !== 'asc'
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Voltar para Busca
            </Link>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Users size={36} /> Buscar Usuários
            </h1>
            <p className="text-gray-400 mt-2">Encontre outros usuários da plataforma</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="Buscar por username ou email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/50 transition-all"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  showFilters || hasActiveFilters
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <Filter size={20} />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-white text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Search size={20} />
                Buscar
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Filtros Avançados</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <X size={16} />
                    Limpar Filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Região */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Estado</label>
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    placeholder="Ex: SP"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">País</label>
                  <input
                    type="text"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    placeholder="Ex: Brasil"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Level Mínimo</label>
                  <input
                    type="number"
                    value={filters.min_level}
                    onChange={(e) => setFilters({ ...filters, min_level: e.target.value })}
                    placeholder="Ex: 1"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Level Máximo</label>
                  <input
                    type="number"
                    value={filters.max_level}
                    onChange={(e) => setFilters({ ...filters, max_level: e.target.value })}
                    placeholder="Ex: 100"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                {/* XP */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">XP Mínimo</label>
                  <input
                    type="number"
                    value={filters.min_xp}
                    onChange={(e) => setFilters({ ...filters, min_xp: e.target.value })}
                    placeholder="Ex: 0"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">XP Máximo</label>
                  <input
                    type="number"
                    value={filters.max_xp}
                    onChange={(e) => setFilters({ ...filters, max_xp: e.target.value })}
                    placeholder="Ex: 100000"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                  <select
                    value={filters.order_by}
                    onChange={(e) => setFilters({ ...filters, order_by: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="username">Username</option>
                    <option value="level">Level</option>
                    <option value="xp">XP</option>
                    <option value="created_at">Data de Cadastro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Direção</label>
                  <select
                    value={filters.order_dir}
                    onChange={(e) => setFilters({ ...filters, order_dir: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="asc">Crescente</option>
                    <option value="desc">Decrescente</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader size={48} className="mx-auto mb-4 text-purple-600 animate-spin" />
                <p className="text-gray-400">Buscando usuários...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Users size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">Nenhum usuário encontrado</p>
                <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros ou a busca</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-400 text-sm">
                Encontrados {total} {total === 1 ? 'usuário' : 'usuários'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      performSearch(newPage);
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      performSearch(newPage);
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

