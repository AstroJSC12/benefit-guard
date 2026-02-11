import * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = React.ComponentProps<"div"> & {
  width?: number | string;
  height?: number | string;
};

function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export { Skeleton };
