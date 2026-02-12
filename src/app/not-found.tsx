import Link from "next/link";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="size-7" />
          </div>
          <p className="text-sm font-medium text-primary">BenefitGuard</p>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
