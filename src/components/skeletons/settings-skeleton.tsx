import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto pb-12 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`settings-tab-${index}`} className="h-10 w-full" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <Skeleton className="h-5 w-36" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>

        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
