"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Fix text layer rendering — make text invisible by default (it's only for selection/search),
// and use mix-blend-mode for highlights so they blend with the canvas instead of covering it.
const textLayerStyles = `
  .react-pdf__Page__textContent.textLayer span {
    color: transparent !important;
    mix-blend-mode: multiply;
  }
  .react-pdf__Page__textContent.textLayer span::selection {
    background: rgba(0, 100, 255, 0.3);
    color: transparent;
  }
  .react-pdf__Page__textContent.textLayer .highlight {
    background: rgba(255, 200, 0, 0.4) !important;
    mix-blend-mode: multiply;
    border-radius: 2px;
  }
  .react-pdf__Page__textContent.textLayer .highlight-active {
    background: rgba(255, 120, 0, 0.6) !important;
    mix-blend-mode: multiply;
    border-radius: 2px;
  }
`;

interface PdfViewerProps {
  url: string;
  fileName?: string;
  initialSearch?: string;
}

export function PdfViewer({ url, fileName = "document.pdf", initialSearch }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialSearchApplied, setInitialSearchApplied] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const matchElements = useRef<HTMLElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  // Apply initial search after document loads
  useEffect(() => {
    if (initialSearch && !isLoading && numPages > 0 && !initialSearchApplied) {
      setSearchOpen(true);
      setSearchQuery(initialSearch);
      setInitialSearchApplied(true);
    }
  }, [initialSearch, isLoading, numPages, initialSearchApplied]);

  // Track which page is visible via scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute("data-page"));
            if (pageNum) setCurrentPage(pageNum);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  // Keyboard shortcuts for search and zoom
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
      // Zoom with = and - (no modifier needed), skip if user is typing
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setScale((s) => Math.min(2.5, s + 0.15));
        }
        if (e.key === "-") {
          e.preventDefault();
          setScale((s) => Math.max(0.5, s - 0.15));
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  // Collect and highlight search matches in text layer
  useEffect(() => {
    if (!containerRef.current) return;
    const textSpans = containerRef.current.querySelectorAll(".react-pdf__Page__textContent span");

    // Clear previous highlights
    textSpans.forEach((span) => {
      const el = span as HTMLElement;
      el.classList.remove("highlight", "highlight-active");
    });

    if (!searchQuery.trim()) {
      matchElements.current = [];
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: HTMLElement[] = [];

    textSpans.forEach((span) => {
      const el = span as HTMLElement;
      if (el.textContent?.toLowerCase().includes(query)) {
        el.classList.add("highlight");
        matches.push(el);
      }
    });

    matchElements.current = matches;
    setMatchCount(matches.length);
    setCurrentMatch(matches.length > 0 ? 1 : 0);

    // Highlight and scroll to first match
    if (matches.length > 0) {
      matches[0].classList.remove("highlight");
      matches[0].classList.add("highlight-active");
      matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchQuery, numPages]);

  // Update focused match highlighting when currentMatch changes
  useEffect(() => {
    const matches = matchElements.current;
    if (matches.length === 0 || currentMatch === 0) return;

    // Reset all to default highlight
    matches.forEach((el) => {
      el.classList.remove("highlight-active");
      el.classList.add("highlight");
    });

    // Highlight focused match
    const idx = currentMatch - 1;
    if (matches[idx]) {
      matches[idx].classList.remove("highlight");
      matches[idx].classList.add("highlight-active");
      matches[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatch]);

  const goToNextMatch = () => {
    if (matchCount === 0) return;
    setCurrentMatch((prev) => (prev >= matchCount ? 1 : prev + 1));
  };

  const goToPrevMatch = () => {
    if (matchCount === 0) return;
    setCurrentMatch((prev) => (prev <= 1 ? matchCount : prev - 1));
  };

  const goToPage = (page: number) => {
    const el = pageRefs.current.get(page);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const handlePrint = () => {
    const w = window.open(url);
    if (w) {
      w.addEventListener("load", () => w.print());
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Text layer highlight styles */}
      <style dangerouslySetInnerHTML={{ __html: textLayerStyles }} />

      {/* Custom toolbar */}
      <div className="flex items-center gap-1 px-3 py-2.5 bg-muted/60 border-b flex-shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[60px] text-center">
            {currentPage} / {numPages || "–"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => goToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Zoom */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.15))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search toggle */}
        <Button
          variant={searchOpen ? "secondary" : "ghost"}
          size="sm"
          className="h-8 rounded-full gap-1.5 text-xs px-3"
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
            else setSearchQuery("");
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Actions */}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleDownload} title="Download">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrint} title="Print">
          <Printer className="w-4 h-4" />
        </Button>
      </div>

      {/* Search bar — slides down when open */}
      {searchOpen && (
        <div className="px-3 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center gap-2 flex-shrink-0 animate-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-primary flex-shrink-0" />
          <Input
            ref={searchInputRef}
            placeholder="Search this document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                goToNextMatch();
              }
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                goToPrevMatch();
              }
            }}
            className="h-8 text-sm border-0 bg-background/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
          {/* Match count + navigation */}
          {searchQuery && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[50px] text-center">
                {matchCount > 0 ? `${currentMatch} of ${matchCount}` : "No matches"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={goToPrevMatch}
                disabled={matchCount === 0}
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={goToNextMatch}
                disabled={matchCount === 0}
                title="Next match (Enter)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              <button onClick={() => { setSearchQuery(""); setCurrentMatch(0); setMatchCount(0); }}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          {!searchQuery && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
              Enter = next · Shift+Enter = prev
            </span>
          )}
        </div>
      )}

      {/* Prompt to search — shown when search is NOT open */}
      {!searchOpen && !isLoading && (
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className="px-3 py-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 transition-all flex-shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          Click here or press <kbd className="px-1.5 py-0.5 bg-background/80 rounded text-[10px] font-mono border shadow-sm">⌘F</kbd> to search this document
        </button>
      )}

      {/* PDF pages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-stone-100 via-stone-200/60 to-stone-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading document...</p>
            </div>
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          className="flex flex-col items-center gap-6 py-6 px-4"
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div
              key={i + 1}
              ref={(el) => {
                if (el) pageRefs.current.set(i + 1, el);
              }}
              data-page={i + 1}
              className="shadow-lg shadow-black/10 rounded bg-white ring-1 ring-black/5"
            >
              <Page
                pageNumber={i + 1}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
