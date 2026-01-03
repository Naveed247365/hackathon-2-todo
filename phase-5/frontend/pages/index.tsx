/**
 * Landing page with authentication redirect logic.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/todos');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>Redirecting...</p>
    </div>
  );
}
