'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(userNameOrEmail, password);
      login(
        {
          userName: res.userName,
          email: res.email,
          role: res.role,
          studentId: res.studentId,
        },
        res.token
      );
      if (res.role === 'Admin') router.push('/admin');
      else if (res.role === 'Student') router.push('/student');
      else router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-iimst-orange-50 to-orange-100/50 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/iimst_logo.jpg" alt="IIMST" width={48} height={48} className="rounded-full object-cover" />
        <span className="font-bold text-iimst-orange-dark">IIMST Portal</span>
      </Link>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
            <input
              type="text"
              value={userNameOrEmail}
              onChange={(e) => setUserNameOrEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-iimst-orange hover:bg-iimst-orange-dark text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/" className="text-iimst-orange hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
