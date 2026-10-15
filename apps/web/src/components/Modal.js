'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-burgundy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-base w-full max-w-lg p-8 md:p-12 shadow-2xl z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-rose transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>
        {title && (
          <h2 className="text-3xl font-black uppercase tracking-tight text-text-primary mb-8">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
