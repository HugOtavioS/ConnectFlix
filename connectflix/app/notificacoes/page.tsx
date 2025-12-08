'use client';

import Navigation from '@/app/components/Navigation';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader, Users } from 'lucide-react';
import Link from 'next/link';
import apiService from '@/lib/apiService';

export default function Notificacoes() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [currentPage, showUnreadOnly]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(showUnreadOnly, currentPage, 20);
      setNotifications(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await apiService.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contagem:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      alert('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return '👤';
      case 'connection_accepted':
        return '✅';
      case 'connection_rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  const handleAcceptConnection = async (notification: any) => {
    if (!notification.data?.connection_id) return;
    
    try {
      await apiService.acceptConnection(notification.data.connection_id.toString());
      await apiService.markNotificationAsRead(notification.id);
      
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Recarregar notificações
      setTimeout(() => {
        loadNotifications();
        loadUnreadCount();
      }, 1000);
      
      alert('Conexão aceita!');
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      alert('Erro ao aceitar conexão');
    }
  };

  const handleRejectConnection = async (notification: any) => {
    if (!notification.data?.connection_id) return;
    
    try {
      await apiService.rejectConnection(notification.data.connection_id.toString());
      await apiService.markNotificationAsRead(notification.id);
      
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Recarregar notificações
      setTimeout(() => {
        loadNotifications();
        loadUnreadCount();
      }, 1000);
      
      alert('Conexão rejeitada');
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
      alert('Erro ao rejeitar conexão');
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.type === 'connection_request') {
      return null; // Não será um link clicável - terá ações
    }
    if (notification.data?.from_user_id) {
      return `/users/${notification.data.from_user_id}`;
    }
    return '#';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
              <Bell size={36} /> Notificações
            </h1>
            <p className="text-gray-400">
              {unreadCount > 0 
                ? `${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                : 'Todas as notificações foram lidas'}
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowUnreadOnly(!showUnreadOnly);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  showUnreadOnly
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Não lidas
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                <CheckCheck size={18} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader size={48} className="mx-auto mb-4 text-purple-600 animate-spin" />
                <p className="text-gray-400">Carregando notificações...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Bell size={64} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  {showUnreadOnly ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-8">
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const isConnectionRequest = notification.type === 'connection_request';
                  
                  return (
                    <div
                      key={notification.id}
                      className={`bg-gray-900/50 border rounded-lg p-4 hover:bg-gray-900 transition-colors ${
                        !notification.read ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-gray-300 mb-2">
                                {notification.message}
                              </p>
                              
                              {/* Ações para conexão pendente */}
                              {isConnectionRequest && notification.data?.connection_id && (
                                <div className="mt-3 flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleAcceptConnection(notification)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2"
                                  >
                                    <CheckCircle size={16} />
                                    Aceitar Conexão
                                  </button>
                                  <button
                                    onClick={() => handleRejectConnection(notification)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2"
                                  >
                                    <XCircle size={16} />
                                    Recusar Conexão
                                  </button>
                                  {notification.data?.from_user_id && (
                                    <Link
                                      href={`/users/${notification.data.from_user_id}`}
                                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2"
                                    >
                                      <User size={16} />
                                      Ver Perfil
                                    </Link>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                <span>{formatDate(notification.created_at)}</span>
                                {!notification.read && (
                                  <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                                    Nova
                                  </span>
                                )}
                              </div>
                            </div>
                            {!notification.read && !isConnectionRequest && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex-shrink-0 p-2 hover:bg-gray-800 rounded transition-colors"
                                title="Marcar como lida"
                              >
                                <Check size={20} className="text-green-400" />
                              </button>
                            )}
                          </div>
                          {link && notification.data?.from_user_id && !isConnectionRequest && (
                            <Link
                              href={link}
                              className="inline-block mt-3 text-purple-400 hover:text-purple-300 text-sm font-semibold"
                            >
                              Ver perfil →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
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

