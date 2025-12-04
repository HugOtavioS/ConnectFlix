'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import apiService from '@/lib/apiService';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Se não estiver na página de auth e não tiver token, redireciona
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/auth';

      if (!isAuthPage && !apiService.isAuthenticated()) {
        router.push('/auth');
      }
    }
  }, [router]);

  return children;
}
