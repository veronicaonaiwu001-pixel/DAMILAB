export function ToolPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-white/5 rounded-lg mb-3" />
          <div className="h-5 w-96 bg-white/5 rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="glass-card p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 rounded-lg w-1/3" />
            <div className="h-64 bg-white/5 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-white/5 rounded-lg" />
              <div className="h-10 w-24 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="glass-card p-6 h-full border border-white/10 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl" />
        <div className="w-8 h-8 bg-white/5 rounded-full" />
      </div>
      <div className="h-6 bg-white/5 rounded-lg mb-2 w-3/4" />
      <div className="h-4 bg-white/5 rounded-lg mb-4 w-full" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-white/5 rounded" />
        <div className="h-5 w-16 bg-white/5 rounded" />
      </div>
    </div>
  );
}
