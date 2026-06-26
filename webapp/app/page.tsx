'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-teal-600 text-xl animate-pulse">Redirigiendo...</div>
    </div>
  );
}
