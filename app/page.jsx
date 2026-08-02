"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Arahkan otomatis ke halaman landing
    router.push('/landing');
  }, [router]);

  return null;
}