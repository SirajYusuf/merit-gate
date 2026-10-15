'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-deep-teal leading-[0.9] mb-4">
        Welcome<br />Back<span className="text-rose">.</span>
      </h1>
      <p className="text-xl text-text-body font-medium mb-12">
        Sign in to your Merit Gate account.
      </p>

      {error && (
        <div className="border-l-4 border-status-failed bg-status-failed/10 px-5 py-4 mb-8">
          <p className="text-sm font-bold text-status-failed">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-transparent border-b-2 border-deep-teal/20 focus:border-rose outline-none py-4 text-2xl font-bold text-deep-teal placeholder-deep-teal/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-transparent border-b-2 border-deep-teal/20 focus:border-rose outline-none py-4 text-2xl font-bold text-deep-teal placeholder-deep-teal/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-deep-teal text-white px-8 py-5 text-lg font-bold uppercase tracking-widest hover:bg-rose transition-colors flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>Signing In <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /></>
          ) : (
            <>Sign In <ChevronRight size={24} /></>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-text-body font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-rose font-bold uppercase tracking-widest text-sm hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
