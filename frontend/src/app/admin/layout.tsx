'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo/iimst_logo.jpg';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (token === null) return;
    if (!token) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
      return;
    }
  }, [token, isAdmin, router]);

  if (!token) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const nav = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/branches', label: 'Branches' },
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/results', label: 'Results' },
    { href: '/admin/enquiries', label: 'Enquiries' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src={logo} alt="IIMST" width={36} height={36} className="rounded-full object-cover" />
            <span className="font-bold text-iimst-orange">Admin</span>
          </Link>
        </div>
        <nav className="p-2 flex-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded-lg mb-1 ${
                pathname === n.href ? 'bg-iimst-orange-100 text-iimst-orange-dark font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-100">
          <Link href="/change-password" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Change password</Link>
          <button onClick={() => { logout(); router.push('/'); }} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
