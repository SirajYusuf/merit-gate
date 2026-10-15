'use client';

import { Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';

export default function Header({ onMenuOpen }) {
  return (
    <header className="fixed top-0 left-0 w-full z-40 p-6 flex justify-between items-center mix-blend-difference text-[#f4f5f5]">
      <Link
        href="/"
        className="font-black text-2xl tracking-tighter cursor-pointer uppercase"
      >
        Merit Gate.
      </Link>
      <button
        onClick={onMenuOpen}
        className="flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity cursor-pointer"
      >
        Menu <MenuIcon size={24} />
      </button>
    </header>
  );
}
