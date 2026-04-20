import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex w-80 border-r bg-background h-full flex-col">
      <div className="p-4 border-b space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`sidebar-skeleton-${index}`}
              className="rounded-lg border p-3 space-y-2"
            >
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-4 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    </aside>
  );
}
