"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ChatWidgetState {
  isOpen: boolean;
  conversationId: string | null;
  autoMessage: string | null;
}

interface ChatWidgetContextType {
  state: ChatWidgetState;
  openChat: (conversationId: string, autoMessage?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  clearAutoMessage: () => void;
  setConversationId: (id: string) => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatWidgetState>({
    isOpen: false,
    conversationId: null,
    autoMessage: null,
  });

  const openChat = useCallback((conversationId: string, autoMessage?: string) => {
    setState({
      isOpen: true,
      conversationId,
      autoMessage: autoMessage || null,
    });
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const clearAutoMessage = useCallback(() => {
    setState((prev) => ({ ...prev, autoMessage: null }));
  }, []);

  const setConversationId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, conversationId: id }));
  }, []);

  return (
    <ChatWidgetContext.Provider
      value={{ state, openChat, closeChat, toggleChat, clearAutoMessage, setConversationId }}
    >
      {children}
    </ChatWidgetContext.Provider>
  );
}

export function useChatWidget() {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error("useChatWidget must be used within ChatWidgetProvider");
  }
  return context;
}
