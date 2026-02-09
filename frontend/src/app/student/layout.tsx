'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token === null) return; // wait for hydration
    if (!token) {
      router.replace('/login?redirect=/student');
      return;
    }
    if (!isStudent) {
      router.replace('/');
      return;
    }
  }, [token, isStudent, router]);

  if (!token) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-14">
          <Link href="/student" className="flex items-center gap-2">
            <Image src="/iimst_logo.jpg" alt="IIMST" width={36} height={36} className="rounded-full object-cover" />
            <span className="font-bold text-iimst-orange">Student Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.userName}</span>
            <Link href="/" className="text-sm text-gray-600 hover:text-iimst-orange">Home</Link>
            <Link href="/change-password" className="text-sm text-gray-600 hover:text-iimst-orange">Change password</Link>
            <button onClick={() => { logout(); router.push('/'); }} className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 max-w-6xl py-6">{children}</main>
    </div>
  );
}
