"use client";

import { useEffect, useState } from 'react';

interface ToastProps {
  message?: string | null;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export function Toast({ message, type = 'info', duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (message) {
      const id = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(id);
    }
  }, [message, duration]);

  if (!message) return null;

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-[9999]">
      <div
        className={`max-w-xs rounded-lg px-4 py-2 shadow-lg text-sm font-medium ${
          type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-foreground text-background'
        } transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {message}
      </div>
    </div>
  );
}
