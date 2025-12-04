'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from './apiService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há token armazenado
        const hasToken = apiService.isAuthenticated();
        console.log('Token check - Has token:', hasToken);
        
        if (!hasToken) {
          // Sem token, redireciona para login
          console.log('No token found, redirecting to /auth');
          router.push('/auth');
          return;
        }

        // Validar token tentando buscar dados do usuário
        try {
          const user = await apiService.getCurrentUser();
          console.log('User validated:', user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido ou expirado
          console.log('Token validation failed, clearing and redirecting:', error);
          apiService.clearToken();
          router.push('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Mostrar loader enquanto verifica autenticação
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se autenticado, renderiza o conteúdo
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Se não autenticado, retorna null (será redirecionado pelo useEffect)
  return null;
}
