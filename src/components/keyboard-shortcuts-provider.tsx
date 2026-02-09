"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { SHORTCUTS } from "@/lib/keyboard-shortcuts";
import { KeyboardShortcutsOverlay } from "./keyboard-shortcuts-overlay";
import { toast } from "sonner";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const sidebarVisibleRef = useRef(true);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't process if shortcuts overlay is open (it handles its own Esc/?)
      if (showShortcuts) return;

      for (const shortcut of SHORTCUTS) {
        if (shortcut.match(e)) {
          switch (shortcut.id) {
            // ─── General ──────────────────────────
            case "show-shortcuts":
              e.preventDefault();
              setShowShortcuts(true);
              return;

            // ─── Navigation ───────────────────────
            case "nav-home":
              e.preventDefault();
              router.push("/dashboard");
              return;
            case "nav-chat":
              e.preventDefault();
              router.push("/dashboard/chat");
              return;
            case "nav-documents":
              e.preventDefault();
              router.push("/dashboard/documents");
              return;
            case "nav-providers":
              e.preventDefault();
              router.push("/dashboard/providers");
              return;
            case "nav-settings":
            case "settings":
              e.preventDefault();
              router.push("/dashboard/settings");
              return;

            // ─── Chat ─────────────────────────────
            case "new-chat":
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("bg:new-chat"));
              return;
            case "search-chats":
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("bg:focus-search"));
              return;
            case "focus-input":
              e.preventDefault();
              const textarea = document.querySelector("textarea");
              if (textarea) textarea.focus();
              return;
            case "copy-last-response": {
              e.preventDefault();
              // Find the last assistant message card and copy its text
              const assistantCards = document.querySelectorAll("[data-role='assistant']");
              const lastCard = assistantCards[assistantCards.length - 1];
              if (lastCard) {
                const text = lastCard.textContent || "";
                navigator.clipboard.writeText(text).then(() => {
                  toast.success("Response copied to clipboard");
                });
              } else {
                toast.error("No AI response to copy");
              }
              return;
            }
            case "delete-chat": {
              e.preventDefault();
              // Extract conversation ID from pathname and dispatch delete
              const chatMatch = pathname.match(/\/dashboard\/chat\/(.+)/);
              if (chatMatch) {
                window.dispatchEvent(
                  new CustomEvent("bg:delete-chat", { detail: { id: chatMatch[1] } })
                );
              }
              return;
            }
            case "voice-record":
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("bg:toggle-voice"));
              return;

            // ─── Actions ──────────────────────────
            case "toggle-theme":
              e.preventDefault();
              setTheme(theme === "dark" ? "light" : "dark");
              return;
            case "toggle-sidebar": {
              e.preventDefault();
              const next = !sidebarVisibleRef.current;
              sidebarVisibleRef.current = next;
              setSidebarVisible(next);
              window.dispatchEvent(
                new CustomEvent("bg:toggle-sidebar", { detail: { visible: next } })
              );
              return;
            }
          }
        }
      }
    },
    [showShortcuts, router, pathname, theme, setTheme]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Listen for custom event from the ? button / dropdown menu
  useEffect(() => {
    const handleShowEvent = () => setShowShortcuts(true);
    window.addEventListener("bg:show-shortcuts", handleShowEvent);
    return () => window.removeEventListener("bg:show-shortcuts", handleShowEvent);
  }, []);

  return (
    <>
      {children}
      {showShortcuts && (
        <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
