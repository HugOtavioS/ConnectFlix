'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Se não autenticado, ir para login
    if (!apiService.isAuthenticated()) {
      router.push('/auth');
    } else {
      // Se autenticado, ir para home
      router.push('/home');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-400">Redirecionando...</p>
      </div>
    </div>
  );
}
