'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import Header from '@/components/Header';
import OverlayMenu from '@/components/OverlayMenu';
import { ToastProvider } from '@/components/Toast';

export default function AppLayout({ children }) {
  const { user, loading, logout } = useRequireAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-deep-teal/20 border-t-deep-teal rounded-full animate-spin mx-auto mb-6" />
          <p className="text-sm font-bold uppercase tracking-widest text-teal-muted">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="bg-base min-h-screen text-text-primary overflow-x-hidden">
        <Header onMenuOpen={() => setMenuOpen(true)} />
        <OverlayMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
        <main className="pt-20">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
