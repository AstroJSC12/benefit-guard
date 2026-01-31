"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/conversations");
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
      } else {
        toast.error("Failed to create new chat. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Connection error. Please check your network.");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Confirm before deleting
    const confirmed = window.confirm(
      "Delete this conversation? This cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (pathname.includes(id)) {
          router.push("/dashboard/chat");
        }
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Connection error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Button 
          onClick={createNewConversation} 
          className="w-full" 
          size="lg"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </>
          )}
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-1">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
              Loading conversations...
            </div>
          ) : loadError ? (
            <div className="text-center py-8 px-4">
              <AlertCircle className="w-5 h-5 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-destructive mb-2">{loadError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsLoading(true);
                  fetchConversations();
                }}
              >
                Retry
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-sm text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Click "New Chat" to get started</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/chat/${conversation.id}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                    pathname.includes(conversation.id) ? "bg-muted" : ""
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">
                    {conversation.title}
                  </span>
                  <button
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded disabled:opacity-50"
                    disabled={deletingId === conversation.id}
                    title="Delete conversation"
                  >
                    {deletingId === conversation.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 text-destructive" />
                    )}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-2 space-y-1">
        <Link href="/dashboard/documents" onClick={() => setIsMobileOpen(false)}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
              pathname.includes("/documents") ? "bg-muted" : ""
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">My Documents</span>
          </div>
        </Link>
        <Link href="/dashboard/providers" onClick={() => setIsMobileOpen(false)}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
              pathname.includes("/providers") ? "bg-muted" : ""
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Find Providers</span>
          </div>
        </Link>
        <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
              pathname.includes("/settings") ? "bg-muted" : ""
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
