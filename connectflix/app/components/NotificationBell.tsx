'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, User, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      loadNotifications();
      loadUnreadCount();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(() => {
        loadUnreadCount();
        if (isOpen) {
          loadNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(false, 1, 10);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await apiService.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
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

  const handleAcceptConnection = async (notification: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.data?.connection_id) return;
    
    setProcessing(notification.id);
    try {
      await apiService.acceptConnection(notification.data.connection_id.toString());
      await apiService.markNotificationAsRead(notification.id);
      
      // Atualizar notificações
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Recarregar notificações após um momento
      setTimeout(() => {
        loadNotifications();
        loadUnreadCount();
      }, 1000);
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      alert('Erro ao aceitar conexão');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConnection = async (notification: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.data?.connection_id) return;
    
    setProcessing(notification.id);
    try {
      await apiService.rejectConnection(notification.data.connection_id.toString());
      await apiService.markNotificationAsRead(notification.id);
      
      // Atualizar notificações
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Recarregar notificações após um momento
      setTimeout(() => {
        loadNotifications();
        loadUnreadCount();
      }, 1000);
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
      alert('Erro ao rejeitar conexão');
    } finally {
      setProcessing(null);
    }
  };

  const getNotificationLink = (notification: any) => {
    // Para conexões pendentes, não redirecionar automaticamente - mostrar ações
    if (notification.type === 'connection_request') {
      return null; // Não será um link clicável
    }
    if (notification.data?.from_user_id) {
      return `/users/${notification.data.from_user_id}`;
    }
    return '/notificacoes';
  };

  if (!apiService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const isConnectionRequest = notification.type === 'connection_request';
                  const isProcessing = processing === notification.id;
                  
                  const NotificationContent = (
                    <div className={`p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                      !notification.read ? 'bg-gray-800/50' : ''
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Ações para conexão pendente */}
                          {isConnectionRequest && notification.data?.connection_id && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={(e) => handleAcceptConnection(notification, e)}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <CheckCircle size={14} />
                                Aceitar
                              </button>
                              <button
                                onClick={(e) => handleRejectConnection(notification, e)}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <XCircle size={14} />
                                Recusar
                              </button>
                              {notification.data?.from_user_id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/users/${notification.data.from_user_id}`);
                                    setIsOpen(false);
                                  }}
                                  className="px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 rounded transition-colors flex items-center justify-center"
                                  title="Ver perfil"
                                >
                                  <User size={14} />
                                </button>
                              )}
                            </div>
                          )}
                          
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!notification.read && !isConnectionRequest && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
                            title="Marcar como lida"
                          >
                            <Check size={16} className="text-green-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  );

                  if (link) {
                    return (
                      <Link
                        key={notification.id}
                        href={link}
                        onClick={() => setIsOpen(false)}
                      >
                        {NotificationContent}
                      </Link>
                    );
                  }

                  return (
                    <div key={notification.id}>
                      {NotificationContent}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 text-center">
              <Link
                href="/notificacoes"
                onClick={() => setIsOpen(false)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

