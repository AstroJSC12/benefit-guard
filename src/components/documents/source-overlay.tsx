"use client";

import { useEffect, useState, useCallback } from "react";
import { X, FileText, Quote, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface SourceOverlayProps {
  documentId: string;
  chunkId: string;
  onClose: () => void;
}

/**
 * Break raw SBC chunk text into readable lines.
 * Splits on bullet characters (•, ●), numbered items,
 * SBC section headers, and long runs without breaks.
 */
function splitIntoLines(text: string): string[] {
  // Normalize whitespace but preserve intentional breaks
  let cleaned = text.replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n\n");

  // Split on bullet characters
  cleaned = cleaned.replace(/\s*[•●]\s*/g, "\n• ");

  // Split before SBC section headers
  cleaned = cleaned.replace(/(If you (?:need|have|are|visit|get)\b)/gi, "\n$1");
  cleaned = cleaned.replace(/(Your Rights to)/gi, "\n$1");
  cleaned = cleaned.replace(/(Published:)/gi, "\n$1");
  cleaned = cleaned.replace(/(Page \d+ of \d+)/gi, "\n$1");

  // Split on " - " used as separators in SBC tables
  cleaned = cleaned.replace(/\s+-\s+/g, "\n• ");

  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Highlight dollar amounts and coverage terms inline */
function highlightCosts(text: string): React.ReactNode[] {
  const parts = text.split(/(\$[\d,]+(?:\s*(?:copay|coinsurance|deductible|\/visit|\/day))?|not covered|no charge)/gi);
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    if (/^\$/.test(part)) {
      return <span key={i} className="font-semibold text-primary">{part}</span>;
    }
    if (lower === "not covered") {
      return <span key={i} className="font-semibold text-destructive">{part}</span>;
    }
    if (lower === "no charge") {
      return <span key={i} className="font-semibold text-green-600">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

/** Extract first N meaningful words for PDF search */
function extractSearchSnippet(text: string, wordCount = 5): string {
  // Remove page numbers, dates, URLs, and boilerplate
  const cleaned = text
    .replace(/Page \d+ of \d+/gi, "")
    .replace(/Published:\s*\S+/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\d{3}-\d{3}-\d{4}/g, "")
    .trim();

  const words = cleaned.split(/\s+/).filter((w) => w.length > 2);
  return words.slice(0, wordCount).join(" ");
}

export function SourceOverlay({ documentId, chunkId, onClose }: SourceOverlayProps) {
  const [excerpt, setExcerpt] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasPdf, setHasPdf] = useState(true);
  const [pdfSearch, setPdfSearch] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/chunk/${chunkId}`)
      .then((res) => res.json())
      .then((data) => {
        setExcerpt(data.content || null);
        setDocName(data.fileName || "Document");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/documents/${documentId}/pdf`, { method: "HEAD" })
      .then((res) => setHasPdf(res.ok))
      .catch(() => setHasPdf(false));
  }, [documentId, chunkId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const lines = excerpt ? splitIntoLines(excerpt) : [];
  const searchSnippet = excerpt ? extractSearchSnippet(excerpt) : "";

  const handleFindInPdf = () => {
    if (searchSnippet) {
      setPdfSearch(searchSnippet);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop — frosted glass */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate text-sm">{docName}</h2>
            <p className="text-[11px] text-muted-foreground">Source Document</p>
          </div>
          <p className="text-[11px] text-muted-foreground mr-2 hidden sm:block">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono border">Esc</kbd> to close
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive/10"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Excerpt panel */}
        {loading ? (
          <div className="p-4 border-b bg-primary/5 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          </div>
        ) : excerpt ? (
          <div className="border-b bg-primary/5 p-4 flex-shrink-0 max-h-52 overflow-y-auto">
            <div className="flex items-start gap-3">
              <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-primary">
                    BenefitGuard referenced this section:
                  </p>
                  {hasPdf && searchSnippet && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] px-2 gap-1 rounded-full"
                      onClick={handleFindInPdf}
                    >
                      <Search className="w-3 h-3" />
                      Find in PDF
                    </Button>
                  )}
                </div>
                <div className="bg-background rounded-lg border border-primary/20 p-3 space-y-1">
                  {lines.map((line, i) => {
                    const isBullet = line.startsWith("•");
                    const isHeader = /^if you (need|have|are|visit|get)\b/i.test(line);
                    const isMetadata = /^(Page \d|Published:)/i.test(line);

                    if (isMetadata) {
                      return (
                        <p key={i} className="text-[11px] text-muted-foreground/60 italic">
                          {line}
                        </p>
                      );
                    }
                    if (isHeader) {
                      return (
                        <p key={i} className="text-sm font-semibold text-foreground pt-1 border-t border-primary/10 mt-1">
                          {line}
                        </p>
                      );
                    }
                    if (isBullet) {
                      return (
                        <p key={i} className="text-sm text-foreground pl-2">
                          {highlightCosts(line)}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed text-foreground">
                        {highlightCosts(line)}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* PDF viewer */}
        <div className="flex-1 min-h-0">
          {hasPdf ? (
            <PdfViewer
              url={`/api/documents/${documentId}/pdf`}
              fileName={docName}
              initialSearch={pdfSearch}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">PDF not available — re-upload to enable viewing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
