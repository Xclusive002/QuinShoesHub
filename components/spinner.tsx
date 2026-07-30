export function Spinner({ className = 'h-4 w-4', light = false }: { className?: string; light?: boolean }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12" cy="12" r="9"
        stroke={light ? 'currentColor' : 'var(--color-ember)'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42 14"
      />
    </svg>
  );
}
