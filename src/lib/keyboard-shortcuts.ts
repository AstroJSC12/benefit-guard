/**
 * Keyboard Shortcuts Registry
 *
 * Central definition of all keyboard shortcuts in the app.
 * The UI detects Mac vs Windows at runtime and shows the right symbols.
 *
 * Design principles:
 * - Navigation is numbered ⌘1–5, matching sidebar order (muscle memory)
 * - Power shortcuts use ⌘+Shift (reward power users, don't confuse beginners)
 * - Single-key shortcuts (N, /, ?) only fire outside text inputs
 * - ⌘, and ⌘. follow universal OS/editor conventions
 */

export type ShortcutCategory = "General" | "Navigation" | "Chat" | "Actions" | "Documents";

export interface Shortcut {
  id: string;
  label: string;
  category: ShortcutCategory;
  keys: {
    mac: string[];
    win: string[];
  };
  /** The actual key combo to listen for */
  match: (e: KeyboardEvent) => boolean;
}

export const SHORTCUTS: Shortcut[] = [
  // ─── General ────────────────────────────────────
  {
    id: "show-shortcuts",
    label: "Show keyboard shortcuts",
    category: "General",
    keys: { mac: ["?"], win: ["?"] },
    match: (e) => e.key === "?" && !isTyping(e),
  },
  {
    id: "close",
    label: "Close overlay / cancel",
    category: "General",
    keys: { mac: ["Esc"], win: ["Esc"] },
    match: (e) => e.key === "Escape",
  },

  // ─── Navigation (⌘1–5 matches sidebar top→bottom) ──
  {
    id: "nav-home",
    label: "Go to Home",
    category: "Navigation",
    keys: { mac: ["⌘", "1"], win: ["Ctrl", "1"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "1",
  },
  {
    id: "nav-chat",
    label: "Go to Chat",
    category: "Navigation",
    keys: { mac: ["⌘", "2"], win: ["Ctrl", "2"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "2",
  },
  {
    id: "nav-providers",
    label: "Go to Providers",
    category: "Navigation",
    keys: { mac: ["⌘", "3"], win: ["Ctrl", "3"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "3",
  },
  {
    id: "nav-documents",
    label: "Go to Documents",
    category: "Navigation",
    keys: { mac: ["⌘", "4"], win: ["Ctrl", "4"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "4",
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    category: "Navigation",
    keys: { mac: ["⌘", "5"], win: ["Ctrl", "5"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "5",
  },
  {
    id: "settings",
    label: "Open Settings",
    category: "Navigation",
    keys: { mac: ["⌘", ","], win: ["Ctrl", ","] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === ",",
  },

  // ─── Chat ───────────────────────────────────────
  {
    id: "new-chat",
    label: "New chat",
    category: "Chat",
    keys: { mac: ["N"], win: ["N"] },
    match: (e) => e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e),
  },
  {
    id: "search-chats",
    label: "Search conversations",
    category: "Chat",
    keys: { mac: ["⌘", "K"], win: ["Ctrl", "K"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "k",
  },
  {
    id: "focus-input",
    label: "Focus chat input",
    category: "Chat",
    keys: { mac: ["/"], win: ["/"] },
    match: (e) => e.key === "/" && !isTyping(e),
  },
  {
    id: "copy-last-response",
    label: "Copy last AI response",
    category: "Chat",
    keys: { mac: ["⌘", "⇧", "C"], win: ["Ctrl", "Shift", "C"] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "C",
  },
  {
    id: "delete-chat",
    label: "Delete current chat",
    category: "Chat",
    keys: { mac: ["⌘", "⇧", "⌫"], win: ["Ctrl", "Shift", "Backspace"] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Backspace",
  },
  {
    id: "voice-record",
    label: "Start / stop voice input",
    category: "Chat",
    keys: { mac: ["⌘", "⇧", "M"], win: ["Ctrl", "Shift", "M"] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "M",
  },

  // ─── Actions ────────────────────────────────────
  {
    id: "toggle-theme",
    label: "Toggle dark / light mode",
    category: "Actions",
    keys: { mac: ["⌘", "."], win: ["Ctrl", "."] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === ".",
  },
  {
    id: "toggle-sidebar",
    label: "Toggle sidebar",
    category: "Actions",
    keys: { mac: ["⌘", "B"], win: ["Ctrl", "B"] },
    match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "b",
  },

  // ─── Documents ──────────────────────────────────
  {
    id: "search-document",
    label: "Search in document",
    category: "Documents",
    keys: { mac: ["⌘", "F"], win: ["Ctrl", "F"] },
    match: (e) => (e.metaKey || e.ctrlKey) && e.key === "f",
  },
];

/** Check if the user is typing in an input/textarea */
function isTyping(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((e.target as HTMLElement)?.isContentEditable) return true;
  return false;
}

/** Detect if the user is on Mac */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

/** Get the display keys for a shortcut based on current platform */
export function getShortcutDisplay(shortcut: Shortcut): string[] {
  return isMac() ? shortcut.keys.mac : shortcut.keys.win;
}

/** Find a shortcut by ID */
export function getShortcutById(id: string): Shortcut | undefined {
  return SHORTCUTS.find((s) => s.id === id);
}

/** Get display keys by shortcut ID */
export function getKeysById(id: string): string[] {
  const s = getShortcutById(id);
  return s ? getShortcutDisplay(s) : [];
}
