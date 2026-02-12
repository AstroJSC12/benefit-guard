"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="h-full p-6 flex items-center justify-center bg-background">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center items-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle>We hit a snag in your dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try again. If this keeps happening, our team has already been notified.
          </p>
          {error.message && (
            <p className="text-xs text-muted-foreground/80 break-words">{error.message}</p>
          )}
          <Button onClick={reset}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
