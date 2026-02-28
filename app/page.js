'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to feed (or login if not authenticated)
    router.replace('/feed');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ textAlign: 'center', animation: 'pulse 1.5s infinite' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            background: 'var(--gradient-ig)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Instagram
        </h1>
      </div>
    </div>
  );
}
