"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Plus,
  Trash2,
  FileText,
  MapPin,
  Settings,
  Menu,
  Loader2,
  AlertCircle,
  Search,
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  ChevronDown,
  Shield,
  X,
  Home,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";

interface Conversation {
  id: string;
  title: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

type TimeGroup = {
  label: string;
  conversations: Conversation[];
};

function groupByTime(conversations: Conversation[]): TimeGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  for (const c of conversations) {
    const d = new Date(c.updatedAt || c.createdAt);
    if (d >= today) groups["Today"].push(c);
    else if (d >= yesterday) groups["Yesterday"].push(c);
    else if (d >= weekAgo) groups["Previous 7 Days"].push(c);
    else groups["Older"].push(c);
  }

  return Object.entries(groups)
    .filter(([, convos]) => convos.length > 0)
    .map(([label, conversations]) => ({ label, conversations }));
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  // Re-fetch conversations when the user navigates to a different page
  // This keeps the sidebar in sync (e.g., after title auto-rename)
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      fetchConversations();
    }
  }, [pathname]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const fetchConversations = async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        setLoadError("Unable to load conversations");
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setLoadError("Connection error. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      if (response.ok) {
        const conversation = await response.json();
        setConversations((prev) => [conversation, ...prev]);
        router.push(`/dashboard/chat/${conversation.id}`);
        setIsMobileOpen(false);
        // Auto-focus the chat input after navigation settles
        setTimeout(() => window.dispatchEvent(new CustomEvent("bg:focus-input")), 300);
      } else {
        toast.error("Failed to create new chat.");
      }
    } catch {
      toast.error("Connection error.");
    } finally {
      setIsCreating(false);
    }
  };

  // Sidebar visibility (toggled via ⌘B)
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Listen for keyboard shortcut events
  // Using a ref so the effect registers once but always calls the latest function
  const createNewConversationRef = useRef(createNewConversation);
  createNewConversationRef.current = createNewConversation;
  const deleteConversationRef = useRef<(id: string) => Promise<void>>(null!);
  useEffect(() => {
    const handleNewChat = () => createNewConversationRef.current();
    const handleFocusSearch = () => searchInputRef.current?.focus();
    const handleToggleSidebar = (e: Event) => {
      const visible = (e as CustomEvent).detail?.visible;
      setSidebarHidden(!visible);
    };
    const handleDeleteChat = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (id) deleteConversationRef.current(id);
    };
    window.addEventListener("bg:new-chat", handleNewChat);
    window.addEventListener("bg:focus-search", handleFocusSearch);
    window.addEventListener("bg:toggle-sidebar", handleToggleSidebar);
    window.addEventListener("bg:delete-chat", handleDeleteChat);
    return () => {
      window.removeEventListener("bg:new-chat", handleNewChat);
      window.removeEventListener("bg:focus-search", handleFocusSearch);
      window.removeEventListener("bg:toggle-sidebar", handleToggleSidebar);
      window.removeEventListener("bg:delete-chat", handleDeleteChat);
    };
  }, []);

  const deleteConversation = async (id: string) => {
    setMenuOpenId(null);
    try {
      const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (pathname.includes(id)) router.push("/dashboard/chat");
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Connection error");
    }
  };
  deleteConversationRef.current = deleteConversation;

  const archiveConversation = async (id: string, archive: boolean) => {
    setMenuOpenId(null);
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive }),
      });
      if (response.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, archived: archive } : c))
        );
        toast.success(archive ? "Conversation archived" : "Conversation restored");
      }
    } catch {
      toast.error("Connection error");
    }
  };

  const renameConversation = async (id: string) => {
    const newTitle = renameValue.trim();
    setRenamingId(null);
    if (!newTitle) return;
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch {
      toast.error("Failed to rename");
    }
  };

  const startRename = (conv: Conversation) => {
    setMenuOpenId(null);
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  // Filter conversations
  const activeConvos = conversations.filter((c) => !c.archived);
  const archivedConvos = conversations.filter((c) => c.archived);
  const filteredActive = searchQuery
    ? activeConvos.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeConvos;
  const filteredArchived = searchQuery
    ? archivedConvos.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : archivedConvos;
  const timeGroups = groupByTime(filteredActive);

  const renderConvoItem = (conv: Conversation) => {
    const isActive = pathname.includes(conv.id);
    const isRenaming = renamingId === conv.id;

    return (
      <div key={conv.id} className="relative group">
        <Link
          href={`/dashboard/chat/${conv.id}`}
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => renameConversation(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameConversation(conv.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="w-full text-sm bg-background border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : (
                <>
                  <p className="text-sm truncate leading-tight">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {relativeTime(conv.updatedAt || conv.createdAt)}
                  </p>
                </>
              )}
            </div>
            {!isRenaming && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded flex-shrink-0 transition-opacity"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </Link>

        {/* Context menu */}
        {menuOpenId === conv.id && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              onClick={() => startRename(conv)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Rename
            </button>
            <button
              onClick={() => archiveConversation(conv.id, !conv.archived)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {conv.archived ? (
                <>
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  Archive
                </>
              )}
            </button>
            <div className="border-t my-1" />
            <button
              onClick={() => deleteConversation(conv.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand header — matches h-14 of DashboardHeader for visual alignment */}
      <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="block">
        <div className="h-14 px-4 border-b flex items-center gap-3 flex-shrink-0 hover:bg-muted/50 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-base tracking-tight">BenefitGuard</span>
        </div>
      </Link>

      {/* Chat History — collapsible section */}
      <div className="flex flex-col flex-1 min-h-0">
        <button
          onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full flex-shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat History</span>
          {conversations.length > 0 && (
            <span className="text-[10px] tabular-nums">({conversations.length})</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${chatHistoryOpen ? "" : "-rotate-90"}`} />
        </button>

        {chatHistoryOpen && (
          <>
            {/* New Chat + Search */}
            <div className="px-3 pb-1">
              <ShortcutTooltip shortcutId="new-chat" side="right">
                <Button
                  onClick={createNewConversation}
                  className="w-full"
                  size="sm"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  New Chat
                </Button>
              </ShortcutTooltip>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Conversation list */}
        <div className={`flex-1 overflow-y-auto px-2 ${chatHistoryOpen ? "" : "hidden"}`}>
        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-8 px-4">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-destructive" />
            <p className="text-xs text-destructive mb-2">{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsLoading(true); fetchConversations(); }}
            >
              Retry
            </Button>
          </div>
        ) : filteredActive.length === 0 && filteredArchived.length === 0 ? (
          <div className="text-center py-8 px-4 text-sm text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            {timeGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.conversations.map((conv) =>
                    renderConvoItem(conv)
                  )}
                </div>
              </div>
            ))}

            {/* Archived section */}
            {filteredArchived.length > 0 && (
              <div>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1 hover:text-foreground transition-colors w-full"
                >
                  <Archive className="w-3 h-3" />
                  Archived ({filteredArchived.length})
                  <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${showArchived ? "rotate-180" : ""}`} />
                </button>
                {showArchived && (
                  <div className="space-y-0.5">
                    {filteredArchived.map((conv) =>
                      renderConvoItem(conv)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Bottom nav — order matches ⌘1–5 */}
      <div className="border-t p-2 pb-3 space-y-0.5">
        <ShortcutTooltip shortcutId="nav-home" side="right">
          <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="block">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${pathname === "/dashboard" ? "bg-muted font-medium" : ""}`}>
              <Home className="w-4 h-4" />
              Home
            </div>
          </Link>
        </ShortcutTooltip>
        <ShortcutTooltip shortcutId="nav-chat" side="right">
          <Link href="/dashboard/chat" onClick={() => setIsMobileOpen(false)} className="block">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${pathname.includes("/chat") ? "bg-muted font-medium" : ""}`}>
              <MessageSquare className="w-4 h-4" />
              Chat
            </div>
          </Link>
        </ShortcutTooltip>
        <ShortcutTooltip shortcutId="nav-providers" side="right">
          <Link href="/dashboard/providers" onClick={() => setIsMobileOpen(false)} className="block">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${pathname.includes("/providers") ? "bg-muted font-medium" : ""}`}>
              <MapPin className="w-4 h-4" />
              Find Providers
            </div>
          </Link>
        </ShortcutTooltip>
        <ShortcutTooltip shortcutId="nav-documents" side="right">
          <Link href="/dashboard/documents" onClick={() => setIsMobileOpen(false)} className="block">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${pathname.includes("/documents") ? "bg-muted font-medium" : ""}`}>
              <FileText className="w-4 h-4" />
              My Documents
            </div>
          </Link>
        </ShortcutTooltip>
        <ShortcutTooltip shortcutId="nav-settings" side="right">
          <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="block">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${pathname.includes("/settings") ? "bg-muted font-medium" : ""}`}>
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </Link>
        </ShortcutTooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`md:flex w-72 border-r bg-muted/30 flex-col transition-all duration-200 ${sidebarHidden ? "hidden" : "hidden md:flex"}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
