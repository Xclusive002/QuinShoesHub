'use client';
import { ButtonHTMLAttributes } from 'react';
import { Spinner } from '@/components/spinner';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ loading, loadingText = 'Saving...', children, disabled, className = '', ...props }: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <>
          <Spinner className="h-4 w-4" light /> {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
