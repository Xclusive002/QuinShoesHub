export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-sm border border-border bg-card">
      <div className="aspect-square bg-muted" />
      <div className="space-y-3 px-5 pb-5 pt-4">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-6 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
