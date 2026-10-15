'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { number: '01', text: 'Dashboard', href: '/' },
  { number: '02', text: 'Projects', href: '/projects' },
  { number: '03', text: 'Tailor Resume', href: '/tailor' },
  { number: '04', text: 'History', href: '/history' },
];

export default function OverlayMenu({ isOpen, onClose, onLogout }) {
  const pathname = usePathname();

  return (
    <div
      className={`fixed inset-0 z-50 bg-deep-teal text-text-light flex flex-col justify-center px-8 md:px-24 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:text-rose transition-colors cursor-pointer"
      >
        Close <X size={24} />
      </button>

      <nav className="flex flex-col gap-6 md:gap-10">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 text-left"
            >
              <span className="text-lg md:text-xl font-bold text-teal-muted tracking-widest uppercase">
                {item.number}.
              </span>
              <span
                className={`text-5xl md:text-7xl font-black uppercase tracking-tighter group-hover:text-rose group-hover:pl-4 transition-all duration-300 ${
                  isActive ? 'text-rose' : ''
                }`}
              >
                {item.text}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 left-8 md:left-24 flex gap-8 text-teal-muted font-bold text-sm tracking-widest uppercase">
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="hover:text-rose transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
