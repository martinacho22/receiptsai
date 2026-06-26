'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/api';
import Layout from '@/components/Layout';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setAuthenticated(true);
    } else {
      // Allow access to login and register pages
      if (pathname === '/login' || pathname === '/register') {
        setAuthenticated(true);
      } else {
        router.push('/login');
      }
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-teal-600 text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  // Login/register pages — no layout wrapper
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  // Protected pages — wrap in Layout
  if (authenticated) {
    return <Layout>{children}</Layout>;
  }

  return null;
}
