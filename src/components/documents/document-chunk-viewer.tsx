"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface Chunk {
  id: string;
  content: string;
  chunkIndex: number;
}

export function DocumentChunkViewer({
  chunks,
  highlightChunkId,
}: {
  chunks: Chunk[];
  highlightChunkId?: string;
}) {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightChunkId]);

  return (
    <div className="space-y-4">
      {chunks.map((chunk) => {
        const isHighlighted = chunk.id === highlightChunkId;
        return (
          <Card
            key={chunk.id}
            ref={isHighlighted ? highlightRef : undefined}
            id={`chunk-${chunk.id}`}
            className={`p-4 transition-colors ${
              isHighlighted
                ? "ring-2 ring-primary bg-primary/5"
                : "bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Section {chunk.chunkIndex + 1}
              </span>
              {isHighlighted && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Referenced by AI
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {chunk.content}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
