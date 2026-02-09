"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHORTCUTS, getShortcutDisplay, type ShortcutCategory } from "@/lib/keyboard-shortcuts";

interface KeyboardShortcutsOverlayProps {
  onClose: () => void;
}

const CATEGORY_ORDER: ShortcutCategory[] = ["Navigation", "Chat", "Actions", "Documents", "General"];

function KbdKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-muted border border-border rounded-md text-[11px] font-mono font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsOverlay({ onClose }: KeyboardShortcutsOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    shortcuts: SHORTCUTS.filter((s) => s.category === cat),
  })).filter((g) => g.shortcuts.length > 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Keyboard Shortcuts</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => {
                  const keys = getShortcutDisplay(shortcut);
                  return (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm">{shortcut.label}</span>
                      <div className="flex items-center gap-1 ml-4">
                        {keys.map((key, i) => (
                          <span key={i} className="flex items-center gap-0.5">
                            {i > 0 && <span className="text-[10px] text-muted-foreground mx-0.5">+</span>}
                            <KbdKey>{key}</KbdKey>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/30 text-center">
          <p className="text-[11px] text-muted-foreground">
            Press <KbdKey>?</KbdKey> or <KbdKey>Esc</KbdKey> to close
          </p>
        </div>
      </div>
    </div>
  );
}
