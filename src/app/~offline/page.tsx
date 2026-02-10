"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
          <WifiOff className="h-10 w-10 text-teal-700 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You&apos;re Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          It looks like you&apos;ve lost your internet connection. Some features
          of BenefitGuard require an active connection to work.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
