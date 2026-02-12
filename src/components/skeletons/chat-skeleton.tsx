import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />

            {Array.from({ length: 5 }).map((_, index) => {
              const isAssistant = index % 2 === 0;

              return (
                <div
                  key={`chat-skeleton-${index}`}
                  className={isAssistant ? "" : "ml-8"}
                >
                  <div
                    className={
                      isAssistant
                        ? "rounded-xl border bg-muted/40 p-4"
                        : "rounded-xl border bg-primary/5 p-4"
                    }
                  >
                    <div className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        {isAssistant && <Skeleton className="h-4 w-2/3" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30 p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
