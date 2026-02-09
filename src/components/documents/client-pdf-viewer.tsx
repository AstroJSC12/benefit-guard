"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading viewer...</p>
      </div>
    </div>
  ),
});

export function ClientPdfViewer({ url, fileName }: { url: string; fileName: string }) {
  return <PdfViewer url={url} fileName={fileName} />;
}
